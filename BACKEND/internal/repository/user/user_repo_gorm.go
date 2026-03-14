package repository

import (
	"errors"
	"fmt"
	"time"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/domain/user"

	"gorm.io/gorm"
)

type userRepository struct{
	db *gorm.DB
}

// NewUserRepository creates a new userRepository instance
func NewUserRepository(db *gorm.DB) domain.UserRepository {
	return &userRepository{db: db}
}

// -----User Operations---

// create user
func (r *userRepository) Create(user *domain.User) error {
	if err := r.db.Create(user).Error; err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

// find user by id
func (r *userRepository) FindByID(id uint) (*domain.User, error) {
	var user domain.User
	if err := r.db.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}
	return &user, nil
}

// find user by email
func (r *userRepository) FindByEmail(email string) (*domain.User, error) {
	var user domain.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}
	return &user, nil
}

// update user
func (r *userRepository) Update(user *domain.User) error {
	if err := r.db.Save(user).Error; err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	return nil
}

// get all users
func (r *userRepository) ListUsers() ([]*domain.User, error) {
	var users []*domain.User
	if err := r.db.Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}
	return users, nil
}

// delete a user
func (r *userRepository) Delete(id uint) error {
	if err := r.db.Delete(&domain.User{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	return nil
}

// Block or Unblock user
func (r *userRepository) BlockUser(id uint) error {
	if err := r.db.Model(&domain.User{}).
		Where("id = ?", id).
		Update("is_blocked", true).Error; err != nil {
		return fmt.Errorf("failed to block user: %w", err)
	}
	return nil
}
// unblock
func (r *userRepository) UnblockUser(id uint) error {
	if err := r.db.Model(&domain.User{}).
		Where("id = ?", id).
		Update("is_blocked", false).Error; err != nil {
		return fmt.Errorf("failed to unblock user: %w", err)
	}
	return nil
}

// -----Pending User Operations-----

func (r *userRepository) SavePendingUser(p *domain.PendingUser) error {
    // delete any existing pending registration for this email first
    r.db.Where("email = ?", p.Email).Delete(&domain.PendingUser{})

    if err := r.db.Create(p).Error; err != nil {
        return fmt.Errorf("failed to save pending user: %w", err)
    }
    return nil
}

func (r *userRepository) FindPendingByEmail(email string) (*domain.PendingUser, error) {
    var p domain.PendingUser
    if err := r.db.Where("email = ?", email).First(&p).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, fmt.Errorf("pending registration not found")
        }
        return nil, fmt.Errorf("failed to find pending user: %w", err)
    }
    return &p, nil
}

func (r *userRepository) DeletePendingByEmail(email string) error {
    if err := r.db.Where("email = ?", email).Delete(&domain.PendingUser{}).Error; err != nil {
        return fmt.Errorf("failed to delete pending user: %w", err)
    }
    return nil
}

// DeleteExpiredPending removes all expired pending registrations
func (r *userRepository) DeleteExpiredPending() error {
    if err := r.db.Where("expires_at < ?", time.Now()).Delete(&domain.PendingUser{}).Error; err != nil {
        return fmt.Errorf("failed to delete expired pending users: %w", err)
    }
    return nil
}