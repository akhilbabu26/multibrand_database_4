package errors

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// HandleError handles all errors centrally
func HandleError(c *gin.Context, err error) {
	var appErr *AppError

	if errors.As(err, &appErr) {

		// LOG INTERNAL ERROR
		if appErr.Err != nil {
			fmt.Println("ERROR:", appErr.Err)
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
	fmt.Println("UNKNOWN ERROR:", err)

	c.JSON(http.StatusInternalServerError, gin.H{
		"success": false,
		"message": "something went wrong",
		"code":    "INTERNAL_ERROR",
	})
}

// SUCCESS RESPONSE
func HandleSuccess(c *gin.Context, message string, data any) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}

// CREATED RESPONSE
func HandleCreated(c *gin.Context, message string, data any) {
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}