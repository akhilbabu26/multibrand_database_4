package contracts

import (
	"context"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
)

type PaymentUsecase interface {
	CreatePayment(ctx context.Context, userID uint, req dto.CreatePaymentRequest) (*dto.CreatePaymentResponse, error)
	VerifyPayment(ctx context.Context, userID uint, req dto.VerifyPaymentRequest) error
}
