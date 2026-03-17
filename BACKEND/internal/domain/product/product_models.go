package domain

import "time"

type Product struct{
	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`
	Name string `gorm:"not null" json:"name"`
	Type string `gorm:"not null" json:"type"`
	Color string `json:"color"`
	CostPrice float64 `gorm:"not null" json:"cost_price"`
	OriginalPrice float64 `gorm:"not null" json:"original_price"`
	DiscountPercentage float64 `gorm:"default:0" json:"discount_percentage"`
	SalePrice float64 `gorm:"not null" json:"sale_price"`
	ImageURL string `json:"image_url"`
	Description string `json:"description"`
	Stock int `gorm:"default:0" json:"stock"`
	IsActive bool `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Auto calculate the sale price 
func (p *Product) CalculateSalePrice() {
	if p.DiscountPercentage > 0{
		p.SalePrice = p.OriginalPrice - (p.OriginalPrice * p.DiscountPercentage / 100)
	}else {
		p.SalePrice = p.OriginalPrice
	}
}

// CreateProductRequest — input for create
type CreateProductRequest struct {
	Name string  `json:"name" binding:"required"`
	Type string  `json:"type" binding:"required"`
	Color string  `json:"color"`
	CostPrice float64 `json:"cost_price" binding:"required,gt=0"`
	OriginalPrice float64 `json:"original_price" binding:"required,gt=0"`
	DiscountPercentage float64 `json:"discount_percentage" binding:"min=0,max=100"`
	ImageURL string  `json:"image_url"`
	Description string  `json:"description"`
	Stock int     `json:"stock" binding:"min=0"`
}

// UpdateProductRequest — input for update (all optional)
type UpdateProductRequest struct {
	Name               *string  `json:"name"`
	Type               *string  `json:"type"`
	Color              *string  `json:"color"`
	CostPrice          *float64 `json:"cost_price"`
	OriginalPrice      *float64 `json:"original_price"`
	DiscountPercentage *float64 `json:"discount_percentage"`
	ImageURL           *string  `json:"image_url"`
	Description        *string  `json:"description"`
	Stock              *int     `json:"stock"`
	IsActive           *bool    `json:"is_active"`
}

// ProductFilter — for search and filter
type ProductFilter struct {
	Search   string
	Type     string
	Color    string
	MinPrice float64
	MaxPrice float64
	InStock  bool
	Inactive bool
	Page     int
	Limit    int
}

// Response feilds for Admin and User

// CustomerProductResponse — limited fields for customer
type CustomerProductResponse struct {
	ID                 uint    `json:"id"`
	Name               string  `json:"name"`
	Type               string  `json:"type"`
	Color              string  `json:"color"`
	OriginalPrice      float64 `json:"original_price"`
	DiscountPercentage float64 `json:"discount_percentage"`
	SalePrice          float64 `json:"sale_price"`
	ImageURL           string  `json:"image_url"`
	Description        string  `json:"description"`
}

// AdminProductResponse — full fields for admin
type AdminProductResponse struct {
	ID                 uint      `json:"id"`
	Name               string    `json:"name"`
	Type               string    `json:"type"`
	Color              string    `json:"color"`
	CostPrice          float64   `json:"cost_price"`
	OriginalPrice      float64   `json:"original_price"`
	DiscountPercentage float64   `json:"discount_percentage"`
	SalePrice          float64   `json:"sale_price"`
	ImageURL           string    `json:"image_url"`
	Description        string    `json:"description"`
	Stock              int       `json:"stock"`
	IsActive           bool      `json:"is_active"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}


// CONVERTERS
func (p *Product) ToCustomerResponse() *CustomerProductResponse {
	return &CustomerProductResponse{
		ID:                 p.ID,
		Name:               p.Name,
		Type:               p.Type,
		Color:              p.Color,
		OriginalPrice:      p.OriginalPrice,
		DiscountPercentage: p.DiscountPercentage,
		SalePrice:          p.SalePrice,
		ImageURL:           p.ImageURL,
		Description:        p.Description,
	}
}

func (p *Product) ToAdminResponse() *AdminProductResponse {
	return &AdminProductResponse{
		ID:                 p.ID,
		Name:               p.Name,
		Type:               p.Type,
		Color:              p.Color,
		CostPrice:          p.CostPrice,
		OriginalPrice:      p.OriginalPrice,
		DiscountPercentage: p.DiscountPercentage,
		SalePrice:          p.SalePrice,
		ImageURL:           p.ImageURL,
		Description:        p.Description,
		Stock:              p.Stock,
		IsActive:           p.IsActive,
		CreatedAt:          p.CreatedAt,
		UpdatedAt:          p.UpdatedAt,
	}
}
