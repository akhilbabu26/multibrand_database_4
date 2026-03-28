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

func (r *orderRepository) Create(order *domain.Order) error {
	if err := r.db.Create(order).Error; err != nil {
		return apperrors.Internal("failed to create order", err)
	}
	return nil
}

func (r *orderRepository) FindByID(id uint) (*domain.Order, error) {
	var order domain.Order
	if err := r.db.Preload("Items").First(&order, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.OrderNotFound(err)
		}
		return nil, apperrors.Internal("failed to find order", err)
	}
	return &order, nil
}

func (r *orderRepository) FindByUserID(userID uint) ([]*domain.Order, error) {
	var orders []*domain.Order
	if err := r.db.Where("user_id = ?", userID).
		Preload("Items").
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		return nil, apperrors.Internal("failed to find orders", err)
	}
	return orders, nil
}

func (r *orderRepository) FindAll() ([]*domain.Order, error) {
	var orders []*domain.Order
	if err := r.db.Preload("Items").
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		return nil, apperrors.Internal("failed to find orders", err)
	}
	return orders, nil
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