package errors

import (
	"errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/constant"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// HandleError handles all errors centrally
func HandleError(c *gin.Context, err error) {
	var appErr *AppError

	if errors.As(err, &appErr) {

		// LOG INTERNAL ERROR using structured logging
		if appErr.Err != nil {
			zap.L().Error("app error", zap.Error(appErr.Err), zap.String("code", appErr.ErrorCode))
		}

		c.JSON(appErr.Code, gin.H{
			"success": false,
			"message": appErr.Message,
			"code":    appErr.ErrorCode,
			"details": appErr.Details,
		})
		return
	}

	// UNKNOWN ERROR
	zap.L().Error("unknown error", zap.Error(err))

	c.JSON(constants.INTERNALSERVERERROR, gin.H{
		"success": false,
		"message": "something went wrong",
		"code":    "INTERNAL_ERROR",
	})
}

// SUCCESS RESPONSE
func HandleSuccess(c *gin.Context, message string, data any) {
	c.JSON(constants.SUCCESS, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}

// CREATED RESPONSE
func HandleCreated(c *gin.Context, message string, data any) {
	c.JSON(constants.CREATED, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}
