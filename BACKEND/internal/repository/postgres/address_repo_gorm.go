package postgres

import (
	"errors"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"

	"github.com/akhilbabu26/multibrand_database_4/internal/repository/generic"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"gorm.io/gorm"
)

type addressRepository struct {
	generic.Repository[entities.Address]
}

func NewAddressRepository(db *gorm.DB) contracts.AddressRepository {
	return &addressRepository{
		Repository: generic.NewGenericRepository[entities.Address](db),
	}
}

func (r *addressRepository) WithTx(tx *gorm.DB) contracts.AddressRepository {
	return &addressRepository{
		Repository: generic.NewGenericRepository[entities.Address](tx),
	}
}

func (r *addressRepository) FindByUserID(userID uint) ([]*entities.Address, error) {
	var addresses []*entities.Address
	if err := r.DB().Where("user_id = ?", userID).
		Order("is_default DESC, created_at DESC").
		Find(&addresses).Error; err != nil {
		return nil, apperrors.Internal("failed to find addresses", err)
	}
	return addresses, nil
}

// N+1 Fix — batch fetch by IDs
func (r *addressRepository) FindByIDs(ids []uint) (map[uint]*entities.Address, error) {
	var addresses []*entities.Address
	if err := r.DB().Where("id IN ?", ids).Find(&addresses).Error; err != nil {
		return nil, apperrors.Internal("failed to fetch addresses", err)
	}

	addressMap := make(map[uint]*entities.Address, len(addresses))
	for _, a := range addresses {
		addressMap[a.ID] = a
	}
	return addressMap, nil
}

func (r *addressRepository) ClearDefault(userID uint) error {
	if err := r.DB().Model(&entities.Address{}).
		Where("user_id = ? AND is_default = ?", userID, true).
		Update("is_default", false).Error; err != nil {
		return apperrors.Internal("failed to clear default", err)
	}
	return nil
}

func (r *addressRepository) FindDefaultByUserID(userID uint) (*entities.Address, error) {
	var address entities.Address
	if err := r.DB().Where("user_id = ? AND is_default = ?", userID, true).
		First(&address).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.NotFound("no default address found", err)
		}
		return nil, apperrors.Internal("failed to find default address", err)
	}
	return &address, nil
}
