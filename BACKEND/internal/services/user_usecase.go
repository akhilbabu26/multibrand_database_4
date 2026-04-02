package usecase

import (
	"context"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
)

type userUsecase struct {
	repo contracts.UserRepository
}

func NewUserUsecase(repo contracts.UserRepository) contracts.UserUsecase {
	return &userUsecase{repo: repo}
}

// ─────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────

func (u *userUsecase) GetUser(ctx context.Context, userID uint) (*entities.User, error) {
	user, err := u.repo.FindByID(ctx, userID)
	if err != nil {
		return nil, err // already AppError from repo
	}
	return user, nil
}

// ─────────────────────────────────────────
// ADMIN USER MANAGEMENT
// ─────────────────────────────────────────

func (u *userUsecase) ListUsers(ctx context.Context, page, limit int) ([]*entities.User, int64, error) {
	users, total, err := u.repo.ListUsers(page, limit)
	if err != nil {
		return nil, 0, err // already AppError from repo
	}
	return users, total, nil
}

func (u *userUsecase) BlockUser(ctx context.Context, userID uint) error {
	// 1. check user exists
	user, err := u.repo.FindByID(ctx, userID)
	if err != nil {
		return err // already AppError from repo
	}

	// 2. check already blocked
	if user.IsBlocked {
		return apperrors.UserAlreadyBlocked()
	}

	// 3. prevent blocking admin
	if user.Role == entities.RoleAdmin {
		return apperrors.CannotBlockAdmin()
	}

	// 4. block in db
	if err := u.repo.BlockUser(userID); err != nil {
		return err // already AppError from repo
	}

	return nil
}

func (u *userUsecase) UnblockUser(ctx context.Context, id uint) error {
	// 1. check user exists
	user, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return err // already AppError from repo
	}

	// 2. check actually blocked
	if !user.IsBlocked {
		return apperrors.UserNotBlocked()
	}

	// 3. unblock in db
	if err := u.repo.UnblockUser(id); err != nil {
		return err // already AppError from repo
	}

	return nil
}

func (u *userUsecase) DeleteUser(ctx context.Context, id uint) error {
	// 1. check user exists
	user, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return err // already AppError from repo
	}

	// 2. prevent deleting admin
	if user.Role == entities.RoleAdmin {
		return apperrors.CannotDeleteAdmin()
	}

	// 4. delete from db
	if err := u.repo.Delete(ctx, id); err != nil {
		return err // already AppError from repo
	}

	return nil
}
