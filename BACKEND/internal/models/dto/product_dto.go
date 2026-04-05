package dto

import (
	"mime/multipart"
	"time"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
)

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

type CreateProductRequest struct {
	Name               string                  `json:"name" form:"name" validate:"required,min=2"`
	Type               string                  `json:"type" form:"type" validate:"required"`
	Color              string                  `json:"color" form:"color" validate:"required"`
	Size               entities.Size           `json:"size" form:"size" validate:"required,shoe_size"`
	Gender             entities.Gender         `json:"gender" form:"gender" validate:"required,gender"`
	CostPrice          float64                 `json:"cost_price" form:"cost_price" validate:"required,gt=0"`
	OriginalPrice      float64                 `json:"original_price" form:"original_price" validate:"required,gt=0"`
	DiscountPercentage float64                 `json:"discount_percentage" form:"discount_percentage" validate:"min=0,max=100"`
	Images             []*multipart.FileHeader `form:"images" json:"-"`
	Description        string                  `json:"description" form:"description"`
	Stock              int                     `json:"stock" form:"stock" validate:"min=0"`
}

type UpdateProductRequest struct {
	Name               *string                 `json:"name" form:"name"`
	Type               *string                 `json:"type" form:"type"`
	Color              *string                 `json:"color" form:"color"`
	Size               *entities.Size          `json:"size" form:"size" validate:"omitempty,shoe_size"`
	Gender             *entities.Gender        `json:"gender" form:"gender" validate:"omitempty,gender"`
	CostPrice          *float64                `json:"cost_price" form:"cost_price" validate:"omitempty,gt=0"`
	OriginalPrice      *float64                `json:"original_price" form:"original_price" validate:"omitempty,gt=0"`
	DiscountPercentage *float64                `json:"discount_percentage" form:"discount_percentage" validate:"omitempty,min=0,max=100"`
	Images             []*multipart.FileHeader `form:"images" json:"-"`
	Description        *string                 `json:"description" form:"description"`
	Stock              *int                    `json:"stock" form:"stock" validate:"omitempty,min=0"`
	IsActive           *bool                   `json:"is_active" form:"is_active"`
}

type CustomerProductResponse struct {
	ID                 uint                    `json:"id"`
	Name               string                  `json:"name"`
	Type               string                  `json:"type"`
	Color              string                  `json:"color"`
	Size               entities.Size           `json:"size"`
	Gender             entities.Gender         `json:"gender"`
	OriginalPrice      float64                 `json:"original_price"`
	DiscountPercentage float64                 `json:"discount_percentage"`
	SalePrice          float64                 `json:"sale_price"`
	Images             []entities.ProductImage `json:"images"`
	Description        string                  `json:"description"`
}

type AdminProductResponse struct {
	ID                 uint                    `json:"id"`
	Name               string                  `json:"name"`
	Type               string                  `json:"type"`
	Color              string                  `json:"color"`
	Size               entities.Size           `json:"size"`
	Gender             entities.Gender         `json:"gender"`
	CostPrice          float64                 `json:"cost_price"`
	OriginalPrice      float64                 `json:"original_price"`
	DiscountPercentage float64                 `json:"discount_percentage"`
	SalePrice          float64                 `json:"sale_price"`
	Images             []entities.ProductImage `json:"images"`
	Description        string                  `json:"description"`
	Stock              int                     `json:"stock"`
	IsActive           bool                    `json:"is_active"`
	CreatedAt          time.Time               `json:"created_at"`
	UpdatedAt          time.Time               `json:"updated_at"`
}
func ToCustomerProductResponse(p *entities.Product) *CustomerProductResponse {
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

func ToAdminProductResponse(p *entities.Product) *AdminProductResponse {
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
