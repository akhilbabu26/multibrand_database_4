package handler

import (
	"strconv"

	domain    "github.com/akhilbabu26/multibrand_database_4/internal/models/address"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/validator"
	"github.com/gin-gonic/gin"
)

type AddressHandler struct {
	usecase domain.AddressUsecase
}

func NewAddressHandler(usecase domain.AddressUsecase) *AddressHandler {
	return &AddressHandler{usecase: usecase}
}

func (h *AddressHandler) AddAddress(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req domain.CreateAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	if err := h.usecase.AddAddress(userID, req); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleCreated(c, "address added successfully", nil)
}

func (h *AddressHandler) UpdateAddress(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	addressID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid address id", err))
		return
	}

	var req domain.UpdateAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	if err := h.usecase.UpdateAddress(userID, uint(addressID), req); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "address updated successfully", nil)
}

func (h *AddressHandler) DeleteAddress(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	addressID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid address id", err))
		return
	}

	if err := h.usecase.DeleteAddress(userID, uint(addressID)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "address deleted successfully", nil)
}

func (h *AddressHandler) GetAddresses(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	addresses, err := h.usecase.GetAddresses(userID)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "addresses fetched", gin.H{
		"addresses": addresses,
		"total":     len(addresses),
	})
}

func (h *AddressHandler) GetAddress(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	addressID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid address id", err))
		return
	}

	address, err := h.usecase.GetAddress(userID, uint(addressID))
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "address fetched", address)
}

func (h *AddressHandler) SetDefault(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	addressID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid address id", err))
		return
	}

	if err := h.usecase.SetDefault(userID, uint(addressID)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "default address updated", nil)
}