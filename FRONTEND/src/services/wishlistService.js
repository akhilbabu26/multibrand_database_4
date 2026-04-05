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
            const id = encodeURIComponent(String(productId));
            const res = await api.post(`/wishlist/${id}`);
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
            const id = encodeURIComponent(String(productId));
            const res = await api.delete(`/wishlist/${id}`);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    moveToCart: async (productId) => {
        try {
            const id = encodeURIComponent(String(productId));
            const res = await api.post(`/wishlist/${id}/move-to-cart`);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default wishlistService;
