package usecase

import (
	"fmt"

	orderDomain   "github.com/akhilbabu26/multibrand_database_4/internal/models/order"
	cartDomain    "github.com/akhilbabu26/multibrand_database_4/internal/models/cart"
	productDomain "github.com/akhilbabu26/multibrand_database_4/internal/models/product"
	addressDomain "github.com/akhilbabu26/multibrand_database_4/internal/models/address"
	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/database"
	apperrors     "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"gorm.io/gorm"
)

type orderUsecase struct {
	repo        orderDomain.OrderRepository
	cartRepo    cartDomain.CartRepository
	productRepo productDomain.ProductRepository
	addressRepo addressDomain.AddressRepository
	txManager   database.TransactionManager
}

func NewOrderUsecase(
	repo orderDomain.OrderRepository,
	cartRepo cartDomain.CartRepository,
	productRepo productDomain.ProductRepository,
	addressRepo addressDomain.AddressRepository,
	txManager database.TransactionManager,
) orderDomain.OrderUsecase {
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

func (u *orderUsecase) PlaceOrder(userID uint, req orderDomain.PlaceOrderRequest) (*orderDomain.OrderResponse, error) {
	if req.PaymentMethod != orderDomain.PaymentMethodsCOD &&
		req.PaymentMethod != orderDomain.PaymentMethodRazorpay {
		return nil, apperrors.InvalidPaymentMethod()
	}

	address, err := u.addressRepo.FindByID(req.AddressID)
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

	var orderItems []orderDomain.OrderItem
	var totalAmount float64
	var order *orderDomain.Order

	err = u.txManager.ExecuteTx(func(tx *gorm.DB) error {
		txProductRepo := u.productRepo.WithTx(tx)
		txOrderRepo := u.repo.WithTx(tx) // “Temporary changes to the tables used by these repos inside the transaction”
		txCartRepo := u.cartRepo.WithTx(tx)

		for _, item := range cart.Items {
			product, txErr := txProductRepo.FindByIDForUpdate(item.ProductID)
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

			orderItems = append(orderItems, orderDomain.OrderItem{
				ProductID:    product.ID,
				ProductName:  product.Name,
				ProductImage: imageURL,
				Quantity:     item.Quantity,
				Price:        product.SalePrice,
				Subtotal:     subtotal,
			})
			
			product.Stock -= item.Quantity
			if updateErr := txProductRepo.Update(product); updateErr != nil {
				return updateErr
			}
		}

		order = &orderDomain.Order{
			UserID:        userID,
			AddressID:     req.AddressID,
			PaymentMethod: req.PaymentMethod,
			PaymentStatus: orderDomain.PaymentStatusPending,
			Status:        orderDomain.OrderStatusPending,
			TotalAmount:   totalAmount,
		}

		if createErr := txOrderRepo.Create(order); createErr != nil {
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

func (u *orderUsecase) BuyNow(userID uint, req orderDomain.BuyNowRequest) (*orderDomain.OrderResponse, error) {
	if req.PaymentMethod != orderDomain.PaymentMethodsCOD &&
		req.PaymentMethod != orderDomain.PaymentMethodRazorpay {
		return nil, apperrors.InvalidPaymentMethod()
	}

	address, err := u.addressRepo.FindByID(req.AddressID)
	if err != nil {
		return nil, err
	}
	if address.UserID != userID {
		return nil, apperrors.UnauthorizedAccess()
	}

	var order *orderDomain.Order
	var subtotal float64
	var orderItems []orderDomain.OrderItem

	err = u.txManager.ExecuteTx(func(tx *gorm.DB) error {
		txProductRepo := u.productRepo.WithTx(tx)
		txOrderRepo := u.repo.WithTx(tx)

		product, txErr := txProductRepo.FindByIDForUpdate(req.ProductID)
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

		order = &orderDomain.Order{
			UserID:        userID,
			AddressID:     req.AddressID,
			PaymentMethod: req.PaymentMethod,
			PaymentStatus: orderDomain.PaymentStatusPending,
			Status:        orderDomain.OrderStatusPending,
			TotalAmount:   subtotal,
		}

		if createErr := txOrderRepo.Create(order); createErr != nil {
			return createErr
		}

		imageURL := ""
		if len(product.Images) > 0 {
			imageURL = product.Images[0].ImageURL
		}

		orderItems = []orderDomain.OrderItem{{
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
		return txProductRepo.Update(product)
	})

	if err != nil {
		return nil, err
	}

	return u.buildOrderResponse(order, address, orderItems), nil
}

func (u *orderUsecase) CancelOrder(userID, orderID uint) error {
	order, err := u.repo.FindByID(orderID)
	if err != nil {
		return err
	}
	if order.UserID != userID {
		return apperrors.UnauthorizedAccess()
	}
	if order.Status != orderDomain.OrderStatusPending &&
		order.Status != orderDomain.OrderStatusConfirmed {
		return apperrors.OrderCannotBeCancelled()
	}

	for _, item := range order.Items {
		product, err := u.productRepo.FindByID(item.ProductID)
		if err != nil {
			continue
		}
		product.Stock += item.Quantity
		u.productRepo.Update(product)
	}

	if err := u.repo.UpdateStatus(orderID, orderDomain.OrderStatusCancelled); err != nil {
		return err
	}

	if order.PaymentMethod == orderDomain.PaymentMethodRazorpay &&
		order.PaymentStatus == orderDomain.PaymentStatusPaid {
		u.repo.UpdatePayment(orderID, orderDomain.PaymentStatusRefunded, order.RazorpayPaymentID)
	}

	return nil
}

func (u *orderUsecase) GetOrder(userID, orderID uint) (*orderDomain.OrderResponse, error) {
	order, err := u.repo.FindByID(orderID)
	if err != nil {
		return nil, err
	}
	if order.UserID != userID {
		return nil, apperrors.UnauthorizedAccess()
	}

	address, err := u.addressRepo.FindByID(order.AddressID)
	if err != nil {
		return nil, err
	}

	return u.buildOrderResponse(order, address, order.Items), nil
}

// ✅ N+1 Fix — batch fetch addresses
func (u *orderUsecase) GetMyOrders(userID uint, page, limit int) ([]*orderDomain.OrderResponse, int64, error) {
	orders, total, err := u.repo.FindByUserID(userID, page, limit)
	if err != nil {
		return nil, 0, err
	}
	if len(orders) == 0 {
		return []*orderDomain.OrderResponse{}, total, nil
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

	var response []*orderDomain.OrderResponse
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
func (u *orderUsecase) GetAllOrders(page, limit int) ([]*orderDomain.OrderResponse, int64, error) {
	orders, total, err := u.repo.FindAll(page, limit)
	if err != nil {
		return nil, 0, err
	}
	if len(orders) == 0 {
		return []*orderDomain.OrderResponse{}, total, nil
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

	var response []*orderDomain.OrderResponse
	for _, order := range orders {
		address, ok := addressMap[order.AddressID]
		if !ok {
			continue
		}
		response = append(response, u.buildOrderResponse(order, address, order.Items))
	}

	return response, total, nil
}

func (u *orderUsecase) AdminGetOrder(orderID uint) (*orderDomain.OrderResponse, error) {
	order, err := u.repo.FindByID(orderID)
	if err != nil {
		return nil, err
	}

	address, err := u.addressRepo.FindByID(order.AddressID)
	if err != nil {
		return nil, err
	}

	return u.buildOrderResponse(order, address, order.Items), nil
}

func (u *orderUsecase) UpdateOrderStatus(orderID uint, req orderDomain.UpdateOrderStatusRequest) error {
	order, err := u.repo.FindByID(orderID)
	if err != nil {
		return err
	}

	if !orderDomain.IsValidTransition(order.Status, req.Status) {
		return apperrors.InvalidStatusTransition(
			string(order.Status),
			string(req.Status),
		)
	}

	return u.repo.UpdateStatus(orderID, req.Status)
}

func (u *orderUsecase) AdminCancelOrder(orderID uint) error {
	order, err := u.repo.FindByID(orderID)
	if err != nil {
		return err
	}

	if order.Status == orderDomain.OrderStatusDelivered ||
		order.Status == orderDomain.OrderStatusCancelled {
		return apperrors.OrderCannotBeCancelled()
	}

	for _, item := range order.Items {
		product, err := u.productRepo.FindByID(item.ProductID)
		if err != nil {
			continue
		}
		product.Stock += item.Quantity
		u.productRepo.Update(product)
	}

	if err := u.repo.UpdateStatus(orderID, orderDomain.OrderStatusCancelled); err != nil {
		return err
	}

	if order.PaymentMethod == orderDomain.PaymentMethodRazorpay &&
		order.PaymentStatus == orderDomain.PaymentStatusPaid {
		u.repo.UpdatePayment(orderID, orderDomain.PaymentStatusRefunded, order.RazorpayPaymentID)
	}

	return nil
}

// ─────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────

func (u *orderUsecase) buildOrderResponse(
	order *orderDomain.Order,
	address *addressDomain.Address,
	items []orderDomain.OrderItem,
) *orderDomain.OrderResponse {
	return &orderDomain.OrderResponse{
		ID:              order.ID,
		Status:          order.Status,
		PaymentMethod:   order.PaymentMethod,
		PaymentStatus:   order.PaymentStatus,
		TotalAmount:     order.TotalAmount,
		RazorpayOrderID: order.RazorpayOrderID,
		Items:           items,
		Address: orderDomain.OrderAddress{
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