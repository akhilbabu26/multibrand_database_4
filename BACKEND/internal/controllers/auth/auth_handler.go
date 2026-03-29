package handler

import (
	"strings"

	authDomain "github.com/akhilbabu26/multibrand_database_4/internal/models/auth"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/validator"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	usecase authDomain.AuthUsecase
}

func NewAuthHandler(usecase authDomain.AuthUsecase) *AuthHandler {
	return &AuthHandler{usecase: usecase}
}

func (h *AuthHandler) Signup(c *gin.Context) {
	var req authDomain.SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	if err := h.usecase.Signup(req.Name, req.Email, req.Password, req.Cpassword); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "otp sent to your email", nil)
}

func (h *AuthHandler) VerifyOTP(c *gin.Context) {
	var req authDomain.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	if err := h.usecase.VerifyOTP(req.Email, req.OTP); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleCreated(c, "signup successful", nil)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req authDomain.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	accessToken, refreshToken, loginErr := h.usecase.Login(req.Email, req.Password)
	if loginErr != nil {
		apperrors.HandleError(c, loginErr)
		return
	}

	apperrors.HandleSuccess(c, "login successful", gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req authDomain.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	accessToken, err := h.usecase.RefreshToken(req.RefreshToken)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "token refreshed", gin.H{
		"access_token": accessToken,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		apperrors.HandleError(c, apperrors.UnauthorizedAccess())
		return
	}

	tokenStr := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")

	if err := h.usecase.Logout(userID.(uint), tokenStr); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "logged out successfully", nil)
}

func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req authDomain.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	h.usecase.ForgotPassword(req.Email)
	apperrors.HandleSuccess(c, "if your email exists you will receive an otp", nil)
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req authDomain.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		apperrors.HandleError(c, apperrors.ValidationFailed(validator.FormatValidationError(err)))
		return
	}

	if err := h.usecase.ResetPassword(
		req.Email,
		req.OTP,
		req.NewPassword,
		req.ConfirmPassword,
	); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "password reset successfully, please login", nil)
}
