package domain

import "time"

// models
type Address struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint      `gorm:"not null;index:,composite:user_default" json:"user_id"`
	FullName  string    `gorm:"not null" json:"full_name"`
	Phone     string    `gorm:"not null" json:"phone"`
	Street    string    `gorm:"not null" json:"street"`
	Landmark  string    `json:"landmark"`
	City      string    `gorm:"not null" json:"city"`
	State     string    `gorm:"not null" json:"state"`
	PinCode   string    `gorm:"not null" json:"pin_code"`
	IsDefault bool      `gorm:"default:false;index:,composite:user_default" json:"is_default"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// requests
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
