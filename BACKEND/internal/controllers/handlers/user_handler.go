package handler

import (
	"strconv"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	usecase contracts.UserUsecase
}

func NewUserHandler(usecase contracts.UserUsecase) *UserHandler {
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

	user, err := h.usecase.GetUser(c.Request.Context(), userID.(uint))
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

	var isBlocked *bool
	if val := c.Query("is_blocked"); val != "" {
		b := val == "true"
		isBlocked = &b
	}

	filter := dto.UserFilter{
		Search:    c.Query("search"),
		Role:      c.Query("role"),
		IsBlocked: isBlocked,
		Page:      page,
		Limit:     limit,
	}

	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 || filter.Limit > 50 {
		filter.Limit = 10
	}

	users, total, err := h.usecase.ListUsers(c.Request.Context(), filter)
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

	user, err := h.usecase.GetUser(c.Request.Context(), uint(id))
	if err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "user fetched", user)
}

// FIX 4c: removed self-check from handler — now handled in usecase
// pass requestingID as first arg so usecase can enforce the rule
func (h *UserHandler) BlockUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid user id", err))
		return
	}

	loggedInID, _ := c.Get("userID")

	if err := h.usecase.BlockUser(c.Request.Context(), loggedInID.(uint), uint(id)); err != nil {
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

	if err := h.usecase.UnblockUser(c.Request.Context(), uint(id)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "user unblocked successfully", nil)
}

// FIX 4c: same as BlockUser — removed self-check, pass requestingID
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apperrors.HandleError(c, apperrors.BadRequest("invalid user id", err))
		return
	}

	loggedInID, _ := c.Get("userID")

	if err := h.usecase.DeleteUser(c.Request.Context(), loggedInID.(uint), uint(id)); err != nil {
		apperrors.HandleError(c, err)
		return
	}

	apperrors.HandleSuccess(c, "user deleted successfully", nil)
}
