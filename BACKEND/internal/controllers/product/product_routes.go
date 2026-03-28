package handler

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"

	"github.com/gin-gonic/gin"
)

func (h *ProductHandler) RegisterRoutes(r *gin.RouterGroup, app *bootstrap.App){

	// public routes of product
	product := r.Group("/products")
	{
		product.GET("", h.ListProducts) // list + search + filter
		product.GET("/:id", h.GetProduct) // get single product
	}

	// admin only routes
	adminProducts := r.Group("/admin/products")
	adminProducts.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	adminProducts.Use(middleware.RoleMiddleware("admin"))
	{
		adminProducts.POST("", h.CreateProduct)
		adminProducts.PATCH("/:id", h.UpdateProduct)
		adminProducts.DELETE("/:id", h.DeleteProduct)
		adminProducts.GET("", h.AdminListProducts)    // admin list
		adminProducts.GET("/:id", h.AdminGetProduct)  // admin single
	}
}
