package repository

import (
	"errors"
	"time"

	domain    "github.com/akhilbabu26/multibrand_database_4/internal/models/user"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) domain.UserRepository {
	return &userRepository{db: db}
}

// ─────────────────────────────────────────
// USER OPERATIONS
// ─────────────────────────────────────────

func (r *userRepository) Create(user *domain.User) error {
	if err := r.db.Create(user).Error; err != nil {
		return apperrors.Internal("failed to create user", err)
	}
	return nil
}

func (r *userRepository) FindByID(id uint) (*domain.User, error) {
	var user domain.User
	if err := r.db.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.UserNotFound(err)
		}
		return nil, apperrors.Internal("failed to find user", err)
	}
	return &user, nil
}

func (r *userRepository) FindByEmail(email string) (*domain.User, error) {
	var user domain.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.UserNotFound(err)
		}
		return nil, apperrors.Internal("failed to find user", err)
	}
	return &user, nil
}

func (r *userRepository) Update(user *domain.User) error {
	if err := r.db.Save(user).Error; err != nil {
		return apperrors.Internal("failed to update user", err)
	}
	return nil
}

func (r *userRepository) ListUsers(page, limit int) ([]*domain.User, int64, error) {
	var users []*domain.User
	var total int64

	query := r.db.Model(&domain.User{})
	query.Count(&total) // get total count for frontend pagination bar

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return nil, 0, apperrors.Internal("failed to list users", err)
	}

	return users, total, nil
}

func (r *userRepository) Delete(id uint) error {
	if err := r.db.Delete(&domain.User{}, id).Error; err != nil {
		return apperrors.Internal("failed to delete user", err)
	}
	return nil
}

func (r *userRepository) BlockUser(id uint) error {
	if err := r.db.Model(&domain.User{}).
		Where("id = ?", id).
		Update("is_blocked", true).Error; err != nil {
		return apperrors.Internal("failed to block user", err)
	}
	return nil
}

func (r *userRepository) UnblockUser(id uint) error {
	if err := r.db.Model(&domain.User{}).
		Where("id = ?", id).
		Update("is_blocked", false).Error; err != nil {
		return apperrors.Internal("failed to unblock user", err)
	}
	return nil
}

// ─────────────────────────────────────────
// PENDING USER OPERATIONS
// ─────────────────────────────────────────

func (r *userRepository) SavePendingUser(p *domain.PendingUser) error {
	r.db.Where("email = ?", p.Email).Delete(&domain.PendingUser{})
	if err := r.db.Create(p).Error; err != nil {
		return apperrors.Internal("failed to save pending user", err)
	}
	return nil
}

func (r *userRepository) FindPendingByEmail(email string) (*domain.PendingUser, error) {
	var p domain.PendingUser
	if err := r.db.Where("email = ?", email).First(&p).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.NoOTPFound()
		}
		return nil, apperrors.Internal("failed to find pending user", err)
	}
	return &p, nil
}

func (r *userRepository) DeletePendingByEmail(email string) error {
	if err := r.db.Where("email = ?", email).Delete(&domain.PendingUser{}).Error; err != nil {
		return apperrors.Internal("failed to delete pending user", err)
	}
	return nil
}

func (r *userRepository) DeleteExpiredPending() error {
	if err := r.db.Where("expires_at < ?", time.Now()).
		Delete(&domain.PendingUser{}).Error; err != nil {
		return apperrors.Internal("failed to delete expired pending users", err)
	}
	return nil
}