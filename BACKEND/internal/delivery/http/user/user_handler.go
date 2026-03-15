package handler

import (
	"net/http"
	"strconv"
	"strings"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/domain/user"

	"github.com/gin-gonic/gin"
)

type UserHandler struct{
	usecase domain.UserUsecase
}

func NewUserHandler(usecase domain.UserUsecase) *UserHandler {
	return &UserHandler{usecase: usecase}
}

// Request Struct

type signupRequest struct{
	Name     string `json:"name" binding:"required,min=2"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Cpassword string `json:"cPassword" binding:"required,min=6"`
}

type verifyOTPRequest  struct{
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp" binding:"required,len=6"`
}

type loginRequest struct{
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type refreshTokenRequest struct{
	RefreshToken string `json:"refresh_token" binding:"required"` 
}

type forgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type verifyResetOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp" binding:"required,len=6"`
}

type resetPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
	OTP string `json:"otp" binding:"required,len=6"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
	ConfirmPassword string `json:"confirm_password" binding:"required,min=6"`
}

// AUTH HANDLERS

// signup
func (h *UserHandler) Signup(c *gin.Context){

	var req signupRequest

	if err := c.ShouldBindJSON(&req); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.usecase.Signup(req.Name, req.Email, req.Password, req.Cpassword); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "otp sent to your email"})
}

// verify otp
func (h *UserHandler) VerifyOTP(c *gin.Context){
	var req verifyOTPRequest 
	if err := c.ShouldBindJSON(&req); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.usecase.VerifyOTP(req.Email, req.OTP); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "account verified successfully"})
}

// Login
func (h *UserHandler) Login(c *gin.Context){
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accessToken, refreshToken, err := h.usecase.Login(req.Email, req.Password)
	if err != nil{
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

// referesh token
func (h *UserHandler) RefreshToken(c *gin.Context){
	var req refreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accessToken, err := h.usecase.RefreshToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"access_token": accessToken})
}

// Logout
func (h *UserHandler) Logout(c *gin.Context) {
	// userID set by AuthMiddleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// get the actual token string
    tokenStr := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")

	if err := h.usecase.Logout(userID.(uint), tokenStr); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "logged out successfully"})
}

// get user by id for user
func (h *UserHandler) GetProfile(c *gin.Context) {
	// get userID from context (set by AuthMiddleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	user, err := h.usecase.GetUser(userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// --- forgot password---

func (h *UserHandler) ForgotPassword(c *gin.Context) {
	var req forgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// always return same message — don't reveal if email exists
	h.usecase.ForgotPassword(req.Email)
	c.JSON(http.StatusOK, gin.H{"message": "if your email exists you will receive an otp"})
}

func (h *UserHandler) ResetPassword(c *gin.Context) {
	var req resetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.usecase.ResetPassword(req.Email, req.OTP, req.NewPassword, req.ConfirmPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "password reset successfully, please login"})
}


//--- adnim user management------

// get user by id for admin
func (h *UserHandler) GetUserByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	user, err := h.usecase.GetUser(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// get all users
func (h *UserHandler) ListUsers(c *gin.Context){
	users, err := h.usecase.ListUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"total": len(users),
	})
}

// block user
func (h *UserHandler) BlockUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	loggedInID, _ := c.Get("userID")

	// prevent self block
	if uint(id) == loggedInID.(uint) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "you cannot block yourself"})
		return
	}

	if err := h.usecase.BlockUser(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user blocked successfully"})
}

// unblock user
func (h *UserHandler) UnblockUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	if err := h.usecase.UnblockUser(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user unblocked successfully"})
}

// delete user
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	loggedInID, _ := c.Get("userID")

	// prevent self delete
	if uint(id) == loggedInID.(uint) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "you cannot delete yourself"})
		return
	}

	if err := h.usecase.DeleteUser(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user deleted successfully"})
}