package handler

import (
	"net/http"
	"strconv"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/domain/product"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct{
	usecase domain.ProductUsecase
}

func NewProductHandler(usecase domain.ProductUsecase) *ProductHandler {
	return &ProductHandler{usecase: usecase}
}

// -----Admin Handlers----

// create product
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req domain.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.usecase.CreateProduct(req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "product created successfully"})
}

// update product
func (h *ProductHandler) UpdateProduct(c *gin.Context){
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	var req domain.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.usecase.UpdateProduct(uint(id), req); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "product updated successfully"})
}

// delete product
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	if err := h.usecase.DeleteProduct(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "product deleted successfully"})
}

// admin — full product details
func (h *ProductHandler) AdminGetProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	product, err := h.usecase.GetProduct(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"product": product.ToAdminResponse()})
}

func (h *ProductHandler) AdminListProducts(c *gin.Context) {
	page, _     := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _    := strconv.Atoi(c.DefaultQuery("limit", "10"))
	minPrice, _ := strconv.ParseFloat(c.DefaultQuery("min_price", "0"), 64)
	maxPrice, _ := strconv.ParseFloat(c.DefaultQuery("max_price", "0"), 64)

	filters := domain.ProductFilter{
		Search: c.Query("search"),
		Type: c.Query("type"),
		Color: c.Query("color"),
		MinPrice: minPrice,
		MaxPrice: maxPrice,
		InStock: c.Query("in_stock") == "true",
		Inactive: true, // admin sees all including inactive
		Page: page,
		Limit: limit,
	}

	products, total, err := h.usecase.ListProducts(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response []*domain.AdminProductResponse
	for _, p := range products {
		response = append(response, p.ToAdminResponse())
	}

	c.JSON(http.StatusOK, gin.H{
		"products": response,
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}

// -----customer-----

// customer — limited fields only
func (h *ProductHandler) GetProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	product, err := h.usecase.GetProduct(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"product": product.ToCustomerResponse()})
}

func (h *ProductHandler) ListProducts(c *gin.Context) {
	page, _     := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _    := strconv.Atoi(c.DefaultQuery("limit", "10"))
	minPrice, _ := strconv.ParseFloat(c.DefaultQuery("min_price", "0"), 64)
	maxPrice, _ := strconv.ParseFloat(c.DefaultQuery("max_price", "0"), 64)

	filters := domain.ProductFilter{
		Search: c.Query("search"),
		Type: c.Query("type"),
		Color:    c.Query("color"),
		MinPrice: minPrice,
		MaxPrice: maxPrice,
		InStock: c.Query("in_stock") == "true",
		Inactive: false, // customers only see active products
		Page: page,
		Limit: limit,
	}

	products, total, err := h.usecase.ListProducts(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response []*domain.CustomerProductResponse
	for _, p := range products {
		response = append(response, p.ToCustomerResponse())
	}

	c.JSON(http.StatusOK, gin.H{
		"products": response,
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}