import api from './api';

export const orderService = {
    placeOrder: async (addressId, paymentMethod) => {
        return api.post('/orders', {
            address_id: addressId,
            payment_method: paymentMethod,
        });
    },

    buyNow: async (productId, quantity, addressId, paymentMethod) => {
        return api.post('/orders/buy-now', {
            product_id: productId,
            quantity,
            address_id: addressId,
            payment_method: paymentMethod,
        });
    },

    getMyOrders: async (params = {}) => {
        return api.get('/orders', { params });
    },

    getOrder: async (orderId) => {
        return api.get(`/orders/${orderId}`);
    },

    cancelOrder: async (orderId) => {
        return api.patch(`/orders/${orderId}/cancel`);
    },

    getAllOrders: async (params = {}) => {
        return api.get('/admin/orders', { params });
    },

    getAdminOrder: async (orderId) => {
        return api.get(`/admin/orders/${orderId}`);
    },

    updateOrderStatus: async (orderId, status) => {
        return api.patch(`/admin/orders/${orderId}/status`, { status });
    },

    adminCancelOrder: async (orderId) => {
        return api.patch(`/admin/orders/${orderId}/cancel`);
    },
};

export default orderService;
