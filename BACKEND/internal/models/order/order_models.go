package domain

import "time"

// -----ENUMS-----

type OrderStatus string
type PaymentMethod string
type PaymentStatus string

const (
	//order status
	OrderStatusPending OrderStatus = "pending"
	OrderStatusConfirmed OrderStatus = "confirmed"
	OrderStatusShipped OrderStatus = "shipped"
	OrderStatusDelivered OrderStatus = "delivered"
	OrderStatusCancelled OrderStatus = "cancelled"

	// payment methods
	PaymentMethodsCOD PaymentMethod = "cod" 
	PaymentMethodRazorpay PaymentMethod = "razorpay"

	//payment status
	PaymentStatusPending PaymentStatus = "pending"
	PaymentStatusPaid PaymentStatus = "paid"
	PaymentStatusFailed PaymentStatus = "failed"
	PaymentStatusRefunded PaymentStatus = "refunded" 
)

// ------ENTITIES------

type Order struct {
	ID              uint          `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID          uint          `gorm:"not null;index" json:"user_id"`
	AddressID       uint          `gorm:"not null" json:"address_id"`
	Status          OrderStatus   `gorm:"type:varchar(20);default:'pending'" json:"status"`
	PaymentMethod   PaymentMethod `gorm:"type:varchar(20);not null" json:"payment_method"`
	PaymentStatus   PaymentStatus `gorm:"type:varchar(20);default:'pending'" json:"payment_status"`
	TotalAmount     float64       `gorm:"not null" json:"total_amount"`
	RazorpayOrderID string        `gorm:"type:varchar(100)" json:"razorpay_order_id,omitempty"`
	RazorpayPaymentID string      `gorm:"type:varchar(100)" json:"razorpay_payment_id,omitempty"`
	Items           []OrderItem   `gorm:"foreignKey:OrderID" json:"items"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
}

type OrderItem struct {
	ID           uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID      uint    `gorm:"not null;index" json:"order_id"`
	ProductID    uint    `gorm:"not null" json:"product_id"`
	ProductName  string  `gorm:"not null" json:"product_name"`   // snapshot at time of order
	ProductImage string  `json:"product_image"`                  // snapshot at time of order
	Quantity     int     `gorm:"not null" json:"quantity"`
	Price        float64 `gorm:"not null" json:"price"`          // price at time of order
	Subtotal     float64 `gorm:"not null" json:"subtotal"`
}

// REQUEST STRUCTS
type PlaceOrderRequest struct {
	AddressID     uint `json:"address_id" validate:"required,gt=0"`
	PaymentMethod PaymentMethod `json:"payment_method" validate:"required,payment_method"`
}

type BuyNowRequest struct {
	ProductID     uint `json:"product_id" validate:"required,gt=0"`
	Quantity      int `json:"quantity" validate:"required,min=1"`
	AddressID     uint `json:"address_id" validate:"required,gt=0"`
	PaymentMethod PaymentMethod `json:"payment_method" validate:"required,payment_method"`
}

type UpdateOrderStatusRequest struct {
	Status OrderStatus `json:"status" validate:"required,order_status"`
}

// RESPONSE STRUCTS
type OrderResponse struct {
	ID              uint          `json:"id"`
	Status          OrderStatus   `json:"status"`
	PaymentMethod   PaymentMethod `json:"payment_method"`
	PaymentStatus   PaymentStatus `json:"payment_status"`
	TotalAmount     float64       `json:"total_amount"`
	RazorpayOrderID string        `json:"razorpay_order_id,omitempty"`
	Items           []OrderItem   `json:"items"`
	Address         OrderAddress  `json:"address"`
	CreatedAt       time.Time     `json:"created_at"`
}

type OrderAddress struct {
	FullName string `json:"full_name"`
	Phone    string `json:"phone"`
	Street    string `json:"street"`
	Landmark  string `json:"landmark"`
	City     string `json:"city"`
	State    string `json:"state"`
	PinCode  string `json:"pin_code"`
}

// VALID STATUS TRANSITIONS
var ValidStatusTransitions = map[OrderStatus][]OrderStatus{
	OrderStatusPending:   {OrderStatusConfirmed, OrderStatusCancelled},
	OrderStatusConfirmed: {OrderStatusShipped, OrderStatusCancelled},
	OrderStatusShipped:   {OrderStatusDelivered},
	OrderStatusDelivered: {},   // final state
	OrderStatusCancelled: {},   // final state
}

// IsValidTransition checks if status change is allowed
func IsValidTransition(current, next OrderStatus) bool {
	allowed, exists := ValidStatusTransitions[current]
	if !exists {
		return false
	}
	for _, s := range allowed {
		if s == next {
			return true
		}
	}
	return false
}
