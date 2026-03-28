package usecase

import (
	"crypto/rand"
	"math/big"
	"time"

	domain     "github.com/akhilbabu26/multibrand_database_4/internal/models/user"
	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/config"
	apperrors  "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"github.com/akhilbabu26/multibrand_database_4/pkg/email"
	"github.com/akhilbabu26/multibrand_database_4/pkg/hash"
	"github.com/akhilbabu26/multibrand_database_4/pkg/jwt"
	"github.com/akhilbabu26/multibrand_database_4/pkg/redis"
)

type userUsecase struct {
	repo       domain.UserRepository
	mailer     *email.Mailer
	cfg        *config.Config
	tokenStore *redis.TokenStore
}

func NewUserUsecase(
	repo domain.UserRepository,
	mailer *email.Mailer,
	cfg *config.Config,
	tokenStore *redis.TokenStore,
) domain.UserUsecase {
	return &userUsecase{
		repo:       repo,
		mailer:     mailer,
		cfg:        cfg,
		tokenStore: tokenStore,
	}
}

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

func (u *userUsecase) Signup(name, email_, password, cPassword string) error {
	// 1. check if user already exists
	existing, _ := u.repo.FindByEmail(email_)
	if existing != nil {
		return apperrors.EmailAlreadyExists(nil)
	}

	// 2. hash password
	hashed, err := hash.HashPassword(password)
	if err != nil {
		return apperrors.Internal("failed to hash password", err)
	}

	// 3. generate OTP
	otp, err := generateOTP()
	if err != nil {
		return apperrors.Internal("failed to generate otp", err)
	}

	// 4. save pending registration
	pendingUser := &domain.PendingUser{
		Name:      name,
		Email:     email_,
		Password:  hashed,
		OTP:       otp,
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}

	if err := u.repo.SavePendingUser(pendingUser); err != nil {
		return err    // already AppError from repo
	}

	// 5. send OTP — rollback if fails
	if err := u.mailer.SendOTP(email_, name, otp); err != nil {
		u.repo.DeletePendingByEmail(email_)
		return apperrors.Internal("failed to send otp email", err)
	}

	return nil
}

func (u *userUsecase) VerifyOTP(email_, otp string) error {
	// 1. find pending registration
	pendingUser, err := u.repo.FindPendingByEmail(email_)
	if err != nil {
		return apperrors.NoOTPFound()    // ← specific error
	}

	// 2. check expiry
	if pendingUser.IsExpired() {
		u.repo.DeletePendingByEmail(email_)
		return apperrors.OTPExpired()
	}

	// 3. check OTP matches
	if pendingUser.OTP != otp {
		return apperrors.OTPInvalid()
	}

	// 4. create real user
	user := &domain.User{
		Name:       pendingUser.Name,
		Email:      pendingUser.Email,
		Password:   pendingUser.Password,
		Role:       domain.RoleCustomer,
		IsVerified: true,
	}

	if err := u.repo.Create(user); err != nil {
		return err    // already AppError from repo
	}

	// 5. cleanup
	u.repo.DeletePendingByEmail(email_)
	return nil
}

func (u *userUsecase) Login(email_, password string) (string, string, error) {
	// 1. find user
	user, err := u.repo.FindByEmail(email_)
	if err != nil {
		return "", "", apperrors.InvalidCredentials(nil)    // don't reveal user not found
	}

	// 2. check verified
	if !user.IsVerified {
		return "", "", apperrors.AccountNotVerified()
	}

	// 3. check blocked
	if user.IsBlocked {
		return "", "", apperrors.AccountBlocked()
	}

	// 4. check password
	if !hash.CheckPassword(password, user.Password) {
		return "", "", apperrors.InvalidCredentials(nil)
	}

	// 5. generate tokens
	tokens, err := jwt.GenerateTokenPair(
		user.ID,
		user.Email,
		string(user.Role),
		u.cfg.JWT.Secret,
	)
	if err != nil {
		return "", "", apperrors.Internal("failed to generate tokens", err)
	}

	// 6. save refresh token in redis
	if err := u.tokenStore.Save(user.ID, tokens.RefreshToken, 7*24*time.Hour); err != nil {
		return "", "", apperrors.Internal("failed to save refresh token", err)
	}

	return tokens.AccessToken, tokens.RefreshToken, nil
}

func (u *userUsecase) RefreshToken(refreshToken string) (string, error) {
	// 1. validate token signature
	claims, err := jwt.ValidateToken(refreshToken, u.cfg.JWT.Secret)
	if err != nil {
		return "", apperrors.TokenInvalid()
	}

	// 2. check token exists in redis
	stored, err := u.tokenStore.Get(claims.UserID)
	if err != nil {
		return "", apperrors.SessionExpired()
	}

	// 3. check token matches
	if stored != refreshToken {
		return "", apperrors.SessionExpired()
	}

	// 4. check user exists and not blocked
	user, err := u.repo.FindByID(claims.UserID)
	if err != nil {
		return "", err    // already AppError from repo
	}

	if user.IsBlocked {
		return "", apperrors.AccountBlocked()
	}

	// 5. generate new access token
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

func (u *userUsecase) Logout(userID uint, accessToken string) error {
	// 1. delete refresh token from redis
	if err := u.tokenStore.Delete(userID); err != nil {
		return apperrors.Internal("failed to logout", err)
	}

	// 2. blacklist access token
	if err := u.tokenStore.BlacklistToken(accessToken, 15*time.Minute); err != nil {
		return apperrors.Internal("failed to blacklist token", err)
	}

	return nil
}

func (u *userUsecase) GetUser(userID uint) (*domain.User, error) {
	user, err := u.repo.FindByID(userID)
	if err != nil {
		return nil, err    // already AppError from repo
	}
	return user, nil
}

// ─────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────

func (u *userUsecase) ForgotPassword(email_ string) error {
	// 1. check user exists — don't reveal if not found (security)
	user, err := u.repo.FindByEmail(email_)
	if err != nil {
		return nil
	}

	// 2. check not blocked
	if user.IsBlocked {
		return apperrors.AccountBlocked()
	}

	// 3. generate OTP
	otp, err := generateOTP()
	if err != nil {
		return apperrors.Internal("failed to generate otp", err)
	}

	// 4. save OTP in redis with 10 min TTL
	if err := u.tokenStore.SaveResetOTP(email_, otp); err != nil {
		return apperrors.Internal("failed to save reset otp", err)
	}

	// 5. send OTP email — rollback if fails
	if err := u.mailer.SendResetOTP(email_, user.Name, otp); err != nil {
		u.tokenStore.DeleteResetOTP(email_)
		return apperrors.Internal("failed to send otp email", err)
	}

	return nil
}

func (u *userUsecase) ResetPassword(email_, otp, newPassword, confirmPassword string) error {
	// 1. get OTP from redis
	stored, err := u.tokenStore.GetResetOTP(email_)
	if err != nil {
		return apperrors.OTPExpired()
	}

	// 2. verify OTP
	if stored != otp {
		return apperrors.OTPInvalid()
	}

	// 3. check passwords match
	if newPassword != confirmPassword {
		return apperrors.BadRequest("passwords do not match", nil)
	}

	// 4. find user
	user, err := u.repo.FindByEmail(email_)
	if err != nil {
		return err    // already AppError from repo
	}

	// 5. hash new password
	hashed, err := hash.HashPassword(newPassword)
	if err != nil {
		return apperrors.Internal("failed to hash password", err)
	}

	// 6. update password
	user.Password = hashed
	if err := u.repo.Update(user); err != nil {
		return err    // already AppError from repo
	}

	// 7. cleanup redis
	u.tokenStore.DeleteResetOTP(email_)
	u.tokenStore.Delete(user.ID)

	return nil
}

// ─────────────────────────────────────────
// ADMIN USER MANAGEMENT
// ─────────────────────────────────────────

func (u *userUsecase) ListUsers() ([]*domain.User, error) {
	users, err := u.repo.ListUsers()
	if err != nil {
		return nil, err    // already AppError from repo
	}
	return users, nil
}

func (u *userUsecase) BlockUser(userID uint) error {
	// 1. check user exists
	user, err := u.repo.FindByID(userID)
	if err != nil {
		return err    // already AppError from repo
	}

	// 2. check already blocked
	if user.IsBlocked {
		return apperrors.UserAlreadyBlocked()
	}

	// 3. prevent blocking admin
	if user.Role == domain.RoleAdmin {
		return apperrors.CannotBlockAdmin()
	}

	// 4. block in db
	if err := u.repo.BlockUser(userID); err != nil {
		return err    // already AppError from repo
	}

	// 5. force logout
	u.tokenStore.Delete(userID)
	return nil
}

func (u *userUsecase) UnblockUser(id uint) error {
	// 1. check user exists
	user, err := u.repo.FindByID(id)
	if err != nil {
		return err    // already AppError from repo
	}

	// 2. check actually blocked
	if !user.IsBlocked {
		return apperrors.UserNotBlocked()
	}

	// 3. unblock in db
	if err := u.repo.UnblockUser(id); err != nil {
		return err    // already AppError from repo
	}

	return nil
}

func (u *userUsecase) DeleteUser(id uint) error {
	// 1. check user exists
	user, err := u.repo.FindByID(id)
	if err != nil {
		return err    // already AppError from repo
	}

	// 2. prevent deleting admin
	if user.Role == domain.RoleAdmin {
		return apperrors.CannotDeleteAdmin()
	}

	// 3. invalidate tokens first
	u.tokenStore.Delete(id)

	// 4. delete from db
	if err := u.repo.Delete(id); err != nil {
		return err    // already AppError from repo
	}

	return nil
}

// ─────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────

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