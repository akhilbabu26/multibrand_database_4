package domain

import "gorm.io/gorm"

// ProductRepository — DB contract
type ProductRepository interface {
	WithTx(tx *gorm.DB) ProductRepository
	
	// admin
	Create(product *Product) error
	Update(product *Product) error
	Delete(id uint) error

	// public
	FindByID(id uint) (*Product, error)
	FindByIDForUpdate(id uint) (*Product, error)
	ListAll(filters ProductFilter) ([]*Product, int64, error)
}

// ProductUsecase — business logic contract
type ProductUsecase interface {
	// admin
	CreateProduct(req CreateProductRequest) error
	UpdateProduct(id uint, req UpdateProductRequest) error
	DeleteProduct(id uint) error

	// public
	GetProduct(id uint) (*Product, error)
	ListProducts(filters ProductFilter) ([]*Product, int64, error)
}
