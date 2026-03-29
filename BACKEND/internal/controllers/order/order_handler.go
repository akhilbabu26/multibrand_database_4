package handler

import (
	"strconv"

	orderDomain "github.com/akhilbabu26/multibrand_database_4/internal/models/order"
	apperrors   "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/validator"
	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	usecase orderDomain.OrderUsecase
}

func NewOrderHandler(usecase orderDomain.OrderUsecase) *OrderHandler {
	return &OrderHandler{usecase: usecase}
}

// ─────────────────────────────────────────
// User HANDLERS
// ─────────────────────────────────────────

func (h *OrderHandler) PlaceOrder(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req orderDomain.PlaceOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	order, err := h.usecase.PlaceOrder(userID, req)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	if req.PaymentMethod == orderDomain.PaymentMethodRazorpay {
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

	var req orderDomain.BuyNowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	order, err := h.usecase.BuyNow(userID, req)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	if req.PaymentMethod == orderDomain.PaymentMethodRazorpay {
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

	if err := h.usecase.CancelOrder(userID, uint(orderID)); err != nil {
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

	order, err := h.usecase.GetOrder(userID, uint(orderID))
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

	orders, total, err := h.usecase.GetMyOrders(userID, page, limit)
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

	orders, total, err := h.usecase.GetAllOrders(page, limit)
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

	order, err := h.usecase.AdminGetOrder(uint(orderID))
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

	var req orderDomain.UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	if err := h.usecase.UpdateOrderStatus(uint(orderID), req); err != nil {
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

	if err := h.usecase.AdminCancelOrder(uint(orderID)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "order cancelled successfully", nil)
}
