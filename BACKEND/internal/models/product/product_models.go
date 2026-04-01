package domain

import (
	"mime/multipart"
	"time"
)

type Size string
type Gender string

const (
	// sizes
	Size38 Size = "38"
	Size39 Size = "39"
	Size40 Size = "40"
	Size41 Size = "41"
	Size42 Size = "42"
	Size43 Size = "43"
	Size44 Size = "44"

	// gender
	GenderMen    Gender = "men"
	GenderWomen  Gender = "women"
	GenderUnisex Gender = "unisex"
	GenderKids   Gender = "kids"
)

type ProductImage struct {
	ID        uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductID uint   `gorm:"index" json:"product_id"`
	ImageURL  string `gorm:"not null" json:"image_url"`
	IsPrimary bool   `gorm:"default:false" json:"is_primary"`
}

type Product struct {
	ID                 uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name               string    `gorm:"not null" json:"name"`
	Type               string    `gorm:"index;not null" json:"type"`
	Color              string    `gorm:"index" json:"color"`
	Size               Size      `gorm:"type:varchar(10)" json:"size"`
	Gender             Gender    `gorm:"index;type:varchar(10)" json:"gender"`
	CostPrice          float64   `gorm:"not null" json:"cost_price"`
	OriginalPrice      float64   `gorm:"not null" json:"original_price"`
	DiscountPercentage float64   `gorm:"default:0" json:"discount_percentage"`
	SalePrice          float64   `gorm:"index;not null" json:"sale_price"`
	Images             []ProductImage `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE;" json:"images"`
	Description        string    `json:"description"`
	Stock              int       `gorm:"index;default:0" json:"stock"`
	IsActive           bool      `gorm:"index;default:true" json:"is_active"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// Auto calculate the sale price
func (p *Product) CalculateSalePrice() {
	if p.DiscountPercentage > 0 {
		p.SalePrice = p.OriginalPrice - (p.OriginalPrice * p.DiscountPercentage / 100)
	} else {
		p.SalePrice = p.OriginalPrice
	}
}

// ProductFilter — for search and filter
type ProductFilter struct {
	Search   string
	Type     string
	Color    string
	Size     string
	Gender   string
	MinPrice float64
	MaxPrice float64
	InStock  bool
	Inactive bool
	Page     int
	Limit    int
}

//----request feilds------

// CreateProductRequest — input for create
type CreateProductRequest struct {
	Name               string  `json:"name" validate:"required,min=2"`
	Type               string  `json:"type" validate:"required"`
	Color              string  `json:"color" validate:"required"`
	Size               Size    `json:"size" validate:"required,shoe_size"`
	Gender             Gender  `json:"gender" validate:"required,gender"`
	CostPrice          float64 `json:"cost_price" validate:"required,gt=0"`
	OriginalPrice      float64 `json:"original_price" validate:"required,gt=0"`
	DiscountPercentage float64 `json:"discount_percentage" validate:"min=0,max=100"`
	Images             []*multipart.FileHeader `form:"images" json:"-"`
	Description        string  `json:"description"`
	Stock              int     `json:"stock" validate:"min=0"`
}

// UpdateProductRequest — input for update
type UpdateProductRequest struct {
	Name               *string  `json:"name"`
	Type               *string  `json:"type"`
	Color              *string  `json:"color"`
	Size               *Size    `json:"size" validate:"omitempty,shoe_size"`
	Gender             *Gender  `json:"gender" validate:"omitempty,gender"`
	CostPrice          *float64 `json:"cost_price" validate:"omitempty,gt=0"`
	OriginalPrice      *float64 `json:"original_price" validate:"omitempty,gt=0"`
	DiscountPercentage *float64 `json:"discount_percentage" validate:"omitempty,min=0,max=100"`
	Images             []*multipart.FileHeader `form:"images" json:"-"`
	Description        *string  `json:"description"`
	Stock              *int     `json:"stock" validate:"omitempty,min=0"`
	IsActive           *bool    `json:"is_active"`
}

// -----Response feilds for Admin and User-----

// CustomerProductResponse — limited fields for customer
type CustomerProductResponse struct {
	ID                 uint    `json:"id"`
	Name               string  `json:"name"`
	Type               string  `json:"type"`
	Color              string  `json:"color"`
	Size               Size    `json:"size"`
	Gender             Gender  `json:"gender"`
	OriginalPrice      float64 `json:"original_price"`
	DiscountPercentage float64 `json:"discount_percentage"`
	SalePrice          float64 `json:"sale_price"`
	Images             []ProductImage `json:"images"`
	Description        string  `json:"description"`
}

// AdminProductResponse — full fields for admin
type AdminProductResponse struct {
	ID                 uint      `json:"id"`
	Name               string    `json:"name"`
	Type               string    `json:"type"`
	Color              string    `json:"color"`
	Size               Size      `json:"size"`
	Gender             Gender    `json:"gender"`
	CostPrice          float64   `json:"cost_price"`
	OriginalPrice      float64   `json:"original_price"`
	DiscountPercentage float64   `json:"discount_percentage"`
	SalePrice          float64   `json:"sale_price"`
	Images             []ProductImage `json:"images"`
	Description        string    `json:"description"`
	Stock              int       `json:"stock"`
	IsActive           bool      `json:"is_active"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// CONVERTERS customer and admin response

func (p *Product) ToCustomerResponse() *CustomerProductResponse {
	return &CustomerProductResponse{
		ID:                 p.ID,
		Name:               p.Name,
		Type:               p.Type,
		Color:              p.Color,
		Size:               p.Size,
		Gender:             p.Gender,
		OriginalPrice:      p.OriginalPrice,
		DiscountPercentage: p.DiscountPercentage,
		SalePrice:          p.SalePrice,
		Images:             p.Images,
		Description:        p.Description,
	}
}

func (p *Product) ToAdminResponse() *AdminProductResponse {
	return &AdminProductResponse{
		ID:                 p.ID,
		Name:               p.Name,
		Type:               p.Type,
		Color:              p.Color,
		Size:               p.Size,
		Gender:             p.Gender,
		CostPrice:          p.CostPrice,
		OriginalPrice:      p.OriginalPrice,
		DiscountPercentage: p.DiscountPercentage,
		SalePrice:          p.SalePrice,
		Images:             p.Images,
		Description:        p.Description,
		Stock:              p.Stock,
		IsActive:           p.IsActive,
		CreatedAt:          p.CreatedAt,
		UpdatedAt:          p.UpdatedAt,
	}
}
