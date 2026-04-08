package contracts

import (
	"context"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	"github.com/akhilbabu26/multibrand_database_4/internal/repository/generic"
	"gorm.io/gorm"
)

type UserRepository interface {
	generic.Repository[entities.User]
	WithTx(tx *gorm.DB) UserRepository

	FindByEmail(email string) (*entities.User, error)
	ListUsers(filter dto.UserFilter) ([]*entities.User, int64, error)
	BlockUser(id uint) error
	UnblockUser(id uint) error

	SavePendingUser(p *entities.PendingUser) error
	FindPendingByEmail(email string) (*entities.PendingUser, error)
	DeletePendingByEmail(email string) error
	DeleteExpiredPending() error
}

// FIX 4b: BlockUser and DeleteUser now receive requestingID so the
// self-check lives in the usecase layer, not just the handler
type UserUsecase interface {
	GetUser(ctx context.Context, id uint) (*entities.User, error)
	ListUsers(ctx context.Context, filter dto.UserFilter) ([]*entities.User, int64, error)
	BlockUser(ctx context.Context, requestingID uint, targetID uint) error
	UnblockUser(ctx context.Context, id uint) error
	DeleteUser(ctx context.Context, requestingID uint, targetID uint) error
}
