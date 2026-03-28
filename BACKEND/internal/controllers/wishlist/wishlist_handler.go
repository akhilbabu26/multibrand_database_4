package handler

import (
	"strconv"

	domain    "github.com/akhilbabu26/multibrand_database_4/internal/models/wishlist"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/gin-gonic/gin"
)

type WishlistHandler struct {
	usecase domain.WishlistUsecase
}

func NewWishlistHandler(usecase domain.WishlistUsecase) *WishlistHandler {
	return &WishlistHandler{usecase: usecase}
}

func (h *WishlistHandler) AddToWishlist(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	productID, err := strconv.Atoi(c.Param("productId"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid product id", err))
		return
	}

	if err := h.usecase.AddToWishlist(userID, uint(productID)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "added to wishlist", nil)
}

func (h *WishlistHandler) RemoveFromWishlist(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	productID, err := strconv.Atoi(c.Param("productId"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid product id", err))
		return
	}

	if err := h.usecase.RemoveFromWishlist(userID, uint(productID)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "removed from wishlist", nil)
}

func (h *WishlistHandler) GetWishlist(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	wishlist, err := h.usecase.GetWishlist(userID)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "wishlist fetched", gin.H{
		"wishlist": wishlist,
		"total":    len(wishlist),
	})
}

func (h *WishlistHandler) MoveToCart(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	productID, err := strconv.Atoi(c.Param("productId"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid product id", err))
		return
	}

	if err := h.usecase.MoveToCart(userID, uint(productID)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "moved to cart successfully", nil)
}