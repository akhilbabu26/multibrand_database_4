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
)

type orderRepository struct {
	generic.Repository[entities.Order]
}

func NewOrderRepository(db *gorm.DB) contracts.OrderRepository {
	return &orderRepository{
		Repository: generic.NewGenericRepository[entities.Order](db),
	}
}

func (r *orderRepository) WithTx(tx *gorm.DB) contracts.OrderRepository {
	return &orderRepository{
		Repository: generic.NewGenericRepository[entities.Order](tx),
	}
}

func (r *orderRepository) FindByID(ctx context.Context, id uint) (*entities.Order, error) {
	var order entities.Order
	if err := r.DB().WithContext(ctx).Preload("Items", func(db *gorm.DB) *gorm.DB {
		return db.Limit(100)
	}).First(&order, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.OrderNotFound(err)
		}
		return nil, apperrors.Internal("failed to find order", err)
	}
	return &order, nil
}

func (r *orderRepository) FindByUserID(userID uint, filter dto.OrderFilter) ([]*entities.Order, int64, error) {
	var orders []*entities.Order
	var total int64

	query := r.DB().Model(&entities.Order{}).Where("user_id = ?", userID)

	if len(filter.Statuses) > 0 {
		query = query.Where("status IN ?", filter.Statuses)
	} else if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	if filter.StartDate != nil {
		query = query.Where("created_at >= ?", filter.StartDate)
	}
	if filter.EndDate != nil {
		query = query.Where("created_at <= ?", filter.EndDate)
	}
	if filter.OrderID != "" {
		query = query.Where("CAST(id AS TEXT) LIKE ?", "%"+filter.OrderID+"%")
	}

	query.Count(&total)

	offset := (filter.Page - 1) * filter.Limit
	if err := query.Preload("Items", func(db *gorm.DB) *gorm.DB {
		return db.Limit(100)
	}).
		Order("created_at DESC").
		Offset(offset).Limit(offset+filter.Limit).
		Find(&orders).Error; err != nil {
		return nil, 0, apperrors.Internal("failed to find orders", err)
	}
	return orders, total, nil
}

func (r *orderRepository) FindAll(filter dto.OrderFilter) ([]*entities.Order, int64, error) {
	var orders []*entities.Order
	var total int64

	query := r.DB().Model(&entities.Order{})

	if len(filter.Statuses) > 0 {
		query = query.Where("status IN ?", filter.Statuses)
	} else if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	if filter.StartDate != nil {
		query = query.Where("created_at >= ?", filter.StartDate)
	}
	if filter.EndDate != nil {
		query = query.Where("created_at <= ?", filter.EndDate)
	}
	if filter.OrderID != "" {
		query = query.Where("CAST(id AS TEXT) LIKE ?", "%"+filter.OrderID+"%")
	}

	query.Count(&total)

	offset := (filter.Page - 1) * filter.Limit
	if err := query.Preload("Items", func(db *gorm.DB) *gorm.DB {
		return db.Limit(100)
	}).
		Order("created_at DESC").
		Offset(offset).Limit(filter.Limit).
		Find(&orders).Error; err != nil {
		return nil, 0, apperrors.Internal("failed to find orders", err)
	}
	return orders, total, nil
}

func (r *orderRepository) UpdateStatus(id uint, status entities.OrderStatus) error {
	if err := r.DB().Model(&entities.Order{}).
		Where("id = ?", id).
		Update("status", status).Error; err != nil {
		return apperrors.Internal("failed to update order status", err)
	}
	return nil
}

func (r *orderRepository) UpdatePayment(id uint, paymentStatus entities.PaymentStatus, razorpayPaymentID string) error {
	if err := r.DB().Model(&entities.Order{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"payment_status":      paymentStatus,
			"razorpay_payment_id": razorpayPaymentID,
		}).Error; err != nil {
		return apperrors.Internal("failed to update payment", err)
	}
	return nil
}

func (r *orderRepository) UpdateRazorpayOrderID(id uint, razorpayOrderID string) error {
	if err := r.DB().Model(&entities.Order{}).
		Where("id = ?", id).
		Update("razorpay_order_id", razorpayOrderID).Error; err != nil {
		return apperrors.Internal("failed to update razorpay order id", err)
	}
	return nil
}

func (r *orderRepository) CreateItems(items []entities.OrderItem) error {
	if err := r.DB().Create(&items).Error; err != nil {
		return apperrors.Internal("failed to create order items", err)
	}
	return nil
}
