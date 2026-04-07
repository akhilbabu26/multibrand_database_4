package contracts

import (
	"context"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	"github.com/akhilbabu26/multibrand_database_4/internal/repository/generic"
	"gorm.io/gorm"
)

type ProductRepository interface {
	generic.Repository[entities.Product]
	WithTx(tx *gorm.DB) ProductRepository

	FindByIDForUpdate(ctx context.Context, id uint) (*entities.Product, error)
	ListAll(ctx context.Context, filters dto.ProductFilter) ([]*entities.Product, int64, error)
}

type ProductUsecase interface {
	CreateProduct(ctx context.Context, req dto.CreateProductRequest) error
	UpdateProduct(ctx context.Context, id uint, req dto.UpdateProductRequest) error
	DeleteProduct(ctx context.Context, id uint) error

	GetProduct(ctx context.Context, id uint) (*entities.Product, error)
	ListProducts(ctx context.Context, filters dto.ProductFilter) ([]*entities.Product, int64, error)

	GetProductForCustomer(ctx context.Context, id uint, userID *uint) (*dto.CustomerProductResponse, error)
	ListProductsForCustomer(ctx context.Context, filters dto.ProductFilter, userID *uint) ([]*dto.CustomerProductResponse, int64, error)
}
