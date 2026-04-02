package contracts

import (
	"context"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	"github.com/akhilbabu26/multibrand_database_4/internal/repository/generic"
	"gorm.io/gorm"
)

type AddressRepository interface {
	generic.Repository[entities.Address]
	WithTx(tx *gorm.DB) AddressRepository

	FindByUserID(userID uint) ([]*entities.Address, error)
	FindByIDs(ids []uint) (map[uint]*entities.Address, error)
	ClearDefault(userID uint) error
	FindDefaultByUserID(userID uint) (*entities.Address, error)
}

type AddressUsecase interface {
	AddAddress(ctx context.Context, userID uint, req dto.CreateAddressRequest) error
	UpdateAddress(ctx context.Context, userID, addressID uint, req dto.UpdateAddressRequest) error
	DeleteAddress(ctx context.Context, userID, addressID uint) error
	GetAddresses(ctx context.Context, userID uint) ([]*entities.Address, error)
	GetAddress(ctx context.Context, userID, addressID uint) (*entities.Address, error)
	SetDefault(ctx context.Context, userID, addressID uint) error
}
