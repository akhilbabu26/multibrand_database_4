package usecase

import (
	"crypto/rand"
	"math/big"
	"time"

	authDomain "github.com/akhilbabu26/multibrand_database_4/internal/models/auth"
	userDomain "github.com/akhilbabu26/multibrand_database_4/internal/models/user"
	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/config"
	apperrors  "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/email"
	"github.com/akhilbabu26/multibrand_database_4/pkg/hash"
	"github.com/akhilbabu26/multibrand_database_4/pkg/jwt"
	"github.com/akhilbabu26/multibrand_database_4/pkg/redis"
)

type authUsecase struct {
	repo       userDomain.UserRepository
	mailer     *email.Mailer
	cfg        *config.Config
	tokenStore *redis.TokenStore
}

func NewAuthUsecase(
	repo userDomain.UserRepository,
	mailer *email.Mailer,
	cfg *config.Config,
	tokenStore *redis.TokenStore,
) authDomain.AuthUsecase {
	return &authUsecase{
		repo:       repo,
		mailer:     mailer,
		cfg:        cfg,
		tokenStore: tokenStore,
	}
}

func (u *authUsecase) Signup(name, email_, password, cPassword string) error {
	existing, _ := u.repo.FindByEmail(email_)
	if existing != nil {
		return apperrors.EmailAlreadyExists(nil)
	}

	hashed, err := hash.HashPassword(password)
	if err != nil {
		return apperrors.Internal("failed to hash password", err)
	}

	otp, err := generateOTP()
	if err != nil {
		return apperrors.Internal("failed to generate otp", err)
	}

	pendingUser := &userDomain.PendingUser{
		Name:      name,
		Email:     email_,
		Password:  hashed,
		OTP:       otp,
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}

	if err := u.repo.SavePendingUser(pendingUser); err != nil {
		return err
	}

	if err := u.mailer.SendOTP(email_, name, otp); err != nil {
		u.repo.DeletePendingByEmail(email_)
		return apperrors.Internal("failed to send otp email", err)
	}

	return nil
}

func (u *authUsecase) VerifyOTP(email_, otp string) error {
	pendingUser, err := u.repo.FindPendingByEmail(email_)
	if err != nil {
		return apperrors.NoOTPFound()
	}

	if pendingUser.IsExpired() {
		u.repo.DeletePendingByEmail(email_)
		return apperrors.OTPExpired()
	}

	if pendingUser.OTP != otp {
		return apperrors.OTPInvalid()
	}

	user := &userDomain.User{
		Name:       pendingUser.Name,
		Email:      pendingUser.Email,
		Password:   pendingUser.Password,
		Role:       userDomain.RoleUser,
		IsVerified: true,
	}

	if err := u.repo.Create(user); err != nil {
		return err
	}

	u.repo.DeletePendingByEmail(email_)
	return nil
}

func (u *authUsecase) Login(email_, password string) (string, string, error) {
	user, err := u.repo.FindByEmail(email_)
	if err != nil {
		return "", "", apperrors.InvalidCredentials(nil)
	}

	if !user.IsVerified {
		return "", "", apperrors.AccountNotVerified()
	}

	if user.IsBlocked {
		return "", "", apperrors.AccountBlocked()
	}

	if !hash.CheckPassword(password, user.Password) {
		return "", "", apperrors.InvalidCredentials(nil)
	}

	tokens, err := jwt.GenerateTokenPair(
		user.ID,
		user.Email,
		string(user.Role),
		u.cfg.JWT.Secret,
	)
	if err != nil {
		return "", "", apperrors.Internal("failed to generate tokens", err)
	}

	if err := u.tokenStore.Save(user.ID, tokens.RefreshToken, 7*24*time.Hour); err != nil {
		return "", "", apperrors.Internal("failed to save refresh token", err)
	}

	return tokens.AccessToken, tokens.RefreshToken, nil
}

func (u *authUsecase) RefreshToken(refreshToken string) (string, error) {
	claims, err := jwt.ValidateToken(refreshToken, u.cfg.JWT.Secret)
	if err != nil {
		return "", apperrors.TokenInvalid()
	}

	stored, err := u.tokenStore.Get(claims.UserID)
	if err != nil {
		return "", apperrors.SessionExpired()
	}

	if stored != refreshToken {
		return "", apperrors.SessionExpired()
	}

	user, err := u.repo.FindByID(claims.UserID)
	if err != nil {
		return "", err
	}

	if user.IsBlocked {
		return "", apperrors.AccountBlocked()
	}

	accessToken, err := jwt.GenerateAccessToken(
		user.ID,
		user.Email,
		string(user.Role),
		u.cfg.JWT.Secret,
	)
	if err != nil {
		return "", apperrors.Internal("failed to generate access token", err)
	}

	return accessToken, nil
}

func (u *authUsecase) Logout(userID uint, accessToken string) error {
	if err := u.tokenStore.Delete(userID); err != nil {
		return apperrors.Internal("failed to logout", err)
	}

	if err := u.tokenStore.BlacklistToken(accessToken, 15*time.Minute); err != nil {
		return apperrors.Internal("failed to blacklist token", err)
	}

	return nil
}

func (u *authUsecase) ForgotPassword(email_ string) error {
	user, err := u.repo.FindByEmail(email_)
	if err != nil {
		return nil
	}

	if user.IsBlocked {
		return apperrors.AccountBlocked()
	}

	otp, err := generateOTP()
	if err != nil {
		return apperrors.Internal("failed to generate otp", err)
	}

	if err := u.tokenStore.SaveResetOTP(email_, otp); err != nil {
		return apperrors.Internal("failed to save reset otp", err)
	}

	if err := u.mailer.SendResetOTP(email_, user.Name, otp); err != nil {
		u.tokenStore.DeleteResetOTP(email_)
		return apperrors.Internal("failed to send otp email", err)
	}

	return nil
}

func (u *authUsecase) ResetPassword(email_, otp, newPassword, confirmPassword string) error {
	stored, err := u.tokenStore.GetResetOTP(email_)
	if err != nil {
		return apperrors.OTPExpired()
	}

	if stored != otp {
		return apperrors.OTPInvalid()
	}

	if newPassword != confirmPassword {
		return apperrors.BadRequest("passwords do not match", nil)
	}

	user, err := u.repo.FindByEmail(email_)
	if err != nil {
		return err
	}

	hashed, err := hash.HashPassword(newPassword)
	if err != nil {
		return apperrors.Internal("failed to hash password", err)
	}

	user.Password = hashed
	if err := u.repo.Update(user); err != nil {
		return err
	}

	u.tokenStore.DeleteResetOTP(email_)
	u.tokenStore.Delete(user.ID)

	return nil
}

func generateOTP() (string, error) {
	otp := ""
	for i := 0; i < 6; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", apperrors.Internal("failed to generate otp", err)
		}
		otp += num.String()
	}
	return otp, nil
}
