package postgres

import (
	"context"
	"errors"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"

	"github.com/akhilbabu26/multibrand_database_4/internal/repository/generic"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type productRepository struct {
	generic.Repository[entities.Product]
}

func NewProductRepository(baseRepo generic.Repository[entities.Product]) contracts.ProductRepository {
	return &productRepository{Repository: baseRepo}
}

// WithTx returns a new productRepository scoped to the given transaction.
func (r *productRepository) WithTx(tx *gorm.DB) contracts.ProductRepository {
	return &productRepository{
		Repository: generic.NewGenericRepository[entities.Product](tx),
	}
}

// FindByIDForUpdate acquires a row-level lock (SELECT … FOR UPDATE) to prevent
// concurrent writes on the same product row during a transaction.
func (r *productRepository) FindByIDForUpdate(ctx context.Context, id uint) (*entities.Product, error) {
	var product entities.Product
	err := r.DB().
		WithContext(ctx).
		Preload("Images").
		Clauses(clause.Locking{Strength: "UPDATE"}).
		First(&product, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.ProductNotFound(err)
		}
		return nil, apperrors.Internal("failed to find product for update", err)
	}
	return &product, nil
}

// ListAll applies filters, counts the total matching rows, then fetches the
// requested page — both using the same base query so they stay in sync.
func (r *productRepository) ListAll(ctx context.Context, filters dto.ProductFilter) ([]*entities.Product, int64, error) {
	// Normalise pagination defaults before building the query.
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.Limit < 1 {
		filters.Limit = 10
	}

	query := r.DB().WithContext(ctx).Model(&entities.Product{})

	// --- filter predicates ---
	if !filters.Inactive {
		query = query.Where("is_active = ?", true)
	}
	if filters.Search != "" {
		like := "%" + filters.Search + "%"
		query = query.Where("name ILIKE ? OR description ILIKE ?", like, like)
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

	// Count total matching rows (error was previously silently swallowed).
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, apperrors.Internal("failed to count products", err)
	}

	// Short-circuit: no need to hit DB again if there are no results.
	if total == 0 {
		return []*entities.Product{}, 0, nil
	}

	// Fetch the page — Preload keeps images in the same query session.
	var products []*entities.Product
	offset := (filters.Page - 1) * filters.Limit
	err := query.
		Preload("Images").
		Offset(offset).
		Limit(filters.Limit).
		Find(&products).Error
	if err != nil {
		return nil, 0, apperrors.Internal("failed to list products", err)
	}

	return products, total, nil
}
