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
	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	} else if !filters.Inactive {
		query = query.Where("is_active = ?", true)
	}
	if filters.Search != "" {
		like := "%" + filters.Search + "%"
		query = query.Where("(name ILIKE ? OR description ILIKE ? OR brand ILIKE ? OR type ILIKE ? OR color ILIKE ? OR gender ILIKE ?)",
			like, like, like, like, like, like)
	}
	if filters.Brand != "" {
		query = query.Where("LOWER(brand) = LOWER(?)", filters.Brand)
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

// FindByID fetches a single product with its images preloaded.
func (r *productRepository) FindByID(ctx context.Context, id uint) (*entities.Product, error) {
	var product entities.Product
	err := r.DB().WithContext(ctx).Preload("Images").First(&product, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.ProductNotFound(err)
		}
		return nil, apperrors.Internal("failed to find product", err)
	}
	return &product, nil
}

func (r *productRepository) GetProductVariants(ctx context.Context, id uint) ([]*entities.Product, error) {
	var baseProduct entities.Product
	if err := r.DB().WithContext(ctx).First(&baseProduct, id).Error; err != nil {
		return nil, apperrors.Internal("failed to fetch base product", err)
	}

	var variants []*entities.Product
	err := r.DB().WithContext(ctx).
		Where("name = ? AND brand = ? AND color = ?", baseProduct.Name, baseProduct.Brand, baseProduct.Color).
		Preload("Images").
		Find(&variants).Error

	if err != nil {
		return nil, apperrors.Internal("failed to fetch variants", err)
	}
	return variants, nil
}

func (r *productRepository) GetProductMetadata(ctx context.Context) (*dto.ProductMetadataResponse, error) {
	var brands, types, colors, sizes, genders []string

	baseQuery := r.DB().WithContext(ctx).Model(&entities.Product{}).Where("is_active = ?", true)

	if err := baseQuery.Session(&gorm.Session{}).Distinct("brand").Order("brand asc").Pluck("brand", &brands).Error; err != nil {
		return nil, apperrors.Internal("failed to fetch brands", err)
	}
	if err := baseQuery.Session(&gorm.Session{}).Distinct("type").Order("type asc").Pluck("type", &types).Error; err != nil {
		return nil, apperrors.Internal("failed to fetch types", err)
	}
	if err := baseQuery.Session(&gorm.Session{}).Distinct("color").Order("color asc").Pluck("color", &colors).Error; err != nil {
		return nil, apperrors.Internal("failed to fetch colors", err)
	}
	if err := baseQuery.Session(&gorm.Session{}).Distinct("size").Order("size asc").Pluck("size", &sizes).Error; err != nil {
		return nil, apperrors.Internal("failed to fetch sizes", err)
	}
	if err := baseQuery.Session(&gorm.Session{}).Distinct("gender").Order("gender asc").Pluck("gender", &genders).Error; err != nil {
		return nil, apperrors.Internal("failed to fetch genders", err)
	}

	return &dto.ProductMetadataResponse{
		Brands:  brands,
		Types:   types,
		Colors:  colors,
		Sizes:   sizes,
		Genders: genders,
	}, nil
}
