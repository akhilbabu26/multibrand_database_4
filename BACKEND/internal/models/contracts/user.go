package contracts

import (
	"context"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	"github.com/akhilbabu26/multibrand_database_4/internal/repository/generic"
	"gorm.io/gorm"
)

type UserRepository interface {
	generic.Repository[entities.User]
	WithTx(tx *gorm.DB) UserRepository

	FindByEmail(email string) (*entities.User, error)
	ListUsers(page, limit int) ([]*entities.User, int64, error)
	BlockUser(id uint) error
	UnblockUser(id uint) error

	SavePendingUser(p *entities.PendingUser) error
	FindPendingByEmail(email string) (*entities.PendingUser, error)
	DeletePendingByEmail(email string) error
	DeleteExpiredPending() error
}

type UserUsecase interface {
	GetUser(ctx context.Context, id uint) (*entities.User, error)
	ListUsers(ctx context.Context, page, limit int) ([]*entities.User, int64, error)
	BlockUser(ctx context.Context, id uint) error
	UnblockUser(ctx context.Context, id uint) error
	DeleteUser(ctx context.Context, id uint) error
}
