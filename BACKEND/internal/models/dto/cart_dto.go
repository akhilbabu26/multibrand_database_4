package dto

type CartResponse struct {
	ID         uint               `json:"id"`
	UserID     uint               `json:"user_id"`
	Items      []CartItemResponse `json:"items"`
	TotalItems int                `json:"total_items"`
	TotalPrice float64            `json:"total_price"`
}

type CartItemResponse struct {
	ID        uint    `json:"id"`
	ProductID uint    `json:"product_id"`
	Name      string  `json:"name"`
	Brand     string  `json:"brand"`
	Size      string  `json:"size"`
	ImageURL  string  `json:"image_url"`
	SalePrice float64 `json:"sale_price"`
	Quantity  int     `json:"quantity"`
	Subtotal  float64 `json:"subtotal"`
}
