package middleware

import (
	"net/http"
	"strings"
	
	"github.com/akhilbabu26/multibrand_database_4/pkg/jwt"
	"github.com/akhilbabu26/multibrand_database_4/pkg/redis"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates JWT access token
func AuthMiddleware(secret string, tokenStore *redis.TokenStore) gin.HandlerFunc {
	return func(c *gin.Context){
		authHeader := c.GetHeader("Authorization")
		if authHeader == ""{
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "authorization header required",
			})
			return
		}

		// check Bearer format
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid authorization format",
			})
			return
		}

		tokenStr := parts[1]

		// 1. check blacklist first
        if tokenStore.IsBlacklisted(tokenStr) {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
                "error": "session expired, please login again",
            })
            return
        }

		// validate token
		claims, err := jwt.ValidateToken(tokenStr, secret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid or expired token",
			})
			return
		}

		// inject into context for handlers to use
		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)

		c.Next()
	}
}

// RoleMiddleware checks if user has required role
func RoleMiddleware(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context){
		role, exists := c.Get("role")
		if !exists{
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "role not found in token",
			})
			return
		}

		// check if user role matches any allowed role
		userRole := role.(string)
		for _, allowedRole := range roles{
			if userRole == allowedRole{
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error": "access denied: insufficient permissions",
		})
	}
}