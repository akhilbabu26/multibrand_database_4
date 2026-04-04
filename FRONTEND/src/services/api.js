import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: {
        'Content-Type': 'application/json',
    },
});

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

// REQUEST INTERCEPTOR - Add token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// RESPONSE INTERCEPTOR - Handle 401 and refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
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

                // Get new access token
                const response = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`,
                    { refresh_token: refreshToken }
                );

                const { access_token } = response.data.data;
                localStorage.setItem('access_token', access_token);
                api.defaults.headers.Authorization = `Bearer ${access_token}`;
                
                processQueue(null, access_token);
                
                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);

            } catch (err) {
                // Refresh failed - logout user
                processQueue(err, null);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                
                // Redirect to login
                window.location.href = '/login';
                return Promise.reject(err);
                
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
