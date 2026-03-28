package handler

import (
	paymentDomain "github.com/akhilbabu26/multibrand_database_4/internal/models/payment"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/validator"

	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	usecase paymentDomain.PaymentUsecase
}

func NewPaymentHandler(usecase paymentDomain.PaymentUsecase) *PaymentHandler {
	return &PaymentHandler{usecase: usecase}
}

func (h *PaymentHandler) CreatePayment(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		apperrors.HandleError(c, apperrors.UnauthorizedAccess())
		return
	}

	var req paymentDomain.CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid payload", err))
		return
	}
	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	res, err := h.usecase.CreatePayment(userID.(uint), req)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "payment session generated", res)
}

func (h *PaymentHandler) VerifyPayment(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		apperrors.HandleError(c, apperrors.UnauthorizedAccess())
		return
	}

	var req paymentDomain.VerifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid payload", err))
		return
	}
	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	if err := h.usecase.VerifyPayment(userID.(uint), req); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "payment verified successfully", nil)
}
