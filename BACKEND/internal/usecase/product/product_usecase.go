package usecase

import (
	"fmt"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/domain/product"
)

type productUsecase struct{
	repo domain.ProductRepository
}

func NewProductUsecase(repo domain.ProductRepository) domain.ProductUsecase{
	return &productUsecase{repo: repo}
}

// create new product
func (u *productUsecase) CreateProduct(req domain.CreateProductRequest) error{
	product := &domain.Product{
		Name:               req.Name,
		Type:               req.Type,
		Color:              req.Color,
		CostPrice:          req.CostPrice,
		OriginalPrice:      req.OriginalPrice,
		DiscountPercentage: req.DiscountPercentage,
		ImageURL:           req.ImageURL,
		Description:        req.Description,
		Stock:              req.Stock,
		IsActive:           true,
	}

	// auto calculate sale price
	product.CalculateSalePrice()

	if err := u.repo.Create(product); err != nil {
		return fmt.Errorf("failed to create product: %w", err)
	}

	return nil
}

// update product
func (u *productUsecase) UpdateProduct(id uint, req domain.UpdateProductRequest) error {
	// 1. find existing product
	product, err := u.repo.FindByID(id)
	if err != nil {
		return fmt.Errorf("product not found")
	}

	// 2. update only provided fields
	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.Type != nil {
		product.Type = *req.Type
	}
	if req.Color != nil {
		product.Color = *req.Color
	}
	if req.CostPrice != nil {
		product.CostPrice = *req.CostPrice
	}
	if req.OriginalPrice != nil {
		product.OriginalPrice = *req.OriginalPrice
	}
	if req.DiscountPercentage != nil {
		product.DiscountPercentage = *req.DiscountPercentage
	}
	if req.ImageURL != nil {
		product.ImageURL = *req.ImageURL
	}
	if req.Description != nil {
		product.Description = *req.Description
	}
	if req.Stock != nil {
		product.Stock = *req.Stock
	}
	if req.IsActive != nil {
		product.IsActive = *req.IsActive
	}

	// 3. recalculate sale price if price or discount changed
	product.CalculateSalePrice()

	if err := u.repo.Update(product); err != nil {
		return fmt.Errorf("failed to update product: %w", err)
	}

	return nil
}

// delete product by id
func (u *productUsecase) DeleteProduct(id uint) error {
	_, err := u.repo.FindByID(id)
	if err != nil {
		return fmt.Errorf("product not found")
	}

	if err := u.repo.Delete(id); err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}

	return nil
}

// get product by id
func (u *productUsecase) GetProduct(id uint) (*domain.Product, error) {
	product, err := u.repo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("product not found")
	}
	return product, nil
}

// filter product
func (u *productUsecase) ListProducts(filters domain.ProductFilter) ([]*domain.Product, int64, error){
	products, total, err := u.repo.ListAll(filters)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list products: %w", err)
	}
	return products, total, nil
}