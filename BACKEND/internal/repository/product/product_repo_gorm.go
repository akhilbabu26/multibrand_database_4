package repository

import (
	"errors"
	"fmt"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/domain/product"

	"gorm.io/gorm"
)

type productRepositiory struct{
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) domain.ProductRepository{
	return &productRepositiory{db: db}
}

func (r *productRepositiory) Create(product *domain.Product) error{
	if err := r.db.Create(product).Error; err != nil{
		return fmt.Errorf("failed to create product: %w", err)
	}

	return nil
}

func (r *productRepositiory) Update(product *domain.Product) error{
	if err := r.db.Save(product).Error; err != nil{
		return fmt.Errorf("failed to update product: %w", err)
	}

	return nil
}

func (r *productRepositiory) Delete(id uint) error {
	if err := r.db.Delete(&domain.Product{}, id).Error; err != nil{
		return fmt.Errorf("failed to delete product: %w", err)
	}

	return nil
}

func (r *productRepositiory) FindByID(id uint) (*domain.Product, error){
	var product domain.Product
	if err := r.db.First(&product, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("product not found")
		}
		return nil, fmt.Errorf("failed to find product: %w", err)
	}

	return &product, nil
}

func (r *productRepositiory) ListAll(filters domain.ProductFilter) ([]*domain.Product, int64, error){
	var products []*domain.Product
	var total int64

	query := r.db.Model(&domain.Product{})

	// customers only see active products
	if !filters.Inactive {
		query = query.Where("is_active = ?", true)
	}

	// search by name or description
	if filters.Search != ""{
		query = query.Where(
			"name ILIKE ? OR description ILIKE ?",
			"%"+filters.Search+"%",
			"%"+filters.Search+"%",
		)
	}

	// filter by type
	if filters.Type != ""{
		query = query.Where("LOWER(type) = LOWER(?)", filters.Type)
	}

	if filters.Color != ""{
		query = query.Where("LOWER(color) = LOWER(?)", filters.Color)
	}

	// filter by price range
	if filters.MinPrice > 0 {
		query = query.Where("sale_price >= ?", filters.MinPrice)
	}
	if filters.MaxPrice > 0 {
		query = query.Where("sale_price <= ?", filters.MaxPrice)
	}

	// filter in stock only
	if filters.InStock {
		query = query.Where("stock > 0")
	}

	// get total count before pagination
	query.Count(&total)

	// pagination
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.Limit < 1 {
		filters.Limit = 10
	}                                           // eg ; SELECT * FROM products LIMIT 10 OFFSET 10 ; skip first 5 records
	offset := (filters.Page - 1) * filters.Limit //means "how many records to skip"

	// filtering happens
	if err := query.Offset(offset).Limit(filters.Limit).Find(&products).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list products: %w", err)
	}

	return products, total, nil
}