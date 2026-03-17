package handler

import (
	"net/http"
	"strconv"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/domain/cart"
	"github.com/gin-gonic/gin"
)

type CartHandler struct {
	usecase domain.CartUsecase
}

func NewCartHandler(usecase domain.CartUsecase) *CartHandler {
	return &CartHandler{usecase: usecase}
}

func (h *CartHandler) AddToCart(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	productID, err := strconv.Atoi(c.Param("productId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	var req struct {
		Quantity int `json:"quantity" binding:"required,min=1"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.usecase.AddToCart(userID, uint(productID), req.Quantity); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "added to cart"})
}

func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	productID, err := strconv.Atoi(c.Param("productId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	if err := h.usecase.RemoveFromCart(userID, uint(productID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "removed from cart"})
}

func (h *CartHandler) UpdateQuantity(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	productID, err := strconv.Atoi(c.Param("productId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	var req struct {
		Quantity int `json:"quantity" binding:"required,min=1"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.usecase.UpdateQuantity(userID, uint(productID), req.Quantity); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "cart updated"})
}

func (h *CartHandler) GetCart(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	cart, err := h.usecase.GetCart(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cart": cart})
}

func (h *CartHandler) ClearCart(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	if err := h.usecase.ClearCart(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "cart cleared"})
}