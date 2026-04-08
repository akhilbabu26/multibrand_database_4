import api from './api';

export const authService = {
    /**
     * Signup user and send OTP
     */
    signup: async (name, email, password, cPassword) => {
        return api.post('/auth/signup', {
            name,
            email,
            password,
            cPassword,
        });
    },

    /**
     * Verify OTP and create account
     */
    verifyOTP: async (email, otp) => {
        return api.post('/auth/verify-otp', { email, otp });
    },

    /**
     * Login user and store tokens
     */
    login: async (email, password) => {
        const data = await api.post('/auth/login', { email, password });
        const { access_token, refresh_token } = data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // Fetch user profile after login
        const user = await api.get('/user/profile');
        localStorage.setItem('user', JSON.stringify(user));

        return { ...data, user };
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
        return api.post('/auth/forgot-password', { email });
    },

    /**
     * Reset password with token
     */
    resetPassword: async (email, otp, password, cpassword) => {
        return api.post('/auth/reset-password', {
            email,
            otp,
            new_password: password,
            confirm_password: cpassword,
        });
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
