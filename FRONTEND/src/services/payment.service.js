import api from './api';

export const paymentService = {
    createPayment: async (orderId) => {
        return api.post('/payment/create', { order_id: orderId });
    },

    verifyPayment: async (payload) => {
        return api.post('/payment/verify', payload);
    },
};

export default paymentService;
