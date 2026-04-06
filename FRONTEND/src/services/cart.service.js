import api from './api';

export const cartService = {
    /**
     * Get user's cart
     */
    getCart: async () => {
        try {
            const res = await api.get('/cart');
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Add product to cart
     */
    addToCart: async (productId, quantity = 1) => {
        try {
            const id = encodeURIComponent(String(productId));
            const res = await api.post(`/cart/${id}`, { quantity });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update product quantity in cart
     */
    updateQuantity: async (productId, quantity) => {
        try {
            const id = encodeURIComponent(String(productId));
            const res = await api.patch(`/cart/${id}`, { quantity });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Remove product from cart
     */
    removeFromCart: async (productId) => {
        try {
            const id = encodeURIComponent(String(productId));
            const res = await api.delete(`/cart/${id}`);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Clear entire cart
     */
    clearCart: async () => {
        try {
            const res = await api.delete('/cart');
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default cartService;