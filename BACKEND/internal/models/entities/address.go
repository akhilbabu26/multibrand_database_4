package entities

import "time"

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

