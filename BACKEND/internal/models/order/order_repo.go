package domain

import "gorm.io/gorm"

type OrderRepository interface {
	WithTx(tx *gorm.DB) OrderRepository
	// order
	Create(order *Order) error
	FindByID(id uint) (*Order, error)
	FindByUserID(userID uint, page, limit int) ([]*Order, int64, error)
	FindAll(page, limit int) ([]*Order, int64, error)
	UpdateStatus(id uint, status OrderStatus) error
	UpdatePayment(id uint, paymentStatus PaymentStatus, razorpayPaymentID string) error
	UpdateRazorpayOrderID(id uint, razorpayOrderID string) error

	// order items
	CreateItems(items []OrderItem) error
}

type OrderUsecase interface {
	// User
	PlaceOrder(userID uint, req PlaceOrderRequest) (*OrderResponse, error)
	BuyNow(userID uint, req BuyNowRequest) (*OrderResponse, error)  
	CancelOrder(userID, orderID uint) error
	GetOrder(userID, orderID uint) (*OrderResponse, error)
	GetMyOrders(userID uint, page, limit int) ([]*OrderResponse, int64, error)

	// admin
	GetAllOrders(page, limit int) ([]*OrderResponse, int64, error)
	AdminGetOrder(orderID uint) (*OrderResponse, error) 
	UpdateOrderStatus(orderID uint, req UpdateOrderStatusRequest) error
	AdminCancelOrder(orderID uint) error
}
