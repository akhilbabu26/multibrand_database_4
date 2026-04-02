package usecase

import (
	"context"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"

	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
)

type addressUsecase struct {
	repo contracts.AddressRepository
}

func NewAddressUsecase(repo contracts.AddressRepository) contracts.AddressUsecase {
	return &addressUsecase{repo: repo}
}

func (u *addressUsecase) AddAddress(ctx context.Context, userID uint, req dto.CreateAddressRequest) error {
	if req.IsDefault {
		u.repo.ClearDefault(userID)
	}

	existing, _ := u.repo.FindByUserID(userID)
	if len(existing) == 0 {
		req.IsDefault = true
	}

	address := &entities.Address{
		UserID:    userID,
		FullName:  req.FullName,
		Phone:     req.Phone,
		Street:    req.Street,
		Landmark:  req.Landmark,
		City:      req.City,
		State:     req.State,
		PinCode:   req.PinCode,
		IsDefault: req.IsDefault,
	}

	return u.repo.Create(ctx, address)
}

func (u *addressUsecase) UpdateAddress(ctx context.Context, userID, addressID uint, req dto.UpdateAddressRequest) error {
	address, err := u.repo.FindByID(ctx, addressID)
	if err != nil {
		return err // already AppError
	}
	if address.UserID != userID {
		return apperrors.UnauthorizedAccess()
	}

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

	return u.repo.Update(ctx, address)
}

func (u *addressUsecase) DeleteAddress(ctx context.Context, userID, addressID uint) error {
	address, err := u.repo.FindByID(ctx, addressID)
	if err != nil {
		return err
	}
	if address.UserID != userID {
		return apperrors.UnauthorizedAccess()
	}
	return u.repo.Delete(ctx, addressID)
}

func (u *addressUsecase) GetAddresses(ctx context.Context, userID uint) ([]*entities.Address, error) {
	addresses, err := u.repo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	return addresses, nil
}

func (u *addressUsecase) GetAddress(ctx context.Context, userID, addressID uint) (*entities.Address, error) {
	address, err := u.repo.FindByID(ctx, addressID)
	if err != nil {
		return nil, err
	}
	if address.UserID != userID {
		return nil, apperrors.UnauthorizedAccess()
	}
	return address, nil
}

func (u *addressUsecase) SetDefault(ctx context.Context, userID, addressID uint) error {
	address, err := u.repo.FindByID(ctx, addressID)
	if err != nil {
		return err
	}
	if address.UserID != userID {
		return apperrors.UnauthorizedAccess()
	}
	u.repo.ClearDefault(userID)
	address.IsDefault = true
	return u.repo.Update(ctx, address)
}
