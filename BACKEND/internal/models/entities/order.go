package entities

import "time"

type OrderStatus string
type PaymentMethod string
type PaymentStatus string

const (
	OrderStatusPending   OrderStatus = "pending"
	OrderStatusConfirmed OrderStatus = "confirmed"
	OrderStatusShipped   OrderStatus = "shipped"
	OrderStatusDelivered OrderStatus = "delivered"
	OrderStatusCancelled OrderStatus = "cancelled"

	PaymentMethodsCOD     PaymentMethod = "cod"
	PaymentMethodRazorpay PaymentMethod = "razorpay"

	PaymentStatusPending  PaymentStatus = "pending"
	PaymentStatusPaid     PaymentStatus = "paid"
	PaymentStatusFailed   PaymentStatus = "failed"
	PaymentStatusRefunded PaymentStatus = "refunded"
)

type Order struct {
	ID                uint          `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID            uint          `gorm:"not null;index;constraint:OnDelete:CASCADE;constraint:OnUpdate:CASCADE" json:"user_id"`
	AddressID         uint          `gorm:"not null;index;constraint:OnDelete:RESTRICT;constraint:OnUpdate:CASCADE" json:"address_id"`
	Status            OrderStatus   `gorm:"type:varchar(20);default:'pending';index" json:"status"`
	PaymentMethod     PaymentMethod `gorm:"type:varchar(20);not null;index" json:"payment_method"`
	PaymentStatus     PaymentStatus `gorm:"type:varchar(20);default:'pending';index" json:"payment_status"`
	TotalAmount       float64       `gorm:"not null" json:"total_amount"`
	RazorpayOrderID   string        `gorm:"type:varchar(100);index" json:"razorpay_order_id,omitempty"`
	RazorpayPaymentID string        `gorm:"type:varchar(100);index" json:"razorpay_payment_id,omitempty"`
	Items             []OrderItem   `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE;constraint:OnUpdate:CASCADE" json:"items"`
	CreatedAt         time.Time     `gorm:"index" json:"created_at"`
	UpdatedAt         time.Time     `json:"updated_at"`
}

type OrderItem struct {
	ID           uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID      uint    `gorm:"not null;index:,composite:order_product;constraint:OnDelete:CASCADE;constraint:OnUpdate:CASCADE" json:"order_id"`
	ProductID    uint    `gorm:"not null;index:,composite:order_product;constraint:OnDelete:RESTRICT;constraint:OnUpdate:CASCADE" json:"product_id"`
	ProductName  string  `gorm:"not null" json:"product_name"`
	ProductImage string  `json:"product_image"`
	Quantity     int     `gorm:"not null" json:"quantity"`
	Price        float64 `gorm:"not null" json:"price"`
	Subtotal     float64 `gorm:"not null" json:"subtotal"`
}

var ValidStatusTransitions = map[OrderStatus][]OrderStatus{
	OrderStatusPending:   {OrderStatusConfirmed, OrderStatusCancelled},
	OrderStatusConfirmed: {OrderStatusShipped, OrderStatusCancelled},
	OrderStatusShipped:   {OrderStatusDelivered},
	OrderStatusDelivered: {},
	OrderStatusCancelled: {},
}

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
