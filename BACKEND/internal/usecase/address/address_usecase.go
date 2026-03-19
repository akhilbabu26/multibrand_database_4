package usecase

import (
	"fmt"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/domain/address"
)

type addressUsecase struct{
	repo domain.AddressRepository
}

func NewAddressUsecase(repo domain.AddressRepository) domain.AddressUsecase{
	return &addressUsecase{repo: repo}
}

func (u *addressUsecase)  AddAddress(userID uint, req domain.CreateAddressRequest) error{
	// if it need to be default
	if req.IsDefault{
		u.repo.ClearDefault(userID)
	}

	// if only one address set it default
	existing, _ := u.repo.FindByUserID(userID)
	if len(existing) == 0 {
		req.IsDefault = true
	}

	address := &domain.Address{
		UserID:    userID,
		FullName:  req.FullName,
		Phone:     req.Phone,
		Street:     req.Street,
		Landmark:   req.Landmark,
		City:      req.City,
		State:     req.State,
		PinCode:   req.PinCode,
		IsDefault: req.IsDefault,
	}

	return u.repo.Create(address)
}

func (u *addressUsecase) UpdateAddress(userID, addressID uint, req domain.UpdateAddressRequest) error {
	// find address
	address, err := u.repo.FindByID(addressID)
	if err != nil{
		return fmt.Errorf("address not found")
	}

	if address.UserID != userID{
		return fmt.Errorf("unauthorized")
	}

	// 3. update only provided fields
	if req.FullName != nil {
		address.FullName = *req.FullName
	}
	if req.Phone != nil {
		address.Phone = *req.Phone
	}
	if req.Street != nil {
		address.Street = *req.Street
	}
	if req.Landmark != nil {
		address.Landmark = *req.Landmark
	}
	if req.City != nil {
		address.City = *req.City
	}
	if req.State != nil {
		address.State = *req.State
	}
	if req.PinCode != nil {
		address.PinCode = *req.PinCode
	}
	if req.IsDefault != nil && *req.IsDefault {
		u.repo.ClearDefault(userID)
		address.IsDefault = true
	}

	return u.repo.Update(address)
}

func (u *addressUsecase) DeleteAddress(userID, addressID uint) error {
	address, err := u.repo.FindByID(addressID)
	if err != nil {
		return fmt.Errorf("address not found")
	}

	// make sure address belongs to user
	if address.UserID != userID {
		return fmt.Errorf("unauthorized")
	}

	return u.repo.Delete(addressID)
}

func (u *addressUsecase) GetAddresses(userID uint) ([]*domain.Address, error) {
	addresses, err := u.repo.FindByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get addresses: %w", err)
	}
	return addresses, nil
}

func (u *addressUsecase) GetAddress(userID, addressID uint) (*domain.Address, error) {
	address, err := u.repo.FindByID(addressID)
	if err != nil {
		return nil, fmt.Errorf("address not found")
	}

	if address.UserID != userID {
		return nil, fmt.Errorf("unauthorized")
	}

	return address, nil
}

func (u *addressUsecase) SetDefault(userID, addressID uint) error {
	address, err := u.repo.FindByID(addressID)
	if err != nil {
		return fmt.Errorf("address not found")
	}

	if address.UserID != userID {
		return fmt.Errorf("unauthorized")
	}

	// clear existing default
	u.repo.ClearDefault(userID)

	// set new default
	address.IsDefault = true
	return u.repo.Update(address)
}