import api from './api';

const cartService = {
    getCart: async () => {
        const res = await api.get('/cart');
        return res.data;
    },

    addToCart: async (productId, quantity = 1) => {
        const res = await api.post(`/cart/${productId}`, { quantity });
        return res.data;
    },

    updateQuantity: async (productId, quantity) => {
        const res = await api.patch(`/cart/${productId}`, { quantity });
        return res.data;
    },

    removeFromCart: async (productId) => {
        const res = await api.delete(`/cart/${productId}`);
        return res.data;
    },

    clearCart: async () => {
        const res = await api.delete('/cart');
        return res.data;
    },
};

export default cartService;