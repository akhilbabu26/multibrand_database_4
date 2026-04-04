import api from './api';

export const wishlistService = {
    /**
     * Get user's wishlist
     */
    getWishlist: async () => {
        try {
            const res = await api.get('/wishlist');
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Add product to wishlist
     */
    addToWishlist: async (productId) => {
        try {
            const res = await api.post(`/wishlist/${productId}`);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Remove product from wishlist
     */
    removeFromWishlist: async (productId) => {
        try {
            const res = await api.delete(`/wishlist/${productId}`);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default wishlistService;
