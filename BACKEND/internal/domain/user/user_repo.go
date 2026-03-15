package domain


// UserRepository — database contract for user operations
type UserRepository interface{
	// user operations
	Create(user *User) error
	FindByID(id uint) (*User, error)
	FindByEmail(email string) (*User, error)
	Update(user *User) error
	ListUsers() ([]*User, error)
	// block/unblock/delete operations
    BlockUser(id uint) error
    UnblockUser(id uint) error
	Delete(id uint) error

	//OTP operations
	SavePendingUser(p *PendingUser) error
    FindPendingByEmail(email string) (*PendingUser, error)
    DeletePendingByEmail(email string) error
    DeleteExpiredPending() error  // for cleanup job
}

// UserUsecase — business logic contract for auth operations
type UserUsecase interface{
	// Auth
	Signup(name, email, password, cPassword string) error
	VerifyOTP(email, code string) error
	Login(email, password string) (accessToken string, refreshToken string, err error)
	RefreshToken(refreshToken string) (accessToken string, err error)
	Logout(userID uint, accessToken string) error

	// Password reset
	ForgotPassword(email string) error
	ResetPassword(email, otp, newPassword, confirmPassword string) error

	//user
	GetUser(id uint) (*User, error)
}