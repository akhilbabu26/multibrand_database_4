import axios from 'axios';

const rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const baseURL = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`;

// Axios instance — paths are relative to /api/v1 (matches Go gin group)
const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

import { toCamelCase } from '../lib/stringUtils';

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// REQUEST INTERCEPTOR - Attach Authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
// RESPONSE INTERCEPTOR - Handle envelope unwrapping and 401 refresh
api.interceptors.response.use(
    (response) => {
        // Automatically unwrap the standard Go backend response envelope
        // Expected format: { success: true, message: "...", data: { ... } }
        if (response.data && response.data.data !== undefined && response.data.success !== undefined) {
             console.debug(`[API] Unwrapping and transforming response for ${response.config.url}`);
             return toCamelCase(response.data.data);
        }
        return toCamelCase(response.data);
    },
    async (error) => {
        const originalRequest = error.config;
        const url = originalRequest?.url || "";
        const isAuthRoute = url.startsWith('/auth/');
        const isAlreadyOnLogin = window.location.pathname === "/login";

        // If 401 and not already retrying AND not an auth route
        if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
            if (isRefreshing) {
                // Queue the request if already refreshing
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                console.debug("[API] Attempting to refresh access token...");
                // Get new access token
                const response = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`,
                    { refresh_token: refreshToken }
                );

                const { access_token } = response.data?.data ?? response.data;
                localStorage.setItem('access_token', access_token);
                api.defaults.headers.Authorization = `Bearer ${access_token}`;
                
                processQueue(null, access_token);
                
                console.debug("[API] Token refresh successful. Retrying original request.");
                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);

            } catch (err) {
                // Refresh failed - logout user
                console.error("[API] Token refresh failed. Clearing session and redirecting to login.", err);
                processQueue(err, null);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                
                // Only redirect to login if we are NOT already there
                if (!isAlreadyOnLogin) {
                    window.location.href = "/login";
                }
                return Promise.reject(err);
                
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
