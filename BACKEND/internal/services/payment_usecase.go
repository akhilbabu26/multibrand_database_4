package usecase

import (
	"context"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/pkg/constant"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/razorpay"
)

type paymentUsecase struct {
	orderRepo contracts.OrderRepository
	razorpay  *razorpay.RazorpayClient
}

func NewPaymentUsecase(orderRepo contracts.OrderRepository, razorpay *razorpay.RazorpayClient) contracts.PaymentUsecase {
	return &paymentUsecase{
		orderRepo: orderRepo,
		razorpay:  razorpay,
	}
}

func (u *paymentUsecase) CreatePayment(ctx context.Context, userID uint, req dto.CreatePaymentRequest) (*dto.CreatePaymentResponse, error) {
	order, err := u.orderRepo.FindByID(ctx, req.OrderID)
	if err != nil {
		return nil, err
	}
	if order.UserID != userID {
		return nil, apperrors.UnauthorizedAccess()
	}
	if order.PaymentStatus == constant.PaymentStatusPaid {
		return nil, apperrors.BadRequest("payment is already completed", nil)
	}

	razorpayOrderID, err := u.razorpay.CreateOrder(order.TotalAmount, order.ID)
	if err != nil {
		return nil, apperrors.Internal("failed to create razorpay order", err)
	}

	// update razorpay order ID in DB
	u.orderRepo.UpdateRazorpayOrderID(order.ID, razorpayOrderID)

	return &dto.CreatePaymentResponse{
		RazorpayOrderID: razorpayOrderID,
		Amount:          order.TotalAmount,
		Currency:        "INR",
		KeyID:           u.razorpay.GetKeyID(),
	}, nil
}

func (u *paymentUsecase) VerifyPayment(ctx context.Context, userID uint, req dto.VerifyPaymentRequest) error {
	order, err := u.orderRepo.FindByID(ctx, req.OrderID)
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
		u.orderRepo.UpdatePayment(order.ID, constant.PaymentStatusFailed, req.RazorpayPaymentID)
		return apperrors.BadRequest("invalid payment signature", nil)
	}

	return u.orderRepo.UpdatePayment(order.ID, constant.PaymentStatusPaid, req.RazorpayPaymentID)
}
