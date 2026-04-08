package handler

import (
	"net/http"
	"strconv"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/validator"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type ProductHandler struct {
	usecase contracts.ProductUsecase
}

func NewProductHandler(usecase contracts.ProductUsecase) *ProductHandler {
	return &ProductHandler{
		usecase: usecase,
	}
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

	var req dto.CreateProductRequest
	if err := c.ShouldBindWith(&req, binding.FormMultipart); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload: "+err.Error(), err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	if err := h.usecase.CreateProduct(c.Request.Context(), req); err != nil {
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

	var req dto.UpdateProductRequest
	if err := c.ShouldBindWith(&req, binding.FormMultipart); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload: "+err.Error(), err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	if err := h.usecase.UpdateProduct(c.Request.Context(), uint(id), req); err != nil {
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

	if err := h.usecase.DeleteProduct(c.Request.Context(), uint(id)); err != nil {
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

	product, err := h.usecase.GetProduct(c.Request.Context(), uint(id))
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "product fetched", dto.ToAdminProductResponse(product))
}

func (h *ProductHandler) parseProductFilters(c *gin.Context, inactive bool) dto.ProductFilter {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if limit < 1 || limit > 100 {
		limit = 10
	}
	minPrice, _ := strconv.ParseFloat(c.DefaultQuery("min_price", "0"), 64)
	maxPrice, _ := strconv.ParseFloat(c.DefaultQuery("max_price", "0"), 64)

	var isActive *bool
	if val := c.Query("is_active"); val != "" {
		b := val == "true"
		isActive = &b
	}

	searchQuery := c.Query("search")
	if searchQuery == "" {
		searchQuery = c.Query("q")
	}

	return dto.ProductFilter{
		Search:   searchQuery,
		Brand:    c.Query("brand"),
		Type:     c.Query("type"),
		Color:    c.Query("color"),
		Size:     c.Query("size"),
		Gender:   c.Query("gender"),
		MinPrice: minPrice,
		MaxPrice: maxPrice,
		InStock:  c.Query("in_stock") == "true",
		Inactive: inactive,
		IsActive: isActive,
		Page:     page,
		Limit:    limit,
	}
}

func (h *ProductHandler) AdminListProducts(c *gin.Context) {
	filters := h.parseProductFilters(c, true)

	products, total, err := h.usecase.ListProducts(c.Request.Context(), filters)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	var response []*dto.AdminProductResponse
	for _, p := range products {
		response = append(response, dto.ToAdminProductResponse(p))
	}

	apperrors.HandleSuccess(c, "products fetched", gin.H{
		"products": response,
		"total":    total,
		"page":     filters.Page,
		"limit":    filters.Limit,
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

	// Extract user ID if authenticated
	var userID *uint
	if uID, exists := c.Get("userID"); exists {
		if id, ok := uID.(uint); ok {
			userID = &id
		}
	}

	response, err := h.usecase.GetProductForCustomer(c.Request.Context(), uint(id), userID)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "product fetched", response)
}

func (h *ProductHandler) GetProductVariants(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid product id", err))
		return
	}

	var userID *uint
	if uID, exists := c.Get("userID"); exists {
		if u, ok := uID.(uint); ok {
			userID = &u
		}
	}

	variants, err := h.usecase.GetProductVariantsForCustomer(c.Request.Context(), uint(id), userID)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "product variants fetched", variants)
}

func (h *ProductHandler) ListProducts(c *gin.Context) {
	filters := h.parseProductFilters(c, false)

	// Extract user ID if authenticated
	var userID *uint
	if uID, exists := c.Get("userID"); exists {
		if id, ok := uID.(uint); ok {
			userID = &id
		}
	}

	products, total, err := h.usecase.ListProductsForCustomer(c.Request.Context(), filters, userID)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "products fetched", gin.H{
		"products": products,
		"total":    total,
		"page":     filters.Page,
		"limit":    filters.Limit,
	})
}

func (h *ProductHandler) GetProductMetadata(c *gin.Context) {
	response, err := h.usecase.GetProductMetadata(c.Request.Context())
	if err != nil {
		apperrors.HandleError(c, apperrors.Internal("failed to fetch product metadata: "+err.Error(), err))
		return
	}

	apperrors.HandleSuccess(c, "product metadata fetched", response)
}
