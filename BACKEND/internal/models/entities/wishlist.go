package entities

import "time"

type Wishlist struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint      `gorm:"not null;index:,composite:user_product" json:"user_id"`
	ProductID uint      `gorm:"not null;index:,composite:user_product" json:"product_id"`
	CreatedAt time.Time `json:"created_at"`
}

