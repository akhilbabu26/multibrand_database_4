package handler

import (
	"strconv"
	"time"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/validator"
	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	usecase contracts.OrderUsecase
}

func NewOrderHandler(usecase contracts.OrderUsecase) *OrderHandler {
	return &OrderHandler{usecase: usecase}
}

// Helper to parse date from string (YYYY-MM-DD)
func parseDate(d string) *time.Time {
	if d == "" {
		return nil
	}
	t, err := time.Parse("2006-01-02", d)
	if err != nil {
		return nil
	}
	return &t
}

// ─────────────────────────────────────────
// User HANDLERS
// ─────────────────────────────────────────

func (h *OrderHandler) PlaceOrder(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req dto.PlaceOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	order, err := h.usecase.PlaceOrder(c.Request.Context(), userID, req)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	if req.PaymentMethod == entities.PaymentMethodRazorpay {
		apperrors.HandleCreated(c, "order placed, complete payment to confirm", gin.H{
			"order": order,
			"payment": gin.H{
				"razorpay_order_id": order.RazorpayOrderID,
				"amount":            order.TotalAmount,
				"currency":          "INR",
			},
		})
		return
	}

	apperrors.HandleCreated(c, "order placed successfully", gin.H{"order": order})
}

func (h *OrderHandler) BuyNow(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req dto.BuyNowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	order, err := h.usecase.BuyNow(c.Request.Context(), userID, req)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	if req.PaymentMethod == entities.PaymentMethodRazorpay {
		apperrors.HandleCreated(c, "order placed, complete payment to confirm", gin.H{
			"order": order,
			"payment": gin.H{
				"razorpay_order_id": order.RazorpayOrderID,
				"amount":            order.TotalAmount,
				"currency":          "INR",
			},
		})
		return
	}

	apperrors.HandleCreated(c, "order placed successfully", gin.H{"order": order})
}

func (h *OrderHandler) CancelOrder(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid order id", err))
		return
	}

	if err := h.usecase.CancelOrder(c.Request.Context(), userID, uint(orderID)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "order cancelled successfully", nil)
}

func (h *OrderHandler) GetOrder(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid order id", err))
		return
	}

	order, err := h.usecase.GetOrder(c.Request.Context(), userID, uint(orderID))
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "order fetched", order)
}

func (h *OrderHandler) GetMyOrders(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}

	filter := dto.OrderFilter{
		Status:    entities.OrderStatus(c.Query("status")),
		StartDate: parseDate(c.Query("start_date")),
		EndDate:   parseDate(c.Query("end_date")),
		OrderID:   c.Query("order_id"),
		Page:      page,
		Limit:     limit,
	}

	orders, total, err := h.usecase.GetMyOrders(c.Request.Context(), userID, filter)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "orders fetched", gin.H{
		"orders": orders,
		"total":  total,
		"page":   page,
		"limit":  limit,
	})
}

// ─────────────────────────────────────────
// ADMIN HANDLERS
// ─────────────────────────────────────────

func (h *OrderHandler) GetAllOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}

	filter := dto.OrderFilter{
		Status:    entities.OrderStatus(c.Query("status")),
		StartDate: parseDate(c.Query("start_date")),
		EndDate:   parseDate(c.Query("end_date")),
		OrderID:   c.Query("order_id"),
		Page:      page,
		Limit:     limit,
	}

	orders, total, err := h.usecase.GetAllOrders(c.Request.Context(), filter)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "orders fetched", gin.H{
		"orders": orders,
		"total":  total,
		"page":   page,
		"limit":  limit,
	})
}

func (h *OrderHandler) AdminGetOrder(c *gin.Context) {
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid order id", err))
		return
	}

	order, err := h.usecase.AdminGetOrder(c.Request.Context(), uint(orderID))
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "order fetched", order)
}

func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid order id", err))
		return
	}

	var req dto.UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	if err := h.usecase.UpdateOrderStatus(c.Request.Context(), uint(orderID), req); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "order status updated successfully", nil)
}

func (h *OrderHandler) AdminCancelOrder(c *gin.Context) {
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid order id", err))
		return
	}

	if err := h.usecase.AdminCancelOrder(c.Request.Context(), uint(orderID)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "order cancelled successfully", nil)
}
