package handler

import (
	"strconv"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/gin-gonic/gin"
)

type CartHandler struct {
	usecase contracts.CartUsecase
}

func NewCartHandler(usecase contracts.CartUsecase) *CartHandler {
	return &CartHandler{usecase: usecase}
}

func (h *CartHandler) AddToCart(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	productID, err := strconv.Atoi(c.Param("productId"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid product id", err))
		return
	}

	var req struct {
		Quantity int `json:"quantity" validate:"required,min=1"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := h.usecase.AddToCart(c.Request.Context(), userID, uint(productID), req.Quantity); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "added to cart", nil)
}

func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	productID, err := strconv.Atoi(c.Param("productId"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid product id", err))
		return
	}

	if err := h.usecase.RemoveFromCart(c.Request.Context(), userID, uint(productID)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "removed from cart", nil)
}

func (h *CartHandler) UpdateQuantity(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	productID, err := strconv.Atoi(c.Param("productId"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid product id", err))
		return
	}

	var req struct {
		Quantity int `json:"quantity" validate:"required,min=1"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := h.usecase.UpdateQuantity(c.Request.Context(), userID, uint(productID), req.Quantity); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "cart updated", nil)
}

func (h *CartHandler) GetCart(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	cart, err := h.usecase.GetCart(c.Request.Context(), userID)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "cart fetched", cart)
}

func (h *CartHandler) ClearCart(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	if err := h.usecase.ClearCart(c.Request.Context(), userID); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "cart cleared", nil)
}
