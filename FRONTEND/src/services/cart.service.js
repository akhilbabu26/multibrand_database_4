import api from './api';

export const cartService = {
    /**
     * Get user's cart
     */
    getCart: async () => {
        return api.get('/cart');
    },

    /**
     * Add product to cart
     */
    addToCart: async (productId, quantity = 1) => {
        const id = encodeURIComponent(String(productId));
        return api.post(`/cart/${id}`, { quantity });
    },

    /**
     * Update product quantity in cart
     */
    updateQuantity: async (productId, quantity) => {
        const id = encodeURIComponent(String(productId));
        return api.patch(`/cart/${id}`, { quantity });
    },

    /**
     * Remove product from cart
     */
    removeFromCart: async (productId) => {
        const id = encodeURIComponent(String(productId));
        return api.delete(`/cart/${id}`);
    },

    /**
     * Clear entire cart
     */
    clearCart: async () => {
        return api.delete('/cart');
    },
};

export default cartService;