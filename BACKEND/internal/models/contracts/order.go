package contracts

import (
	"context"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	"github.com/akhilbabu26/multibrand_database_4/internal/repository/generic"
	"github.com/akhilbabu26/multibrand_database_4/pkg/constant"
	"gorm.io/gorm"
)

type OrderRepository interface {
	generic.Repository[entities.Order]
	WithTx(tx *gorm.DB) OrderRepository

	FindByUserID(userID uint, filter dto.OrderFilter) ([]*entities.Order, int64, error)
	FindAll(filter dto.OrderFilter) ([]*entities.Order, int64, error)
	UpdateStatus(id uint, status constant.OrderStatus) error
	UpdatePayment(id uint, paymentStatus constant.PaymentStatus, razorpayPaymentID string) error
	UpdateRazorpayOrderID(id uint, razorpayOrderID string) error

	CreateItems(items []entities.OrderItem) error
}

type OrderUsecase interface {
	PlaceOrder(ctx context.Context, userID uint, req dto.PlaceOrderRequest) (*dto.OrderResponse, error)
	BuyNow(ctx context.Context, userID uint, req dto.BuyNowRequest) (*dto.OrderResponse, error)
	CancelOrder(ctx context.Context, userID, orderID uint) error
	GetOrder(ctx context.Context, userID, orderID uint) (*dto.OrderResponse, error)
	GetMyOrders(ctx context.Context, userID uint, filter dto.OrderFilter) ([]*dto.OrderResponse, int64, error)

	GetAllOrders(ctx context.Context, filter dto.OrderFilter) ([]*dto.OrderResponse, int64, error)
	AdminGetOrder(ctx context.Context, orderID uint) (*dto.OrderResponse, error)
	UpdateOrderStatus(ctx context.Context, orderID uint, req dto.UpdateOrderStatusRequest) error
	AdminCancelOrder(ctx context.Context, orderID uint) error
}
