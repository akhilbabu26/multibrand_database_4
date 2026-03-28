package handler

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	
	"github.com/gin-gonic/gin"
)

func (h *OrderHandler) RegisterRoutes(r *gin.RouterGroup, app *bootstrap.App) {

	// customer routes
	orders := r.Group("/orders")
	orders.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	orders.Use(middleware.RoleMiddleware("customer"))
	{
		orders.POST("", h.PlaceOrder)
		orders.POST("/buy-now", h.BuyNow)  
		orders.GET("", h.GetMyOrders)
		orders.GET("/:id", h.GetOrder)
		orders.PATCH("/:id/cancel", h.CancelOrder)
	}

	// admin routes
	adminOrders := r.Group("/admin/orders")
	adminOrders.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	adminOrders.Use(middleware.RoleMiddleware("admin"))
	{
		adminOrders.GET("", h.GetAllOrders)
		adminOrders.GET("/:id", h.AdminGetOrder)
		adminOrders.PATCH("/:id/status", h.UpdateOrderStatus)
		adminOrders.PATCH("/:id/cancel", h.AdminCancelOrder)
	}
}
