import api from './api';

export const productService = {
    /**
     * Get all products with optional filters
     * @param {Object} filters - { search, category, minPrice, maxPrice, page, limit }
     */
    getProducts: async (filters = {}) => {
        return api.get('/products', { params: filters });
    },

    /**
     * Get single product by ID
     */
    getProductById: async (id) => {
        return api.get(`/products/${id}`);
    },

    /**
     * Create product (admin only)
     * Expects FormData with image files
     */
    createProduct: async (formData) => {
        return api.post('/admin/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /**
     * Update product (admin only)
     */
    updateProduct: async (id, formData) => {
        return api.patch(`/admin/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /**
     * Delete product (admin only)
     */
    deleteProduct: async (id) => {
        return api.delete(`/admin/products/${id}`);
    },

    /**
     * Get all products (admin view with more details)
     */
    getAdminProducts: async (filters = {}) => {
        return api.get('/admin/products', { params: filters });
    },

    /**
     * Get single product (admin view)
     */
    getAdminProductById: async (id) => {
        return api.get(`/admin/products/${id}`);
    },
    
    getMetadata: async () => {
        return api.get('/products/metadata');
    },
}

export default productService;
