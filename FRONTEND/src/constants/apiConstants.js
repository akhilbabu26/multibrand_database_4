/** @typedef {'cod' | 'razorpay'} PaymentMethod */

export const PAYMENT_METHOD = {
  COD: 'cod',
  RAZORPAY: 'razorpay',
};

export const ORDER_STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
