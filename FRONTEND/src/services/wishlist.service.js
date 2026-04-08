import api from './api';

export const wishlistService = {
    /**
     * Get user's wishlist
     */
    getWishlist: async () => {
        return api.get('/wishlist');
    },

    /**
     * Add product to wishlist
     */
    addToWishlist: async (productId) => {
        const id = encodeURIComponent(String(productId));
        return api.post(`/wishlist/${id}`);
    },

    /**
     * Remove product from wishlist
     */
    removeFromWishlist: async (productId) => {
        const id = encodeURIComponent(String(productId));
        return api.delete(`/wishlist/${id}`);
    },

    /**
     * Move from wishlist to cart
     */
    moveToCart: async (productId) => {
        const id = encodeURIComponent(String(productId));
        return api.post(`/wishlist/${id}/move-to-cart`);
    },
};

export default wishlistService;