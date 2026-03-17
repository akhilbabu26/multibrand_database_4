package handler

import (
	"net/http"
	"strconv"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/domain/wishlist"
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	if err := h.usecase.AddToWishlist(userID, uint(productID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "added to wishlist"})
}

func (h *WishlistHandler) RemoveFromWishlist(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	productID, err := strconv.Atoi(c.Param("productId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	if err := h.usecase.RemoveFromWishlist(userID, uint(productID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "removed from wishlist"})
}

func (h *WishlistHandler) GetWishlist(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	wishlist, err := h.usecase.GetWishlist(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"wishlist": wishlist,
		"total":    len(wishlist),
	})
}

func (h *WishlistHandler) MoveToCart(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	productID, err := strconv.Atoi(c.Param("productId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	if err := h.usecase.MoveToCart(userID, uint(productID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "moved to cart successfully"})
}