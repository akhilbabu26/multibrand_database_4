package contracts

import "context"

type AuthUsecase interface {
	Signup(ctx context.Context, name, email, password, cPassword string) error
	VerifyOTP(ctx context.Context, email, code string) error
	Login(ctx context.Context, email, password string) (accessToken string, refreshToken string, err error)
	RefreshToken(ctx context.Context, refreshToken string) (accessToken string, err error)
	Logout(ctx context.Context, userID uint, accessToken string) error
	ForgotPassword(ctx context.Context, email string) error
	ResetPassword(ctx context.Context, email, otp, newPassword, confirmPassword string) error
}
