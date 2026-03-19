package handler

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	"github.com/akhilbabu26/multibrand_database_4/internal/delivery/middleware"
	"github.com/gin-gonic/gin"
)

func (h *AddressHandler) RegisterRoutes(r *gin.RouterGroup, app *bootstrap.App) {
	address := r.Group("/addresses")
	address.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	address.Use(middleware.RoleMiddleware("customer"))
	{
		address.GET("", h.GetAddresses)
		address.POST("", h.AddAddress)
		address.GET("/:id", h.GetAddress)
		address.PATCH("/:id", h.UpdateAddress)
		address.DELETE("/:id", h.DeleteAddress)
		address.PATCH("/:id/default", h.SetDefault)
	}
}