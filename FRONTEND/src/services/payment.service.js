import api from './api';

export const paymentService = {
    createPayment: async (orderId) => {
        const res = await api.post('/payment/create', { order_id: orderId });
        return res.data;
    },

    verifyPayment: async (payload) => {
        const res = await api.post('/payment/verify', payload);
        return res.data;
    },
};

export default paymentService;
