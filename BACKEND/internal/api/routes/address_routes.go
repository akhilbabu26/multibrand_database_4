package routes

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	handlers "github.com/akhilbabu26/multibrand_database_4/internal/controllers/handlers"
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterAddressRoutes(r *gin.RouterGroup, app *bootstrap.App, h *handlers.AddressHandler) {
	address := r.Group("/addresses")
	address.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	address.Use(middleware.RoleMiddleware("user"))
	{
		address.GET("", h.GetAddresses)
		address.POST("", h.AddAddress)
		address.GET("/:id", h.GetAddress)
		address.PATCH("/:id", h.UpdateAddress)
		address.DELETE("/:id", h.DeleteAddress)
		address.PATCH("/:id/default", h.SetDefault)
	}
}
