package entities

import (
	"time"

	"github.com/akhilbabu26/multibrand_database_4/pkg/constant"
)

type Order struct {
	ID                uint                   `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID            uint                   `gorm:"not null;index;constraint:OnDelete:CASCADE;constraint:OnUpdate:CASCADE" json:"user_id"`
	AddressID         uint                   `gorm:"not null;index;constraint:OnDelete:RESTRICT;constraint:OnUpdate:CASCADE" json:"address_id"`
	Status            constant.OrderStatus   `gorm:"type:varchar(20);default:'pending';index" json:"status"`
	PaymentMethod     constant.PaymentMethod `gorm:"type:varchar(20);not null;index" json:"payment_method"`
	PaymentStatus     constant.PaymentStatus `gorm:"type:varchar(20);default:'pending';index" json:"payment_status"`
	TotalAmount       float64                `gorm:"not null" json:"total_amount"`
	RazorpayOrderID   string                 `gorm:"type:varchar(100);index" json:"razorpay_order_id,omitempty"`
	RazorpayPaymentID string                 `gorm:"type:varchar(100);index" json:"razorpay_payment_id,omitempty"`
	Items             []OrderItem            `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE;constraint:OnUpdate:CASCADE" json:"items"`
	CreatedAt         time.Time              `gorm:"index" json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
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
