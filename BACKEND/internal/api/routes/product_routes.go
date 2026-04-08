package routes

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	handlers "github.com/akhilbabu26/multibrand_database_4/internal/controllers/handlers"
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterProductRoutes(r *gin.RouterGroup, app *bootstrap.App, h *handlers.ProductHandler) {

	// public routes of product
	product := r.Group("/products")
	{
		product.GET("", h.ListProducts)                    // list + search + filter
		product.GET("/:id", h.GetProduct)                  // get single product
		product.GET("/:id/variants", h.GetProductVariants) // get variants
		product.GET("/metadata", h.GetProductMetadata)     // get dynamic brands/colors
	}

	// admin only routes
	adminProducts := r.Group("/admin/products")
	adminProducts.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	adminProducts.Use(middleware.RoleMiddleware("admin"))
	{
		adminProducts.POST("", h.CreateProduct)
		adminProducts.PATCH("/:id", h.UpdateProduct)
		adminProducts.DELETE("/:id", h.DeleteProduct)
		adminProducts.GET("", h.AdminListProducts)   // admin list
		adminProducts.GET("/:id", h.AdminGetProduct) // admin single
	}
}
