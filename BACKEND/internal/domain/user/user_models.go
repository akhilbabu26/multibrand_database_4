package domain

import "time"

type Role string

const (
	RoleAdmin Role = "admin"
	RoleCustomer Role = "customer"
)

type User struct{
	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`
	Name string `gorm:"not null" json:"name"`
	Email string `gorm:"uniqueIndex;not null" json:"email"` // adds unique index (faster lookups + unique)
	Password string `gorm:"not null" json:"-"`
	Role Role `gorm:"type:varchar(20);default:'customer'" json:"role"`
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

// ---request feilds----

type SignupRequest struct{
	Name     string `json:"name" binding:"required,min=2"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Cpassword string `json:"cPassword" binding:"required,min=6"`
}

type VerifyOTPRequest  struct{
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp" binding:"required,len=6"`
}

type LoginRequest struct{
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RefreshTokenRequest struct{
	RefreshToken string `json:"refresh_token" binding:"required"` 
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type ResetPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
	OTP string `json:"otp" binding:"required,len=6"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
	ConfirmPassword string `json:"confirm_password" binding:"required,min=6"`
}