package routes

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	handlers "github.com/akhilbabu26/multibrand_database_4/internal/controllers/handlers"
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterPaymentRoutes(router *gin.RouterGroup, app *bootstrap.App, h *handlers.PaymentHandler) {
	paymentRoutes := router.Group("/payment")
	paymentRoutes.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))

	{
		paymentRoutes.POST("/create", h.CreatePayment)
		paymentRoutes.POST("/verify", h.VerifyPayment)
	}
}
