package repository

import (
	"errors"

	domain     "github.com/akhilbabu26/multibrand_database_4/internal/models/product"
	apperrors  "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) domain.ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) WithTx(tx *gorm.DB) domain.ProductRepository {
	return &productRepository{db: tx}
}

func (r *productRepository) Create(product *domain.Product) error {
	if err := r.db.Create(product).Error; err != nil {
		return apperrors.Internal("failed to create product", err)
	}
	return nil
}

func (r *productRepository) Update(product *domain.Product) error {
	if err := r.db.Save(product).Error; err != nil {
		return apperrors.Internal("failed to update product", err)
	}
	return nil
}

func (r *productRepository) Delete(id uint) error {
	if err := r.db.Delete(&domain.Product{}, id).Error; err != nil {
		return apperrors.Internal("failed to delete product", err)
	}
	return nil
}

func (r *productRepository) FindByID(id uint) (*domain.Product, error) {
	var product domain.Product
	if err := r.db.First(&product, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.ProductNotFound(err)
		}
		return nil, apperrors.Internal("failed to find product", err)
	}
	return &product, nil
}

func (r *productRepository) FindByIDForUpdate(id uint) (*domain.Product, error) {
	var product domain.Product
	if err := r.db.Clauses(clause.Locking{Strength: "UPDATE"}).First(&product, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.ProductNotFound(err)
		}
		return nil, apperrors.Internal("failed to find product for update", err)
	}
	return &product, nil
}

func (r *productRepository) ListAll(filters domain.ProductFilter) ([]*domain.Product, int64, error) {
	var products []*domain.Product
	var total int64

	query := r.db.Model(&domain.Product{})

	if !filters.Inactive {
		query = query.Where("is_active = ?", true)
	}
	if filters.Search != "" {
		query = query.Where(
			"name ILIKE ? OR description ILIKE ?",
			"%"+filters.Search+"%",
			"%"+filters.Search+"%",
		)
	}
	if filters.Size != "" {
		query = query.Where("LOWER(size) = LOWER(?)", filters.Size)
	}
	if filters.Gender != "" {
		query = query.Where("LOWER(gender) = LOWER(?)", filters.Gender)
	}
	if filters.Type != "" {
		query = query.Where("LOWER(type) = LOWER(?)", filters.Type)
	}
	if filters.Color != "" {
		query = query.Where("LOWER(color) = LOWER(?)", filters.Color)
	}
	if filters.MinPrice > 0 {
		query = query.Where("sale_price >= ?", filters.MinPrice)
	}
	if filters.MaxPrice > 0 {
		query = query.Where("sale_price <= ?", filters.MaxPrice)
	}
	if filters.InStock {
		query = query.Where("stock > 0")
	}

	query.Count(&total)

	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.Limit < 1 {
		filters.Limit = 10
	}

	offset := (filters.Page - 1) * filters.Limit
	if err := query.Offset(offset).Limit(filters.Limit).Find(&products).Error; err != nil {
		return nil, 0, apperrors.Internal("failed to list products", err)
	}

	return products, total, nil
}