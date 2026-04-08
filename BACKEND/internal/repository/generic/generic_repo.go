package generic

import (
	"context"
	"errors"

	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"gorm.io/gorm"
)

// Repository is a strongly-typed, reusable base interface for all models.
type Repository[T any] interface {
	Create(ctx context.Context, entity *T) error
	Update(ctx context.Context, entity *T) error
	Delete(ctx context.Context, id uint) error
	FindByID(ctx context.Context, id uint) (*T, error)
	DB() *gorm.DB
}

type genericRepository[T any] struct {
	db *gorm.DB
}

func NewGenericRepository[T any](db *gorm.DB) Repository[T] {
	return &genericRepository[T]{db: db}
}

func (r *genericRepository[T]) DB() *gorm.DB {
	return r.db
}

func (r *genericRepository[T]) Create(ctx context.Context, entity *T) error {
	if err := r.db.WithContext(ctx).Create(entity).Error; err != nil {
		return apperrors.Internal("failed to create record", err)
	}
	return nil
}

func (r *genericRepository[T]) Update(ctx context.Context, entity *T) error {
	if err := r.db.WithContext(ctx).Save(entity).Error; err != nil {
		return apperrors.Internal("failed to update record", err)
	}
	return nil
}

// Delete soft-deletes the record and returns NotFound if no row was affected.
func (r *genericRepository[T]) Delete(ctx context.Context, id uint) error {
	result := r.db.WithContext(ctx).Delete(new(T), id)
	if result.Error != nil {
		return apperrors.Internal("failed to delete record", result.Error)
	}
	if result.RowsAffected == 0 {
		return apperrors.NotFound("record not found", nil)
	}
	return nil
}

func (r *genericRepository[T]) FindByID(ctx context.Context, id uint) (*T, error) {
	var model T
	if err := r.db.WithContext(ctx).First(&model, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.NotFound("record not found", err)
		}
		return nil, apperrors.Internal("failed to find record", err)
	}
	return &model, nil
}
