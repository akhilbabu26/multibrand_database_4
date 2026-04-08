package postgres

import (
	"errors"
	"time"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	"github.com/akhilbabu26/multibrand_database_4/internal/repository/generic"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"gorm.io/gorm"
)

type userRepository struct {
	generic.Repository[entities.User]
}

func NewUserRepository(db *gorm.DB) contracts.UserRepository {
	return &userRepository{
		Repository: generic.NewGenericRepository[entities.User](db),
	}
}

func (r *userRepository) WithTx(tx *gorm.DB) contracts.UserRepository {
	return &userRepository{
		Repository: generic.NewGenericRepository[entities.User](tx),
	}
}

// ─────────────────────────────────────────
// USER OPERATIONS
// ─────────────────────────────────────────

func (r *userRepository) FindByEmail(email string) (*entities.User, error) {
	var user entities.User
	if err := r.DB().Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.UserNotFound(err)
		}
		return nil, apperrors.Internal("failed to find user", err)
	}
	return &user, nil
}

// FIX 3: separate count query from paged query so future filters
// don't corrupt the total count used by the pagination bar
func (r *userRepository) ListUsers(filter dto.UserFilter) ([]*entities.User, int64, error) {
	var users []*entities.User
	var total int64

	query := r.DB().Model(&entities.User{})

	if filter.Search != "" {
		like := "%" + filter.Search + "%"
		query = query.Where("name ILIKE ? OR email ILIKE ?", like, like)
	}
	if filter.Role != "" {
		query = query.Where("role = ?", filter.Role)
	}
	if filter.IsBlocked != nil {
		query = query.Where("is_blocked = ?", *filter.IsBlocked)
	}

	// count on a fresh query — never shares state with the paged query
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, apperrors.Internal("failed to count users", err)
	}

	offset := (filter.Page - 1) * filter.Limit
	if err := query.Offset(offset).Limit(filter.Limit).Find(&users).Error; err != nil {
		return nil, 0, apperrors.Internal("failed to list users", err)
	}

	return users, total, nil
}

func (r *userRepository) BlockUser(id uint) error {
	if err := r.DB().Model(&entities.User{}).
		Where("id = ?", id).
		Update("is_blocked", true).Error; err != nil {
		return apperrors.Internal("failed to block user", err)
	}
	return nil
}

func (r *userRepository) UnblockUser(id uint) error {
	if err := r.DB().Model(&entities.User{}).
		Where("id = ?", id).
		Update("is_blocked", false).Error; err != nil {
		return apperrors.Internal("failed to unblock user", err)
	}
	return nil
}

// ─────────────────────────────────────────
// PENDING USER OPERATIONS
// ─────────────────────────────────────────

func (r *userRepository) SavePendingUser(p *entities.PendingUser) error {
	r.DB().Where("email = ?", p.Email).Delete(&entities.PendingUser{})
	if err := r.DB().Create(p).Error; err != nil {
		return apperrors.Internal("failed to save pending user", err)
	}
	return nil
}

func (r *userRepository) FindPendingByEmail(email string) (*entities.PendingUser, error) {
	var p entities.PendingUser
	if err := r.DB().Where("email = ?", email).First(&p).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.NoOTPFound()
		}
		return nil, apperrors.Internal("failed to find pending user", err)
	}
	return &p, nil
}

func (r *userRepository) DeletePendingByEmail(email string) error {
	if err := r.DB().Where("email = ?", email).Delete(&entities.PendingUser{}).Error; err != nil {
		return apperrors.Internal("failed to delete pending user", err)
	}
	return nil
}

func (r *userRepository) DeleteExpiredPending() error {
	if err := r.DB().Where("expires_at < ?", time.Now()).
		Delete(&entities.PendingUser{}).Error; err != nil {
		return apperrors.Internal("failed to delete expired pending users", err)
	}
	return nil
}