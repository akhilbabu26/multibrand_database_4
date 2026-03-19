package repository

import (
	"errors"
	"fmt"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/domain/address"
	
	"gorm.io/gorm"
)

type addressRepository struct{
	db *gorm.DB
}

func NewAddressRepository(db *gorm.DB) domain.AddressRepository{
	return &addressRepository{db: db}
}

func (r *addressRepository) Create(address *domain.Address) error{
	if err := r.db.Create(address).Error; err != nil{
		return fmt.Errorf("faild to create address: %w", err)
	}

	return nil
}

func (r *addressRepository) FindByID(id uint) (*domain.Address, error){
	var address domain.Address

	if err := r.db.First(&address, id).Error; err != nil{
		if errors.Is(err, gorm.ErrRecordNotFound){
			return nil, fmt.Errorf("address not found")
		}
		return nil, fmt.Errorf("failed to find address: %w", err)
	}


	return &address, nil
}

func (r *addressRepository) FindByUserID(userID uint) ([]*domain.Address, error) {
	var addresses []*domain.Address
	if err := r.db.Where("user_id = ?", userID).
		Order("is_default DESC, created_at DESC").
		Find(&addresses).Error; err != nil {
		return nil, fmt.Errorf("failed to find addresses: %w", err)
	}
	return addresses, nil
}

func (r *addressRepository) Update(address *domain.Address) error {
	if err := r.db.Save(address).Error; err != nil {
		return fmt.Errorf("failed to update address: %w", err)
	}
	return nil
}

func (r *addressRepository) Delete(id uint) error {
	if err := r.db.Delete(&domain.Address{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete address: %w", err)
	}
	return nil
}

func (r *addressRepository) ClearDefault(userID uint) error {
	if err := r.db.Model(&domain.Address{}).
		Where("user_id = ? AND is_default = ?", userID, true).
		Update("is_default", false).Error; err != nil {
		return fmt.Errorf("failed to clear default: %w", err)
	}
	return nil
}

func (r *addressRepository) FindDefaultByUserID(userID uint) (*domain.Address, error) {
	var address domain.Address
	if err := r.db.Where("user_id = ? AND is_default = ?", userID, true).
		First(&address).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("no default address found")
		}
		return nil, fmt.Errorf("failed to find default address: %w", err)
	}
	return &address, nil
} 