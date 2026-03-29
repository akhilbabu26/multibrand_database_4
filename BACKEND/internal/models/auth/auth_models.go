package domain

// ---request feilds----
type SignupRequest struct {
	Name      string `json:"name" validate:"required,min=2"`
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	Cpassword string `json:"cPassword" validate:"required,eqfield=Password"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type VerifyOTPRequest struct {
	Email string `json:"email" validate:"required,email"`
	OTP   string `json:"otp" validate:"required,len=6,numeric"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ResetPasswordRequest struct {
	Email           string `json:"email" validate:"required,email"`
	OTP             string `json:"otp" validate:"required,len=6,numeric"`
	NewPassword     string `json:"new_password" validate:"required,min=6"`
	ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=NewPassword"`
}

// AuthUsecase defining the business logic layer for Authentication
type AuthUsecase interface {
	Signup(name, email, password, cPassword string) error
	VerifyOTP(email, code string) error
	Login(email, password string) (accessToken string, refreshToken string, err error)
	RefreshToken(refreshToken string) (accessToken string, err error)
	Logout(userID uint, accessToken string) error
	ForgotPassword(email string) error
	ResetPassword(email, otp, newPassword, confirmPassword string) error
}
