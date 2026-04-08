package dto

import (
	"mime/multipart"
	"time"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
)

type ProductFilter struct {
	Search   string
	Brand    string
	Type     string
	Color    string
	Size     string
	Gender   string
	MinPrice float64
	MaxPrice float64
	InStock  bool
	Inactive bool
	IsActive *bool
	Page     int
	Limit    int
}

type CreateProductRequest struct {
	Name               string                  `json:"name" form:"name" validate:"required,min=2"`
	Brand              entities.Brand          `json:"brand" form:"brand" validate:"required"`
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
	Brand              *entities.Brand         `json:"brand" form:"brand"`
	Type               *string                 `json:"type" form:"type"`
	Color              *string                 `json:"color" form:"color"`
	Size               *entities.Size          `json:"size" form:"size" validate:"omitempty,shoe_size"`
	Gender             *entities.Gender        `json:"gender" form:"gender" validate:"omitempty,gender"`
	CostPrice          *float64                `json:"cost_price" form:"cost_price" validate:"omitempty,gt=0"`
	OriginalPrice      *float64                `json:"original_price" form:"original_price" validate:"omitempty,gt=0"`
	DiscountPercentage *float64                `json:"discount_percentage" form:"discount_percentage" validate:"omitempty,min=0,max=100"`
	Images             []*multipart.FileHeader `form:"images" json:"-"`
	DeleteImageIDs     []uint                  `form:"delete_image_ids" json:"delete_image_ids"`
	Description        *string                 `json:"description" form:"description"`
	Stock              *int                    `json:"stock" form:"stock" validate:"omitempty,min=0"`
	IsActive           *bool                   `json:"is_active" form:"is_active"`
}

type CustomerProductResponse struct {
	ID                 uint                    `json:"id"`
	Name               string                  `json:"name"`
	Brand              entities.Brand          `json:"brand"`
	Type               string                  `json:"type"`
	Color              string                  `json:"color"`
	Size               entities.Size           `json:"size"`
	Gender             entities.Gender         `json:"gender"`
	OriginalPrice      float64                 `json:"original_price"`
	DiscountPercentage float64                 `json:"discount_percentage"`
	SalePrice          float64                 `json:"sale_price"`
	Images             []entities.ProductImage `json:"images"`
	Description        string                  `json:"description"`
	Stock              int                     `json:"stock"`
	IsCart             bool                    `json:"is_cart"`
	IsWishlist         bool                    `json:"is_wishlist"`
}

type AdminProductResponse struct {
	ID                 uint                    `json:"id"`
	Name               string                  `json:"name"`
	Brand              entities.Brand          `json:"brand"`
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

type ProductMetadataResponse struct {
	Brands  []string `json:"brands"`
	Types   []string `json:"types"`
	Colors  []string `json:"colors"`
	Sizes   []string `json:"sizes"`
	Genders []string `json:"genders"`
}


func ToCustomerProductResponse(p *entities.Product) *CustomerProductResponse {
	images := p.Images
	if images == nil {
		images = []entities.ProductImage{}
	}

	return &CustomerProductResponse{
		ID:                 p.ID,
		Name:               p.Name,
		Brand:              p.Brand,
		Type:               p.Type,
		Color:              p.Color,
		Size:               p.Size,
		Gender:             p.Gender,
		OriginalPrice:      p.OriginalPrice,
		DiscountPercentage: p.DiscountPercentage,
		SalePrice:          p.SalePrice,
		Images:             images,
		Description:        p.Description,
		Stock:              p.Stock,
		IsCart:             false,
		IsWishlist:         false,
	}
}

func ToAdminProductResponse(p *entities.Product) *AdminProductResponse {
	return &AdminProductResponse{
		ID:                 p.ID,
		Name:               p.Name,
		Brand:              p.Brand,
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
