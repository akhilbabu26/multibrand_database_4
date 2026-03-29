package handler

import (
	"strconv"

	domain    "github.com/akhilbabu26/multibrand_database_4/internal/models/user"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	usecase domain.UserUsecase
}

func NewUserHandler(usecase domain.UserUsecase) *UserHandler {
	return &UserHandler{usecase: usecase}
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
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10 // safe fallback preventing 10,000 limits
	}

	users, total, err := h.usecase.ListUsers(page, limit)
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "users fetched", gin.H{
		"users": users,
		"total": total,
		"page":  page,
		"limit": limit,
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