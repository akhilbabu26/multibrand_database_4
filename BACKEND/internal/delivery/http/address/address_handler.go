package handler

import (
	"net/http"
	"strconv"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/domain/address"
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.usecase.AddAddress(userID, req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "address added successfully"})
}

func (h *AddressHandler) UpdateAddress(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	addressID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid address id"})
		return
	}

	var req domain.UpdateAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.usecase.UpdateAddress(userID, uint(addressID), req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "address updated successfully"})
}

func (h *AddressHandler) DeleteAddress(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	addressID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid address id"})
		return
	}

	if err := h.usecase.DeleteAddress(userID, uint(addressID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "address deleted successfully"})
}

func (h *AddressHandler) GetAddresses(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	addresses, err := h.usecase.GetAddresses(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"addresses": addresses,
		"total":     len(addresses),
	})
}

func (h *AddressHandler) GetAddress(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	addressID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid address id"})
		return
	}

	address, err := h.usecase.GetAddress(userID, uint(addressID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"address": address})
}

func (h *AddressHandler) SetDefault(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	addressID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid address id"})
		return
	}

	if err := h.usecase.SetDefault(userID, uint(addressID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "default address updated"})
}
