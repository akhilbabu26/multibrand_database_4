package handler

import (
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	"github.com/gin-gonic/gin"
)

func (h *UserHandler) RegisterRoutes(r *gin.RouterGroup, app *bootstrap.App){
	
	// user protected routes
	user := r.Group("/user")
	user.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	{
		user.GET("/profile", h.GetProfile)
	}

	// admin protected routes
	admin := r.Group("/admin")
	admin.Use(middleware.AuthMiddleware(app.Config.JWT.Secret, app.TokenStore))
	admin.Use(middleware.RoleMiddleware("admin"))
	{	
		admin.GET("/profile", h.GetProfile)

		// user management
		admin.GET("/users", h.ListUsers)
		admin.GET("/users/:id", h.GetUserByID)
		admin.PATCH("/users/:id/block", h.BlockUser)
		admin.PATCH("/users/:id/unblock", h.UnblockUser)
		admin.DELETE("/users/:id", h.DeleteUser)
	}
}
