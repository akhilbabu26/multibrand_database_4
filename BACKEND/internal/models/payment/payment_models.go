package domain

type CreatePaymentRequest struct {
	OrderID uint `json:"order_id" binding:"required"`
}

type CreatePaymentResponse struct {
	RazorpayOrderID string  `json:"razorpay_order_id"`
	Amount          float64 `json:"amount"`
	Currency        string  `json:"currency"`
	KeyID           string  `json:"key_id"`
}

type VerifyPaymentRequest struct {
	OrderID           uint   `json:"order_id" binding:"required"`
	RazorpayOrderID   string `json:"razorpay_order_id" binding:"required"`
	RazorpayPaymentID string `json:"razorpay_payment_id" binding:"required"`
	RazorpaySignature string `json:"razorpay_signature" binding:"required"`
}

type PaymentUsecase interface {
	CreatePayment(userID uint, req CreatePaymentRequest) (*CreatePaymentResponse, error)
	VerifyPayment(userID uint, req VerifyPaymentRequest) error
}
