package handler

import (
	"strconv"
	"strings"

	domain    "github.com/akhilbabu26/multibrand_database_4/internal/models/user"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/validator"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	usecase domain.UserUsecase
}

func NewUserHandler(usecase domain.UserUsecase) *UserHandler {
	return &UserHandler{usecase: usecase}
}

// ─────────────────────────────────────────
// AUTH HANDLERS
// ─────────────────────────────────────────

func (h *UserHandler) Signup(c *gin.Context) {
	var req domain.SignupRequest
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

func (h *UserHandler) VerifyOTP(c *gin.Context) {
	var req domain.VerifyOTPRequest
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

func (h *UserHandler) Login(c *gin.Context) {
	var req domain.LoginRequest
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

func (h *UserHandler) RefreshToken(c *gin.Context) {
	var req domain.RefreshTokenRequest
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

func (h *UserHandler) Logout(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		apperrors.HandleError(c, apperrors.Unauthorized("unauthorized", nil))
		return
	}

	tokenStr := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")

	if err := h.usecase.Logout(userID.(uint), tokenStr); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "logged out successfully", nil)
}

// ─────────────────────────────────────────
// PASSWORD RESET
// ─────────────────────────────────────────

func (h *UserHandler) ForgotPassword(c *gin.Context) {
	var req domain.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid request payload", err))
		return
	}

	// always return same message — don't reveal if email exists
	h.usecase.ForgotPassword(req.Email)
	apperrors.HandleSuccess(c, "if your email exists you will receive an otp", nil)
}

func (h *UserHandler) ResetPassword(c *gin.Context) {
	var req domain.ResetPasswordRequest
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

// ─────────────────────────────────────────
// USER HANDLERS
// ─────────────────────────────────────────

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		apperrors.HandleError(c, apperrors.Unauthorized("unauthorized", nil))
		return
	}

	user, err := h.usecase.GetUser(userID.(uint))
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "profile fetched", user)
}

// ─────────────────────────────────────────
// ADMIN HANDLERS
// ─────────────────────────────────────────

func (h *UserHandler) ListUsers(c *gin.Context) {
	users, err := h.usecase.ListUsers()
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "users fetched", gin.H{
		"users": users,
		"total": len(users),
	})
}

func (h *UserHandler) GetUserByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid user id", err))
		return
	}

	user, err := h.usecase.GetUser(uint(id))
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "user fetched", user)
}

func (h *UserHandler) BlockUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid user id", err))
		return
	}

	loggedInID, _ := c.Get("userID")
	if uint(id) == loggedInID.(uint) {
		apperrors.HandleError(c, apperrors.CannotBlockSelf())
		return
	}

	if err := h.usecase.BlockUser(uint(id)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "user blocked successfully", nil)
}

func (h *UserHandler) UnblockUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid user id", err))
		return
	}

	if err := h.usecase.UnblockUser(uint(id)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "user unblocked successfully", nil)
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid user id", err))
		return
	}

	loggedInID, _ := c.Get("userID")
	if uint(id) == loggedInID.(uint) {
		apperrors.HandleError(c, apperrors.CannotDeleteSelf())
		return
	}

	if err := h.usecase.DeleteUser(uint(id)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "user deleted successfully", nil)
}