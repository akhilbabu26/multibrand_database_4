package handler

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	"github.com/gin-gonic/gin"
)

func (h *WishlistHandler) RegisterRoutes(r *gin.RouterGroup, app *bootstrap.App) {
	wishlist := r.Group("/wishlist")
	wishlist.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	wishlist.Use(middleware.RoleMiddleware("user"))
	{
		wishlist.GET("", h.GetWishlist)
		wishlist.POST("/:productId", h.AddToWishlist)
		wishlist.DELETE("/:productId", h.RemoveFromWishlist)
		wishlist.POST("/:productId/move-to-cart", h.MoveToCart)
	}
}
