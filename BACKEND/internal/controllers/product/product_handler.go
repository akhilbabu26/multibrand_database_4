package handler

import (
	"net/http"
	"strconv"

	domain     "github.com/akhilbabu26/multibrand_database_4/internal/models/product"
	apperrors  "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/validator"
	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	usecase domain.ProductUsecase
}

func NewProductHandler(usecase domain.ProductUsecase) *ProductHandler {
	return &ProductHandler{usecase: usecase}
}

// ─────────────────────────────────────────
// ADMIN HANDLERS
// ─────────────────────────────────────────

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	// 10 MB limit for multipart forms
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil && err != http.ErrNotMultipart {
		apperrors.HandleError(c, apperrors.BadRequest("invalid form data", err))
		return
	}

	var req domain.CreateProductRequest
	if err := c.ShouldBind(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	if err := h.usecase.CreateProduct(req); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleCreated(c, "product created successfully", nil)
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid product id", err))
		return
	}

	if err := c.Request.ParseMultipartForm(10 << 20); err != nil && err != http.ErrNotMultipart {
		apperrors.HandleError(c, apperrors.BadRequest("invalid form data", err))
		return
	}

	var req domain.UpdateProductRequest
	if err := c.ShouldBind(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	if err := h.usecase.UpdateProduct(uint(id), req); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "product updated successfully", nil)
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid product id", err))
		return
	}

	if err := h.usecase.DeleteProduct(uint(id)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "product deleted successfully", nil)
}

func (h *ProductHandler) AdminGetProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid product id", err))
		return
	}

	product, err := h.usecase.GetProduct(uint(id))
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "product fetched", product.ToAdminResponse())
}

func (h *ProductHandler) AdminListProducts(c *gin.Context) {
	page, _     := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _    := strconv.Atoi(c.DefaultQuery("limit", "10"))
	minPrice, _ := strconv.ParseFloat(c.DefaultQuery("min_price", "0"), 64)
	maxPrice, _ := strconv.ParseFloat(c.DefaultQuery("max_price", "0"), 64)

	filters := domain.ProductFilter{
		Search:   c.Query("search"),
		Type:     c.Query("type"),
		Color:    c.Query("color"),
		Size:     c.Query("size"),
		Gender:   c.Query("gender"),
		MinPrice: minPrice,
		MaxPrice: maxPrice,
		InStock:  c.Query("in_stock") == "true",
		Inactive: true,
		Page:     page,
		Limit:    limit,
	}

	products, total, err := h.usecase.ListProducts(filters)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	var response []*domain.AdminProductResponse
	for _, p := range products {
		response = append(response, p.ToAdminResponse())
	}

	apperrors.HandleSuccess(c, "products fetched", gin.H{
		"products": response,
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}

// ─────────────────────────────────────────
// CUSTOMER HANDLERS
// ─────────────────────────────────────────

func (h *ProductHandler) GetProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid product id", err))
		return
	}

	product, err := h.usecase.GetProduct(uint(id))
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "product fetched", product.ToCustomerResponse())
}

func (h *ProductHandler) ListProducts(c *gin.Context) {
	page, _     := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _    := strconv.Atoi(c.DefaultQuery("limit", "10"))
	minPrice, _ := strconv.ParseFloat(c.DefaultQuery("min_price", "0"), 64)
	maxPrice, _ := strconv.ParseFloat(c.DefaultQuery("max_price", "0"), 64)

	filters := domain.ProductFilter{
		Search:   c.Query("search"),
		Type:     c.Query("type"),
		Color:    c.Query("color"),
		Size:     c.Query("size"),
		Gender:   c.Query("gender"),
		MinPrice: minPrice,
		MaxPrice: maxPrice,
		InStock:  c.Query("in_stock") == "true",
		Inactive: false,
		Page:     page,
		Limit:    limit,
	}

	products, total, err := h.usecase.ListProducts(filters)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	var response []*domain.CustomerProductResponse
	for _, p := range products {
		response = append(response, p.ToCustomerResponse())
	}

	apperrors.HandleSuccess(c, "products fetched", gin.H{
		"products": response,
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}