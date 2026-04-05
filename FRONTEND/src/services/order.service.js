import api from './api';

export const orderService = {
    placeOrder: async (addressId, paymentMethod) => {
        const res = await api.post('/orders', {
            address_id: addressId,
            payment_method: paymentMethod,
        });
        return res.data;
    },

    buyNow: async (productId, quantity, addressId, paymentMethod) => {
        const res = await api.post('/orders/buy-now', {
            product_id: productId,
            quantity,
            address_id: addressId,
            payment_method: paymentMethod,
        });
        return res.data;
    },

    getMyOrders: async (params = {}) => {
        const res = await api.get('/orders', { params });
        return res.data;
    },

    getOrder: async (orderId) => {
        const res = await api.get(`/orders/${orderId}`);
        return res.data;
    },

    cancelOrder: async (orderId) => {
        const res = await api.patch(`/orders/${orderId}/cancel`);
        return res.data;
    },

    getAllOrders: async (params = {}) => {
        const res = await api.get('/admin/orders', { params });
        return res.data;
    },

    getAdminOrder: async (orderId) => {
        const res = await api.get(`/admin/orders/${orderId}`);
        return res.data;
    },

    updateOrderStatus: async (orderId, status) => {
        const res = await api.patch(`/admin/orders/${orderId}/status`, { status });
        return res.data;
    },

    adminCancelOrder: async (orderId) => {
        const res = await api.patch(`/admin/orders/${orderId}/cancel`);
        return res.data;
    },
};

export default orderService;
