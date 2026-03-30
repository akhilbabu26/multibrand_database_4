package repository

import (
	"errors"

	domain    "github.com/akhilbabu26/multibrand_database_4/internal/models/order"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"gorm.io/gorm"
)

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) domain.OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) WithTx(tx *gorm.DB) domain.OrderRepository {
	return &orderRepository{db: tx}
}

func (r *orderRepository) Create(order *domain.Order) error {
	if err := r.db.Create(order).Error; err != nil {
		return apperrors.Internal("failed to create order", err)
	}
	return nil
}

func (r *orderRepository) FindByID(id uint) (*domain.Order, error) {
	var order domain.Order
	if err := r.db.Preload("Items", func(db *gorm.DB) *gorm.DB {
		return db.Limit(100)
	}).First(&order, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.OrderNotFound(err)
		}
		return nil, apperrors.Internal("failed to find order", err)
	}
	return &order, nil
}

func (r *orderRepository) FindByUserID(userID uint, page, limit int) ([]*domain.Order, int64, error) {
	var orders []*domain.Order
	var total int64

	query := r.db.Model(&domain.Order{}).Where("user_id = ?", userID)
	query.Count(&total)

	offset := (page - 1) * limit
	if err := query.Preload("Items", func(db *gorm.DB) *gorm.DB {
		return db.Limit(100)
	}).
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&orders).Error; err != nil {
		return nil, 0, apperrors.Internal("failed to find orders", err)
	}
	return orders, total, nil
}

func (r *orderRepository) FindAll(page, limit int) ([]*domain.Order, int64, error) {
	var orders []*domain.Order
	var total int64

	query := r.db.Model(&domain.Order{})
	query.Count(&total)

	offset := (page - 1) * limit
	if err := query.Preload("Items", func(db *gorm.DB) *gorm.DB {
		return db.Limit(100)
	}).
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&orders).Error; err != nil {
		return nil, 0, apperrors.Internal("failed to find orders", err)
	}
	return orders, total, nil
}

func (r *orderRepository) UpdateStatus(id uint, status domain.OrderStatus) error {
	if err := r.db.Model(&domain.Order{}).
		Where("id = ?", id).
		Update("status", status).Error; err != nil {
		return apperrors.Internal("failed to update order status", err)
	}
	return nil
}

func (r *orderRepository) UpdatePayment(id uint, paymentStatus domain.PaymentStatus, razorpayPaymentID string) error {
	if err := r.db.Model(&domain.Order{}).
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
	if err := r.db.Model(&domain.Order{}).
		Where("id = ?", id).
		Update("razorpay_order_id", razorpayOrderID).Error; err != nil {
		return apperrors.Internal("failed to update razorpay order id", err)
	}
	return nil
}

func (r *orderRepository) CreateItems(items []domain.OrderItem) error {
	if err := r.db.Create(&items).Error; err != nil {
		return apperrors.Internal("failed to create order items", err)
	}
	return nil
}