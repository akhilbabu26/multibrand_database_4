package domain

import "time"

type Role string

const (
	RoleAdmin Role = "admin"
	RoleUser Role = "user"
)

type User struct{
	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`
	Name string `gorm:"not null" json:"name"`
	Email string `gorm:"uniqueIndex;not null" json:"email"` // adds unique index (faster lookups + unique)
	Password string `gorm:"not null" json:"-"`
	Role Role `gorm:"type:varchar(20);default:'user'" json:"role"`
	IsVerified bool `gorm:"default:false" json:"is_verified"`
	IsBlocked bool `gorm:"default:false" json:"is_blocked"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type PendingUser struct {
    ID        uint      `gorm:"primaryKey;autoIncrement"`
    Name      string    `gorm:"not null"`
    Email     string    `gorm:"uniqueIndex;not null"`
    Password  string    `gorm:"not null"`
    OTP       string    `gorm:"not null"`
    ExpiresAt time.Time `gorm:"not null"`
    CreatedAt time.Time
}

// IsExpired checks if OTP has passed its expiry time
func (p *PendingUser) IsExpired() bool {
    return time.Now().After(p.ExpiresAt)
}
