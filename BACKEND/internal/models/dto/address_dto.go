package dto

type CreateAddressRequest struct {
	FullName  string `json:"full_name" validate:"required,min=2"`
	Phone     string `json:"phone"     validate:"required,indian_phone"`
	Street    string `json:"street"    validate:"required"`
	Landmark  string `json:"landmark"`
	City      string `json:"city"      validate:"required"`
	State     string `json:"state"     validate:"required"`
	PinCode   string `json:"pin_code"  validate:"required,pincode"`
	IsDefault bool   `json:"is_default"`
}

type UpdateAddressRequest struct {
	FullName  *string `json:"full_name" validate:"omitempty,min=2"`
	Phone     *string `json:"phone" validate:"omitempty,indian_phone"`
	Street    *string `json:"street"`
	Landmark  *string `json:"landmark"`
	City      *string `json:"city"`
	State     *string `json:"state"`
	PinCode   *string `json:"pin_code" validate:"omitempty,pincode"`
	IsDefault *bool   `json:"is_default"`
}
