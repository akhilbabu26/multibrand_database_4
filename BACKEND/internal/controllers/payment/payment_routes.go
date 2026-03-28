package handler

import(
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"

	"github.com/gin-gonic/gin"
)

func (h *PaymentHandler) RegisterRoutes(router *gin.RouterGroup, app *bootstrap.App) {
	paymentRoutes := router.Group("/payment")
	paymentRoutes.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	
	{
		paymentRoutes.POST("/create", h.CreatePayment)
		paymentRoutes.POST("/verify", h.VerifyPayment)
	}
}