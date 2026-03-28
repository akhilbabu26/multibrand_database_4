package usecase

import (
	domain    "github.com/akhilbabu26/multibrand_database_4/internal/models/product"
	// apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
)

type productUsecase struct {
	repo domain.ProductRepository
}

func NewProductUsecase(repo domain.ProductRepository) domain.ProductUsecase {
	return &productUsecase{repo: repo}
}

func (u *productUsecase) CreateProduct(req domain.CreateProductRequest) error {
	product := &domain.Product{
		Name:               req.Name,
		Type:               req.Type,
		Color:              req.Color,
		Size:               req.Size,
		Gender:             req.Gender,
		CostPrice:          req.CostPrice,
		OriginalPrice:      req.OriginalPrice,
		DiscountPercentage: req.DiscountPercentage,
		ImageURL:           req.ImageURL,
		Description:        req.Description,
		Stock:              req.Stock,
		IsActive:           true,
	}
	product.CalculateSalePrice()

	if err := u.repo.Create(product); err != nil {
		return err
	}
	return nil
}

func (u *productUsecase) UpdateProduct(id uint, req domain.UpdateProductRequest) error {
	product, err := u.repo.FindByID(id)
	if err != nil {
		return err    // already AppError
	}

	if req.Name != nil               { product.Name = *req.Name }
	if req.Type != nil               { product.Type = *req.Type }
	if req.Color != nil              { product.Color = *req.Color }
	if req.Size != nil               { product.Size = *req.Size }
	if req.Gender != nil             { product.Gender = *req.Gender }
	if req.CostPrice != nil          { product.CostPrice = *req.CostPrice }
	if req.OriginalPrice != nil      { product.OriginalPrice = *req.OriginalPrice }
	if req.DiscountPercentage != nil { product.DiscountPercentage = *req.DiscountPercentage }
	if req.ImageURL != nil           { product.ImageURL = *req.ImageURL }
	if req.Description != nil        { product.Description = *req.Description }
	if req.Stock != nil              { product.Stock = *req.Stock }
	if req.IsActive != nil           { product.IsActive = *req.IsActive }

	product.CalculateSalePrice()

	return u.repo.Update(product)
}

func (u *productUsecase) DeleteProduct(id uint) error {
	if _, err := u.repo.FindByID(id); err != nil {
		return err
	}
	return u.repo.Delete(id)
}

func (u *productUsecase) GetProduct(id uint) (*domain.Product, error) {
	product, err := u.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return product, nil
}

func (u *productUsecase) ListProducts(filters domain.ProductFilter) ([]*domain.Product, int64, error) {
	return u.repo.ListAll(filters)
}