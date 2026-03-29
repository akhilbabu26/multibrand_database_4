package handler

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	"github.com/gin-gonic/gin"
)

func (h *AuthHandler) RegisterRoutes(r *gin.RouterGroup, app *bootstrap.App) {
	auth := r.Group("/auth")
	
	// Apply strict brute-force protection (5 requests per minute)
	bruteForceBlocker := middleware.RateLimiter(app.Redis, "5-M") // 5 req / minute
	auth.Use(bruteForceBlocker)

	{
		// public routes
		auth.POST("/signup", h.Signup)
		auth.POST("/verify-otp", h.VerifyOTP)
		auth.POST("/login", h.Login)
		auth.POST("/refresh", h.RefreshToken)

		// password reset routes
		auth.POST("/forgot-password", h.ForgotPassword)
		auth.POST("/reset-password", h.ResetPassword)
	}

    // Logout requires AuthMiddleware
	protected := r.Group("/auth")
	protected.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	{
		protected.POST("/logout", h.Logout)
	}
}
