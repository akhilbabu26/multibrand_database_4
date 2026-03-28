package usecase

import (
	"fmt"

	orderDomain   "github.com/akhilbabu26/multibrand_database_4/internal/models/order"
	cartDomain    "github.com/akhilbabu26/multibrand_database_4/internal/models/cart"
	productDomain "github.com/akhilbabu26/multibrand_database_4/internal/models/product"
	addressDomain "github.com/akhilbabu26/multibrand_database_4/internal/models/address"
	apperrors     "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/razorpay"
)

type orderUsecase struct {
	repo        orderDomain.OrderRepository
	cartRepo    cartDomain.CartRepository
	productRepo productDomain.ProductRepository
	addressRepo addressDomain.AddressRepository
	razorpay    *razorpay.RazorpayClient
}

func NewOrderUsecase(
	repo orderDomain.OrderRepository,
	cartRepo cartDomain.CartRepository,
	productRepo productDomain.ProductRepository,
	addressRepo addressDomain.AddressRepository,
	razorpay *razorpay.RazorpayClient,
) orderDomain.OrderUsecase {
	return &orderUsecase{
		repo:        repo,
		cartRepo:    cartRepo,
		productRepo: productRepo,
		addressRepo: addressRepo,
		razorpay:    razorpay,
	}
}

// ─────────────────────────────────────────
// CUSTOMER
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

	for _, item := range cart.Items {
		product, err := u.productRepo.FindByID(item.ProductID)
		if err != nil {
			return nil, err
		}
		if !product.IsActive {
			return nil, apperrors.ProductNotAvailable()
		}
		if product.Stock < item.Quantity {
			return nil, apperrors.BadRequest(
				fmt.Sprintf("insufficient stock for '%s', only %d available", product.Name, product.Stock),
				nil,
			)
		}

		subtotal := product.SalePrice * float64(item.Quantity)
		totalAmount += subtotal

		orderItems = append(orderItems, orderDomain.OrderItem{
			ProductID:    product.ID,
			ProductName:  product.Name,
			ProductImage: product.ImageURL,
			Quantity:     item.Quantity,
			Price:        product.SalePrice,
			Subtotal:     subtotal,
		})
	}

	order := &orderDomain.Order{
		UserID:        userID,
		AddressID:     req.AddressID,
		PaymentMethod: req.PaymentMethod,
		PaymentStatus: orderDomain.PaymentStatusPending,
		Status:        orderDomain.OrderStatusPending,
		TotalAmount:   totalAmount,
	}

	if err := u.repo.Create(order); err != nil {
		return nil, err
	}

	for i := range orderItems {
		orderItems[i].OrderID = order.ID
	}
	if err := u.repo.CreateItems(orderItems); err != nil {
		return nil, err
	}

	// reduce stock
	for _, item := range cart.Items {
		product, _ := u.productRepo.FindByID(item.ProductID)
		product.Stock -= item.Quantity
		u.productRepo.Update(product)
	}

	u.cartRepo.ClearCart(cart.ID)

	if req.PaymentMethod == orderDomain.PaymentMethodRazorpay {
		razorpayOrderID, err := u.razorpay.CreateOrder(totalAmount, order.ID)
		if err != nil {
			return nil, apperrors.Internal("failed to initiate payment", err)
		}
		u.repo.UpdateRazorpayOrderID(order.ID, razorpayOrderID)
		order.RazorpayOrderID = razorpayOrderID
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

	product, err := u.productRepo.FindByID(req.ProductID)
	if err != nil {
		return nil, err
	}
	if !product.IsActive {
		return nil, apperrors.ProductNotAvailable()
	}
	if product.Stock < req.Quantity {
		return nil, apperrors.BadRequest(
			fmt.Sprintf("insufficient stock, only %d available", product.Stock),
			nil,
		)
	}

	subtotal := product.SalePrice * float64(req.Quantity)

	order := &orderDomain.Order{
		UserID:        userID,
		AddressID:     req.AddressID,
		PaymentMethod: req.PaymentMethod,
		PaymentStatus: orderDomain.PaymentStatusPending,
		Status:        orderDomain.OrderStatusPending,
		TotalAmount:   subtotal,
	}

	if err := u.repo.Create(order); err != nil {
		return nil, err
	}

	orderItems := []orderDomain.OrderItem{{
		OrderID:      order.ID,
		ProductID:    product.ID,
		ProductName:  product.Name,
		ProductImage: product.ImageURL,
		Quantity:     req.Quantity,
		Price:        product.SalePrice,
		Subtotal:     subtotal,
	}}

	if err := u.repo.CreateItems(orderItems); err != nil {
		return nil, err
	}

	product.Stock -= req.Quantity
	u.productRepo.Update(product)

	if req.PaymentMethod == orderDomain.PaymentMethodRazorpay {
		razorpayOrderID, err := u.razorpay.CreateOrder(subtotal, order.ID)
		if err != nil {
			return nil, apperrors.Internal("failed to initiate payment", err)
		}
		u.repo.UpdateRazorpayOrderID(order.ID, razorpayOrderID)
		order.RazorpayOrderID = razorpayOrderID
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
func (u *orderUsecase) GetMyOrders(userID uint) ([]*orderDomain.OrderResponse, error) {
	orders, err := u.repo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	if len(orders) == 0 {
		return []*orderDomain.OrderResponse{}, nil
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
		return nil, err
	}

	var response []*orderDomain.OrderResponse
	for _, order := range orders {
		address, ok := addressMap[order.AddressID]
		if !ok {
			continue
		}
		response = append(response, u.buildOrderResponse(order, address, order.Items))
	}

	return response, nil
}

func (u *orderUsecase) VerifyPayment(userID uint, req orderDomain.VerifyPaymentRequest) error {
	valid := u.razorpay.VerifyPayment(
		req.RazorpayOrderID,
		req.RazorpayPaymentID,
		req.RazorpaySignature,
	)
	if !valid {
		return apperrors.InvalidPaymentSignature()
	}

	orders, err := u.repo.FindByUserID(userID)
	if err != nil {
		return err
	}

	var targetOrder *orderDomain.Order
	for _, o := range orders {
		if o.RazorpayOrderID == req.RazorpayOrderID {
			targetOrder = o
			break
		}
	}

	if targetOrder == nil {
		return apperrors.OrderNotFound(nil)
	}

	if err := u.repo.UpdatePayment(
		targetOrder.ID,
		orderDomain.PaymentStatusPaid,
		req.RazorpayPaymentID,
	); err != nil {
		return err
	}

	return u.repo.UpdateStatus(targetOrder.ID, orderDomain.OrderStatusConfirmed)
}

// ─────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────

// ✅ N+1 Fix — batch fetch addresses
func (u *orderUsecase) GetAllOrders() ([]*orderDomain.OrderResponse, error) {
	orders, err := u.repo.FindAll()
	if err != nil {
		return nil, err
	}
	if len(orders) == 0 {
		return []*orderDomain.OrderResponse{}, nil
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
		return nil, err
	}

	var response []*orderDomain.OrderResponse
	for _, order := range orders {
		address, ok := addressMap[order.AddressID]
		if !ok {
			continue
		}
		response = append(response, u.buildOrderResponse(order, address, order.Items))
	}

	return response, nil
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