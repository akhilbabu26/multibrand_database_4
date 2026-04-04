import api from './api';

export const orderService = {
    /**
     * Place order from cart
     */
    placeOrder: async (shippingAddressId) => {
        try {
            const res = await api.post('/orders', { shipping_address_id: shippingAddressId });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Buy single product directly
     */
    buyNow: async (productId, quantity, shippingAddressId) => {
        try {
            const res = await api.post('/orders/buy-now', {
                product_id: productId,
                quantity,
                shipping_address_id: shippingAddressId,
            });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user's orders
     */
    getMyOrders: async () => {
        try {
            const res = await api.get('/orders');
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get order details
     */
    getOrder: async (orderId) => {
        try {
            const res = await api.get(`/orders/${orderId}`);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Cancel order
     */
    cancelOrder: async (orderId) => {
        try {
            const res = await api.patch(`/orders/${orderId}/cancel`);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ADMIN ENDPOINTS
    /**
     * Get all orders (admin)
     */
    getAllOrders: async (filters = {}) => {
        try {
            const res = await api.get('/admin/orders', { params: filters });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get order details (admin)
     */
    getAdminOrder: async (orderId) => {
        try {
            const res = await api.get(`/admin/orders/${orderId}`);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update order status (admin)
     */
    updateOrderStatus: async (orderId, status) => {
        try {
            const res = await api.patch(`/admin/orders/${orderId}/status`, { status });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Cancel order (admin)
     */
    adminCancelOrder: async (orderId) => {
        try {
            const res = await api.patch(`/admin/orders/${orderId}/cancel`);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default orderService;
