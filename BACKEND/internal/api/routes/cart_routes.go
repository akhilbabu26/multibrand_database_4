package routes

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	handlers "github.com/akhilbabu26/multibrand_database_4/internal/controllers/handlers"
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterCartRoutes(r *gin.RouterGroup, app *bootstrap.App, h *handlers.CartHandler) {
	cart := r.Group("/cart")
	cart.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	cart.Use(middleware.RoleMiddleware("user"))
	{
		cart.GET("", h.GetCart)
		cart.POST("/:productId", h.AddToCart)
		cart.PATCH("/:productId", h.UpdateQuantity)
		cart.DELETE("/:productId", h.RemoveFromCart)
		cart.DELETE("", h.ClearCart)
	}
}
