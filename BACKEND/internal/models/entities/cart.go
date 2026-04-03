package entities

import "time"

type Cart struct {
	ID        uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint       `gorm:"uniqueIndex;not null;constraint:OnDelete:CASCADE;constraint:OnUpdate:CASCADE" json:"user_id"`
	Items     []CartItem `gorm:"foreignKey:CartID;constraint:OnDelete:CASCADE;constraint:OnUpdate:CASCADE" json:"items"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type CartItem struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	CartID    uint      `gorm:"not null;index:,composite:cart_product;constraint:OnDelete:CASCADE;constraint:OnUpdate:CASCADE" json:"cart_id"`
	ProductID uint      `gorm:"not null;index:,composite:cart_product;constraint:OnDelete:RESTRICT;constraint:OnUpdate:CASCADE" json:"product_id"`
	Quantity  int       `gorm:"not null;default:1" json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
