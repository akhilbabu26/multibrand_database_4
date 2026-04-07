package routes

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	handlers "github.com/akhilbabu26/multibrand_database_4/internal/controllers/handlers"
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterWishlistRoutes(r *gin.RouterGroup, app *bootstrap.App, h *handlers.WishlistHandler) {
	wishlist := r.Group("/wishlist")
	wishlist.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	wishlist.Use(middleware.RoleMiddleware("user"))
	{
		wishlist.GET("", h.GetWishlist)
		wishlist.GET("/status/:productId", h.CheckWishlistStatus)
		wishlist.POST("/:productId", h.AddToWishlist)
		wishlist.DELETE("/:productId", h.RemoveFromWishlist)
		wishlist.POST("/:productId/move-to-cart", h.MoveToCart)
	}
}
