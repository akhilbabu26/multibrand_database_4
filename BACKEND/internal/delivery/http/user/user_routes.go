package handler

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/delivery/middleware"
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	"github.com/gin-gonic/gin"
)

func (h *UserHandler) RegisterRoutes(r *gin.RouterGroup, app *bootstrap.App){
	
	auth := r.Group("/auth")

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

	// customer protected routes
	user := r.Group("/user")
	user.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	{
		user.GET("/profile", h.GetProfile)
		user.POST("/logout", h.Logout)
	}

	// admin protected routes
	admin := r.Group("/admin")
	admin.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	admin.Use(middleware.RoleMiddleware("admin"))
	{	
		admin.GET("/profile", h.GetProfile)

		// user management
		admin.GET("/users",             h.ListUsers)
		admin.GET("/users/:id",         h.GetUserByID)
		admin.PUT("/users/:id/block",   h.BlockUser)
		admin.PUT("/users/:id/unblock", h.UnblockUser)
		admin.DELETE("/users/:id",      h.DeleteUser)
	}
}