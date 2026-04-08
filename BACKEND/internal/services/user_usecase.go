package usecase

import (
	"context"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
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
		return nil, err
	}
	return user, nil
}

// ─────────────────────────────────────────
// ADMIN USER MANAGEMENT
// ─────────────────────────────────────────

func (u *userUsecase) ListUsers(ctx context.Context, filter dto.UserFilter) ([]*entities.User, int64, error) {
	users, total, err := u.repo.ListUsers(filter)
	if err != nil {
		return nil, 0, err
	}
	return users, total, nil
}

// FIX 4a: self-check moved from handler into usecase so it's enforced
// regardless of how BlockUser is called (handler, test, background job)
func (u *userUsecase) BlockUser(ctx context.Context, requestingID uint, targetID uint) error {
	// 1. prevent blocking yourself
	if requestingID == targetID {
		return apperrors.CannotBlockSelf()
	}

	// 2. check target user exists
	user, err := u.repo.FindByID(ctx, targetID)
	if err != nil {
		return err
	}

	// 3. check already blocked
	if user.IsBlocked {
		return apperrors.UserAlreadyBlocked()
	}

	// 4. prevent blocking admin
	if user.Role == entities.RoleAdmin {
		return apperrors.CannotBlockAdmin()
	}

	// 5. block in db
	if err := u.repo.BlockUser(targetID); err != nil {
		return err
	}

	return nil
}

func (u *userUsecase) UnblockUser(ctx context.Context, id uint) error {
	// 1. check user exists
	user, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	// 2. check actually blocked
	if !user.IsBlocked {
		return apperrors.UserNotBlocked()
	}

	// 3. unblock in db
	if err := u.repo.UnblockUser(id); err != nil {
		return err
	}

	return nil
}

// FIX 4a: same pattern as BlockUser — self-check moved into usecase
func (u *userUsecase) DeleteUser(ctx context.Context, requestingID uint, targetID uint) error {
	// 1. prevent deleting yourself
	if requestingID == targetID {
		return apperrors.CannotDeleteSelf()
	}

	// 2. check target user exists
	user, err := u.repo.FindByID(ctx, targetID)
	if err != nil {
		return err
	}

	// 3. prevent deleting admin
	if user.Role == entities.RoleAdmin {
		return apperrors.CannotDeleteAdmin()
	}

	// 4. delete from db
	if err := u.repo.Delete(ctx, targetID); err != nil {
		return err
	}

	return nil
}