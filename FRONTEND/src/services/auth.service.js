import api from './api';
import { unwrapData } from '../lib/http';

export const authService = {
    /**
     * Signup user and send OTP
     */
    signup: async (name, email, password, cPassword) => {
        try {
            const res = await api.post('/auth/signup', {
                name,
                email,
                password,
                cPassword,
            });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Verify OTP and create account
     */
    verifyOTP: async (email, otp) => {
        try {
            const res = await api.post('/auth/verify-otp', { email, otp });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Login user and store tokens
     */
    login: async (email, password) => {
    try {
        const res = await api.post('/auth/login', { email, password });
        const { access_token, refresh_token } = res.data.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // Fetch user profile after login
        const userRes = await api.get('/user/profile');
        const user = unwrapData(userRes.data);
        localStorage.setItem('user', JSON.stringify(user));

        return { ...res.data, user };
    } catch (error) {
        throw error.response?.data || error;
    }
},

    /**
     * Logout user
     */
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear tokens regardless of request success
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        }
    },

    /**
     * Send password reset email
     */
    forgotPassword: async (email) => {
        try {
            const res = await api.post('/auth/forgot-password', { email });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Reset password with token
     */
    resetPassword: async (email, otp, password, cpassword) => {
        try {
            const res = await api.post('/auth/reset-password', {
                email,
                otp,
                new_password: password,
                confirm_password: cpassword,
            });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
},

    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    },

    /**
     * Get stored access token
     */
    getToken: () => {
        return localStorage.getItem('access_token');
    },
};

export default authService;
