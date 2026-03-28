package domain

type OrderRepository interface {
	// order
	Create(order *Order) error
	FindByID(id uint) (*Order, error)
	FindByUserID(userID uint) ([]*Order, error)
	FindAll() ([]*Order, error)
	UpdateStatus(id uint, status OrderStatus) error
	UpdatePayment(id uint, paymentStatus PaymentStatus, razorpayPaymentID string) error
	UpdateRazorpayOrderID(id uint, razorpayOrderID string) error

	// order items
	CreateItems(items []OrderItem) error
}

type OrderUsecase interface {
	// customer
	PlaceOrder(userID uint, req PlaceOrderRequest) (*OrderResponse, error)
	BuyNow(userID uint, req BuyNowRequest) (*OrderResponse, error)  
	CancelOrder(userID, orderID uint) error
	GetOrder(userID, orderID uint) (*OrderResponse, error)
	GetMyOrders(userID uint) ([]*OrderResponse, error)

	// payment
	VerifyPayment(userID uint, req VerifyPaymentRequest) error

	// admin
	GetAllOrders() ([]*OrderResponse, error)
	AdminGetOrder(orderID uint) (*OrderResponse, error) 
	UpdateOrderStatus(orderID uint, req UpdateOrderStatusRequest) error
	AdminCancelOrder(orderID uint) error
}
