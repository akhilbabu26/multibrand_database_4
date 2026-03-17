package domain

import "time"

// ----models---
type Cart struct{
	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID uint `gorm:"uniqueIndex;not null" json:"user_id"` // one cart per user
	Items []CartItem `gorm:"foreignKey:CartID" json:"items"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CartItem struct {
	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`
	CartID uint `gorm:"not null;index" json:"cart_id"`
	ProductID uint `gorm:"not null" json:"product_id"`
	Quantity int `gorm:"not null;default:1" json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ----response----

type CartResponse struct {
	ID uint `json:"id"`
	Items []CartItemResponse `json:"items"`
	TotalItems int `json:"total_items"`
	TotalPrice float64 `json:"total_price"`
}

type CartItemResponse struct {
	ID uint `json:"id"`
	ProductID uint `json:"product_id"`
	Name string  `json:"name"`
	ImageURL string `json:"image_url"`
	SalePrice float64 `json:"sale_price"`
	Quantity int `json:"quantity"`
	Subtotal float64 `json:"subtotal"` // sale_price * quantity
}