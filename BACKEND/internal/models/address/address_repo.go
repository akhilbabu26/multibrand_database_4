package domain

type AddressRepository interface {
	Create(address *Address) error
	FindByID(id uint) (*Address, error)
	FindByUserID(userID uint) ([]*Address, error)
	FindByIDs(ids []uint) (map[uint]*Address, error)
	Update(address *Address) error
	Delete(id uint) error
	ClearDefault(userID uint) error  // clears is_default before setting new default
	FindDefaultByUserID(userID uint) (*Address, error)
}

type AddressUsecase interface {
	AddAddress(userID uint, req CreateAddressRequest) error
	UpdateAddress(userID, addressID uint, req UpdateAddressRequest) error
	DeleteAddress(userID, addressID uint) error
	GetAddresses(userID uint) ([]*Address, error)
	GetAddress(userID, addressID uint) (*Address, error)
	SetDefault(userID, addressID uint) error
}
