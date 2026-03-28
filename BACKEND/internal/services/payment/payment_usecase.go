package usecase

import (
	paymentDomain "github.com/akhilbabu26/multibrand_database_4/internal/models/payment"
	orderDomain "github.com/akhilbabu26/multibrand_database_4/internal/models/order"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/razorpay"
)

type paymentUsecase struct {
	orderRepo orderDomain.OrderRepository
	razorpay  *razorpay.RazorpayClient
}

func NewPaymentUsecase(orderRepo orderDomain.OrderRepository, razorpay *razorpay.RazorpayClient) paymentDomain.PaymentUsecase {
	return &paymentUsecase{
		orderRepo: orderRepo,
		razorpay:  razorpay,
	}
}

func (u *paymentUsecase) CreatePayment(userID uint, req paymentDomain.CreatePaymentRequest) (*paymentDomain.CreatePaymentResponse, error) {
	order, err := u.orderRepo.FindByID(req.OrderID)
	if err != nil {
		return nil, err
	}
	if order.UserID != userID {
		return nil, apperrors.UnauthorizedAccess()
	}
	if order.PaymentStatus == orderDomain.PaymentStatusPaid {
		return nil, apperrors.BadRequest("payment is already completed", nil)
	}

	razorpayOrderID, err := u.razorpay.CreateOrder(order.TotalAmount, order.ID)
	if err != nil {
		return nil, apperrors.Internal("failed to create razorpay order", err)
	}

	// update razorpay order ID in DB
	u.orderRepo.UpdateRazorpayOrderID(order.ID, razorpayOrderID)

	return &paymentDomain.CreatePaymentResponse{
		RazorpayOrderID: razorpayOrderID,
		Amount:          order.TotalAmount,
		Currency:        "INR",
		KeyID:           u.razorpay.GetKeyID(),
	}, nil
}

func (u *paymentUsecase) VerifyPayment(userID uint, req paymentDomain.VerifyPaymentRequest) error {
	order, err := u.orderRepo.FindByID(req.OrderID)
	if err != nil {
		return err
	}
	if order.UserID != userID {
		return apperrors.UnauthorizedAccess()
	}
	if order.RazorpayOrderID != req.RazorpayOrderID {
		return apperrors.BadRequest("invalid order reference", nil)
	}

	isValid := u.razorpay.VerifyPayment(req.RazorpayOrderID, req.RazorpayPaymentID, req.RazorpaySignature)
	if !isValid {
		u.orderRepo.UpdatePayment(order.ID, orderDomain.PaymentStatusFailed, req.RazorpayPaymentID)
		return apperrors.BadRequest("invalid payment signature", nil)
	}

	return u.orderRepo.UpdatePayment(order.ID, orderDomain.PaymentStatusPaid, req.RazorpayPaymentID)
}
