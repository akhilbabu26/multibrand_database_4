package domain

import "time"

// models
type Address struct {
	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID uint `gorm:"not null;index" json:"user_id"`
	FullName string `gorm:"not null" json:"full_name"`
	Phone string `gorm:"not null" json:"phone"`
	Street string `gorm:"not null" json:"street"`
	Landmark string `json:"landmark"`
	City string `gorm:"not null" json:"city"`
	State string `gorm:"not null" json:"state"`
	PinCode string `gorm:"not null" json:"pin_code"`
	IsDefault bool `gorm:"default:false" json:"is_default"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// requests
type CreateAddressRequest struct {
	FullName string `json:"full_name" binding:"required"`
	Phone string `json:"phone" binding:"required"`
	Street string `json:"street" binding:"required"`
	Landmark string `json:"landmark"`
	City string `json:"city" binding:"required"`
	State string `json:"state" binding:"required"`
	PinCode string `json:"pin_code" binding:"required"`
	IsDefault bool `json:"is_default"`
}

type UpdateAddressRequest struct {
	FullName *string `json:"full_name"`
	Phone *string `json:"phone"`
	Street *string `json:"street"`
	Landmark *string `json:"landmark"`
	City *string `json:"city"`
	State *string `json:"state"`
	PinCode *string `json:"pin_code"`
	IsDefault *bool `json:"is_default"`
}