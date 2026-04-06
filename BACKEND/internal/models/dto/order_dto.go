package dto

import (
	"time"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
)
type OrderFilter struct {
	Status    entities.OrderStatus
	StartDate *time.Time
	EndDate   *time.Time
	OrderID   string
	Page      int
	Limit     int
}

type PlaceOrderRequest struct {
	AddressID     uint                   `json:"address_id" validate:"required,gt=0"`
	PaymentMethod entities.PaymentMethod `json:"payment_method" validate:"required,payment_method"`
}

type BuyNowRequest struct {
	ProductID     uint                   `json:"product_id" validate:"required,gt=0"`
	Quantity      int                    `json:"quantity" validate:"required,min=1"`
	AddressID     uint                   `json:"address_id" validate:"required,gt=0"`
	PaymentMethod entities.PaymentMethod `json:"payment_method" validate:"required,payment_method"`
}

type UpdateOrderStatusRequest struct {
	Status entities.OrderStatus `json:"status" validate:"required,order_status"`
}

type OrderResponse struct {
	ID              uint                   `json:"id"`
	Status          entities.OrderStatus   `json:"status"`
	PaymentMethod   entities.PaymentMethod `json:"payment_method"`
	PaymentStatus   entities.PaymentStatus `json:"payment_status"`
	TotalAmount     float64                `json:"total_amount"`
	RazorpayOrderID string                 `json:"razorpay_order_id,omitempty"`
	Items           []entities.OrderItem   `json:"items"`
	Address         OrderAddress           `json:"address"`
	CreatedAt       time.Time              `json:"created_at"`
}

type OrderAddress struct {
	FullName string `json:"full_name"`
	Phone    string `json:"phone"`
	Street   string `json:"street"`
	Landmark string `json:"landmark"`
	City     string `json:"city"`
	State    string `json:"state"`
	PinCode  string `json:"pin_code"`
}
