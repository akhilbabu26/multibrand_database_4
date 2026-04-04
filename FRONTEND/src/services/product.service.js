import api from './api';

export const productService = {
    /**
     * Get all products with optional filters
     * @param {Object} filters - { search, category, minPrice, maxPrice, page, limit }
     */
    getProducts: async (filters = {}) => {
        try {
            const res = await api.get('/products', { params: filters });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get single product by ID
     */
    getProductById: async (id) => {
        try {
            const res = await api.get(`/products/${id}`);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create product (admin only)
     * Expects FormData with image files
     */
    createProduct: async (formData) => {
        try {
            const res = await api.post('/admin/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update product (admin only)
     */
    updateProduct: async (id, formData) => {
        try {
            const res = await api.patch(`/admin/products/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete product (admin only)
     */
    deleteProduct: async (id) => {
        try {
            const res = await api.delete(`/admin/products/${id}`);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get all products (admin view with more details)
     */
    getAdminProducts: async (filters = {}) => {
        try {
            const res = await api.get('/admin/products', { params: filters });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get single product (admin view)
     */
    getAdminProductById: async (id) => {
        try {
            const res = await api.get(`/admin/products/${id}`);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default productService;
