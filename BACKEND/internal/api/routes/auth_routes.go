package routes

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	handlers "github.com/akhilbabu26/multibrand_database_4/internal/controllers/handlers"
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(r *gin.RouterGroup, app *bootstrap.App, h *handlers.AuthHandler) {
	
	// Apply brute-force protection (15 requests per minute)
	auth := r.Group("/auth")
	bruteForceBlocker := middleware.RateLimiter(app.Redis, "100-M")
	auth.Use(bruteForceBlocker)

	// PUBLIC ROUTES - No authentication required
	auth.POST("/signup", h.Signup)
	auth.POST("/verify-otp", h.VerifyOTP)
	auth.POST("/login", h.Login)
	auth.POST("/refresh", h.RefreshToken)
	auth.POST("/forgot-password", h.ForgotPassword)
	auth.POST("/reset-password", h.ResetPassword)

	// PROTECTED ROUTES - Requires valid JWT token
	protected := auth.Group("")
	protected.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	{
		protected.POST("/logout", h.Logout)
	}
}
