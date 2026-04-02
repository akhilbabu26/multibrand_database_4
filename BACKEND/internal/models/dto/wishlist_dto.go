package dto

import (
	"time"
)

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
