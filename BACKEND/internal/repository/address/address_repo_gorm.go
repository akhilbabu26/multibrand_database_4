package repository

import (
	"errors"

	domain    "github.com/akhilbabu26/multibrand_database_4/internal/models/address"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"gorm.io/gorm"
)

type addressRepository struct {
	db *gorm.DB
}

func NewAddressRepository(db *gorm.DB) domain.AddressRepository {
	return &addressRepository{db: db}
}

func (r *addressRepository) Create(address *domain.Address) error {
	if err := r.db.Create(address).Error; err != nil {
		return apperrors.Internal("failed to create address", err)
	}
	return nil
}

func (r *addressRepository) FindByID(id uint) (*domain.Address, error) {
	var address domain.Address
	if err := r.db.First(&address, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.AddressNotFound(err)
		}
		return nil, apperrors.Internal("failed to find address", err)
	}
	return &address, nil
}

func (r *addressRepository) FindByUserID(userID uint) ([]*domain.Address, error) {
	var addresses []*domain.Address
	if err := r.db.Where("user_id = ?", userID).
		Order("is_default DESC, created_at DESC").
		Find(&addresses).Error; err != nil {
		return nil, apperrors.Internal("failed to find addresses", err)
	}
	return addresses, nil
}

//  N+1 Fix — batch fetch by IDs
func (r *addressRepository) FindByIDs(ids []uint) (map[uint]*domain.Address, error) {
	var addresses []*domain.Address
	if err := r.db.Where("id IN ?", ids).Find(&addresses).Error; err != nil {
		return nil, apperrors.Internal("failed to fetch addresses", err)
	}

	addressMap := make(map[uint]*domain.Address, len(addresses))
	for _, a := range addresses {
		addressMap[a.ID] = a
	}
	return addressMap, nil
}

func (r *addressRepository) Update(address *domain.Address) error {
	if err := r.db.Save(address).Error; err != nil {
		return apperrors.Internal("failed to update address", err)
	}
	return nil
}

func (r *addressRepository) Delete(id uint) error {
	if err := r.db.Delete(&domain.Address{}, id).Error; err != nil {
		return apperrors.Internal("failed to delete address", err)
	}
	return nil
}

func (r *addressRepository) ClearDefault(userID uint) error {
	if err := r.db.Model(&domain.Address{}).
		Where("user_id = ? AND is_default = ?", userID, true).
		Update("is_default", false).Error; err != nil {
		return apperrors.Internal("failed to clear default", err)
	}
	return nil
}

func (r *addressRepository) FindDefaultByUserID(userID uint) (*domain.Address, error) {
	var address domain.Address
	if err := r.db.Where("user_id = ? AND is_default = ?", userID, true).
		First(&address).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.NotFound("no default address found", err)
		}
		return nil, apperrors.Internal("failed to find default address", err)
	}
	return &address, nil
}