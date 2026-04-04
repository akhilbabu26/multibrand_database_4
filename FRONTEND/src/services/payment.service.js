import api from './api';

export const paymentService = {
    /**
     * Create payment (initiate Razorpay)
     */
    createPayment: async (orderId, amount) => {
        try {
            const res = await api.post('/payment/create', {
                order_id: orderId,
                amount,
            });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Verify payment after Razorpay callback
     */
    verifyPayment: async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
        try {
            const res = await api.post('/payment/verify', {
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: razorpayPaymentId,
                razorpay_signature: razorpaySignature,
            });
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default paymentService;
