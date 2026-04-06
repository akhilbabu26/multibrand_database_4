package usecase

import (
	"context"
	"fmt"

	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/database"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"gorm.io/gorm"
)

type orderUsecase struct {
	repo        contracts.OrderRepository
	cartRepo    contracts.CartRepository
	productRepo contracts.ProductRepository
	addressRepo contracts.AddressRepository
	txManager   database.TransactionManager
}

func NewOrderUsecase(
	repo contracts.OrderRepository,
	cartRepo contracts.CartRepository,
	productRepo contracts.ProductRepository,
	addressRepo contracts.AddressRepository,
	txManager database.TransactionManager,
) contracts.OrderUsecase {
	return &orderUsecase{
		repo:        repo,
		cartRepo:    cartRepo,
		productRepo: productRepo,
		addressRepo: addressRepo,
		txManager:   txManager,
	}
}

// ─────────────────────────────────────────
// User
// ─────────────────────────────────────────

func (u *orderUsecase) PlaceOrder(ctx context.Context, userID uint, req dto.PlaceOrderRequest) (*dto.OrderResponse, error) {
	if req.PaymentMethod != entities.PaymentMethodsCOD &&
		req.PaymentMethod != entities.PaymentMethodRazorpay {
		return nil, apperrors.InvalidPaymentMethod()
	}

	address, err := u.addressRepo.FindByID(ctx, req.AddressID)
	if err != nil {
		return nil, err
	}
	if address.UserID != userID {
		return nil, apperrors.UnauthorizedAccess()
	}

	cart, err := u.cartRepo.GetCartWithItems(userID)
	if err != nil {
		return nil, apperrors.CartEmpty()
	}
	if len(cart.Items) == 0 {
		return nil, apperrors.CartEmpty()
	}

	var orderItems []entities.OrderItem
	var totalAmount float64
	var order *entities.Order

	err = u.txManager.ExecuteTx(func(tx *gorm.DB) error {
		txProductRepo := u.productRepo.WithTx(tx)
		txOrderRepo := u.repo.WithTx(tx) // “Temporary changes to the tables used by these repos inside the transaction”
		txCartRepo := u.cartRepo.WithTx(tx)

		for _, item := range cart.Items {
			product, txErr := txProductRepo.FindByIDForUpdate(ctx, item.ProductID)
			if txErr != nil {
				return txErr
			}
			if !product.IsActive {
				return apperrors.ProductNotAvailable()
			}
			if product.Stock < item.Quantity {
				return apperrors.BadRequest(
					fmt.Sprintf("insufficient stock for '%s', only %d available", product.Name, product.Stock),
					nil,
				)
			}

			subtotal := product.SalePrice * float64(item.Quantity)
			totalAmount += subtotal

			imageURL := ""
			if len(product.Images) > 0 {
				imageURL = product.Images[0].ImageURL // Get the first image URL of the product and store it in imageURL
			}

			orderItems = append(orderItems, entities.OrderItem{
				ProductID:    product.ID,
				ProductName:  product.Name,
				ProductImage: imageURL,
				Quantity:     item.Quantity,
				Price:        product.SalePrice,
				Subtotal:     subtotal,
			})

			product.Stock -= item.Quantity
			if updateErr := txProductRepo.Update(ctx, product); updateErr != nil {
				return updateErr
			}
		}

		order = &entities.Order{
			UserID:        userID,
			AddressID:     req.AddressID,
			PaymentMethod: req.PaymentMethod,
			PaymentStatus: entities.PaymentStatusPending,
			Status:        entities.OrderStatusPending,
			TotalAmount:   totalAmount,
		}

		if createErr := txOrderRepo.Create(ctx, order); createErr != nil {
			return createErr
		}

		for i := range orderItems {
			orderItems[i].OrderID = order.ID
		}
		if itemsErr := txOrderRepo.CreateItems(orderItems); itemsErr != nil {
			return itemsErr
		}

		return txCartRepo.ClearCart(cart.ID)
	})

	if err != nil {
		return nil, err
	}

	return u.buildOrderResponse(order, address, orderItems), nil
}

func (u *orderUsecase) BuyNow(ctx context.Context, userID uint, req dto.BuyNowRequest) (*dto.OrderResponse, error) {
	if req.PaymentMethod != entities.PaymentMethodsCOD &&
		req.PaymentMethod != entities.PaymentMethodRazorpay {
		return nil, apperrors.InvalidPaymentMethod()
	}

	address, err := u.addressRepo.FindByID(ctx, req.AddressID)
	if err != nil {
		return nil, err
	}
	if address.UserID != userID {
		return nil, apperrors.UnauthorizedAccess()
	}

	var order *entities.Order
	var subtotal float64
	var orderItems []entities.OrderItem

	err = u.txManager.ExecuteTx(func(tx *gorm.DB) error {
		txProductRepo := u.productRepo.WithTx(tx)
		txOrderRepo := u.repo.WithTx(tx)

		product, txErr := txProductRepo.FindByIDForUpdate(ctx, req.ProductID)
		if txErr != nil {
			return txErr
		}
		if !product.IsActive {
			return apperrors.ProductNotAvailable()
		}
		if product.Stock < req.Quantity {
			return apperrors.BadRequest(
				fmt.Sprintf("insufficient stock. only %d available", product.Stock),
				nil,
			)
		}

		subtotal = product.SalePrice * float64(req.Quantity)

		order = &entities.Order{
			UserID:        userID,
			AddressID:     req.AddressID,
			PaymentMethod: req.PaymentMethod,
			PaymentStatus: entities.PaymentStatusPending,
			Status:        entities.OrderStatusPending,
			TotalAmount:   subtotal,
		}
		if createErr := txOrderRepo.Create(ctx, order); createErr != nil {
			return createErr
		}

		imageURL := ""
		if len(product.Images) > 0 {
			imageURL = product.Images[0].ImageURL
		}

		orderItems = []entities.OrderItem{{
			OrderID:      order.ID,
			ProductID:    product.ID,
			ProductName:  product.Name,
			ProductImage: imageURL,
			Quantity:     req.Quantity,
			Price:        product.SalePrice,
			Subtotal:     subtotal,
		}}

		if itemsErr := txOrderRepo.CreateItems(orderItems); itemsErr != nil {
			return itemsErr
		}

		product.Stock -= req.Quantity
		return txProductRepo.Update(ctx, product)
	})

	if err != nil {
		return nil, err
	}

	return u.buildOrderResponse(order, address, orderItems), nil
}

func (u *orderUsecase) CancelOrder(ctx context.Context, userID, orderID uint) error {
	order, err := u.repo.FindByID(ctx, orderID)
	if err != nil {
		return err
	}
	if order.UserID != userID {
		return apperrors.UnauthorizedAccess()
	}
	if order.Status != entities.OrderStatusPending &&
		order.Status != entities.OrderStatusConfirmed {
		return apperrors.OrderCannotBeCancelled()
	}

	for _, item := range order.Items {
		product, err := u.productRepo.FindByID(ctx, item.ProductID)
		if err != nil {
			continue
		}
		product.Stock += item.Quantity
		u.productRepo.Update(ctx, product)
	}

	if err := u.repo.UpdateStatus(orderID, entities.OrderStatusCancelled); err != nil {
		return err
	}

	if order.PaymentMethod == entities.PaymentMethodRazorpay &&
		order.PaymentStatus == entities.PaymentStatusPaid {
		u.repo.UpdatePayment(orderID, entities.PaymentStatusRefunded, order.RazorpayPaymentID)
	}

	return nil
}

func (u *orderUsecase) GetOrder(ctx context.Context, userID, orderID uint) (*dto.OrderResponse, error) {
	order, err := u.repo.FindByID(ctx, orderID)
	if err != nil {
		return nil, err
	}
	if order.UserID != userID {
		return nil, apperrors.UnauthorizedAccess()
	}

	address, err := u.addressRepo.FindByID(ctx, order.AddressID)
	if err != nil {
		return nil, err
	}

	return u.buildOrderResponse(order, address, order.Items), nil
}

// ✅ N+1 Fix — batch fetch addresses
func (u *orderUsecase) GetMyOrders(ctx context.Context, userID uint, filter dto.OrderFilter) ([]*dto.OrderResponse, int64, error) {
	orders, total, err := u.repo.FindByUserID(userID, filter)
	if err != nil {
		return nil, 0, err
	}
	if len(orders) == 0 {
		return []*dto.OrderResponse{}, total, nil
	}

	// collect unique address IDs
	seen := map[uint]bool{}
	var addressIDs []uint
	for _, o := range orders {
		if !seen[o.AddressID] {
			addressIDs = append(addressIDs, o.AddressID)
			seen[o.AddressID] = true
		}
	}

	// fetch all in ONE query
	addressMap, err := u.addressRepo.FindByIDs(addressIDs)
	if err != nil {
		return nil, 0, err
	}

	var response []*dto.OrderResponse
	for _, order := range orders {
		address, ok := addressMap[order.AddressID]
		if !ok {
			continue
		}
		response = append(response, u.buildOrderResponse(order, address, order.Items))
	}

	return response, total, nil
}

// ─────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────

// N+1 Fix — batch fetch addresses
func (u *orderUsecase) GetAllOrders(ctx context.Context, filter dto.OrderFilter) ([]*dto.OrderResponse, int64, error) {
	orders, total, err := u.repo.FindAll(filter)
	if err != nil {
		return nil, 0, err
	}
	if len(orders) == 0 {
		return []*dto.OrderResponse{}, total, nil
	}

	seen := map[uint]bool{}
	var addressIDs []uint
	for _, o := range orders {
		if !seen[o.AddressID] {
			addressIDs = append(addressIDs, o.AddressID)
			seen[o.AddressID] = true
		}
	}

	addressMap, err := u.addressRepo.FindByIDs(addressIDs)
	if err != nil {
		return nil, 0, err
	}

	var response []*dto.OrderResponse
	for _, order := range orders {
		address, ok := addressMap[order.AddressID]
		if !ok {
			continue
		}
		response = append(response, u.buildOrderResponse(order, address, order.Items))
	}

	return response, total, nil
}

func (u *orderUsecase) AdminGetOrder(ctx context.Context, orderID uint) (*dto.OrderResponse, error) {
	order, err := u.repo.FindByID(ctx, orderID)
	if err != nil {
		return nil, err
	}

	address, err := u.addressRepo.FindByID(ctx, order.AddressID)
	if err != nil {
		return nil, err
	}

	return u.buildOrderResponse(order, address, order.Items), nil
}

func (u *orderUsecase) UpdateOrderStatus(ctx context.Context, orderID uint, req dto.UpdateOrderStatusRequest) error {
	order, err := u.repo.FindByID(ctx, orderID)
	if err != nil {
		return err
	}

	if !entities.IsValidTransition(order.Status, req.Status) {
		return apperrors.InvalidStatusTransition(
			string(order.Status),
			string(req.Status),
		)
	}

	return u.repo.UpdateStatus(orderID, req.Status)
}

func (u *orderUsecase) AdminCancelOrder(ctx context.Context, orderID uint) error {
	order, err := u.repo.FindByID(ctx, orderID)
	if err != nil {
		return err
	}

	if order.Status == entities.OrderStatusDelivered ||
		order.Status == entities.OrderStatusCancelled {
		return apperrors.OrderCannotBeCancelled()
	}

	for _, item := range order.Items {
		product, err := u.productRepo.FindByID(ctx, item.ProductID)
		if err != nil {
			continue
		}
		product.Stock += item.Quantity
		u.productRepo.Update(ctx, product)
	}

	if err := u.repo.UpdateStatus(orderID, entities.OrderStatusCancelled); err != nil {
		return err
	}

	if order.PaymentMethod == entities.PaymentMethodRazorpay &&
		order.PaymentStatus == entities.PaymentStatusPaid {
		u.repo.UpdatePayment(orderID, entities.PaymentStatusRefunded, order.RazorpayPaymentID)
	}

	return nil
}

// ─────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────

func (u *orderUsecase) buildOrderResponse(
	order *entities.Order,
	address *entities.Address,
	items []entities.OrderItem,
) *dto.OrderResponse {
	return &dto.OrderResponse{
		ID:              order.ID,
		Status:          order.Status,
		PaymentMethod:   order.PaymentMethod,
		PaymentStatus:   order.PaymentStatus,
		TotalAmount:     order.TotalAmount,
		RazorpayOrderID: order.RazorpayOrderID,
		Items:           items,
		Address: dto.OrderAddress{
			FullName: address.FullName,
			Phone:    address.Phone,
			Street:   address.Street,
			Landmark: address.Landmark,
			City:     address.City,
			State:    address.State,
			PinCode:  address.PinCode,
		},
		CreatedAt: order.CreatedAt,
	}
}
