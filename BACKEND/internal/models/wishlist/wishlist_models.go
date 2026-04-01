package domain

import "time"

type Wishlist struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint      `gorm:"not null;index:,composite:user_product" json:"user_id"`
	ProductID uint      `gorm:"not null;index:,composite:user_product" json:"product_id"`
	CreatedAt time.Time `json:"created_at"`
}

// ---response---

type WishlistResponse struct {
	ID        uint               `json:"id"`
	ProductID uint               `json:"product_id"`
	Product   *ProductInWishlist `json:"product"`
	CreatedAt time.Time          `json:"created_at"`
}

type ProductInWishlist struct {
	ID        uint    `json:"id"`
	Name      string  `json:"name"`
	SalePrice float64 `json:"sale_price"`
	ImageURL  string  `json:"image_url"`
}
