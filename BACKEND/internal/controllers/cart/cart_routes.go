package handler

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	
	"github.com/gin-gonic/gin"
)

func (h *CartHandler) RegisterRoutes(r *gin.RouterGroup, app *bootstrap.App) {
	cart := r.Group("/cart")
	cart.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	cart.Use(middleware.RoleMiddleware("customer"))
	{
		cart.GET("", h.GetCart)
		cart.POST("/:productId", h.AddToCart)
		cart.PATCH("/:productId", h.UpdateQuantity)
		cart.DELETE("/:productId", h.RemoveFromCart)
		cart.DELETE("", h.ClearCart)
	}
}
