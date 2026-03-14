package usecase

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/domain/user"
	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/config"
	"github.com/akhilbabu26/multibrand_database_4/pkg/email"
	"github.com/akhilbabu26/multibrand_database_4/pkg/hash"
	"github.com/akhilbabu26/multibrand_database_4/pkg/jwt"
	"github.com/akhilbabu26/multibrand_database_4/pkg/redis"

)

type userUsecase struct{
	repo domain.UserRepository
	mailer *email.Mailer
	cfg *config.Config
	tokenStore *redis.TokenStore
}

func NewUserUsecase(
	repo domain.UserRepository,
	mailer *email.Mailer,
	cfg *config.Config,
	tokenStore *redis.TokenStore,
) domain.UserUsecase {
	return &userUsecase{
		repo:   repo,
		mailer: mailer,
		cfg:    cfg,
		tokenStore: tokenStore,
	}
}

// -----Authentication----

// signup
func (u *userUsecase) Signup(name, email_, password, cPassword string) error{
	
	if password != cPassword{
		return fmt.Errorf("check your password")
	}

	// 1. check if user already exists
	existing, _ := u.repo.FindByEmail(email_)
	if existing != nil{
		return fmt.Errorf("user already existing")
	}


	// 2.hash password
	hashed, err := hash.HashPassword(password)
	if err != nil{
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// 3. generate OTP
    otp, err := generateOTP()
    if err != nil {
        return fmt.Errorf("failed to generate otp: %w", err)
    }
 
	// 4. save pending registration (not the real users table)
    pendingUser := &domain.PendingUser{
        Name:      name,
        Email:     email_,
        Password:  hashed,
        OTP:       otp,
        ExpiresAt: time.Now().Add(10 * time.Minute),
    }

	if err := u.repo.SavePendingUser(pendingUser); err != nil {
        return fmt.Errorf("failed to save pending registration: %w", err)
    }

	// 5. send OTP
    if err := u.mailer.SendOTP(email_, name, otp); err != nil {
        // rollback pending record if email fails
        u.repo.DeletePendingByEmail(email_)
        return fmt.Errorf("failed to send otp: %w", err)
    }

	return nil
}

// verify otp
func (u *userUsecase) VerifyOTP(email_, otp string) error {
	// 1. find pending registration
    pendingUser, err := u.repo.FindPendingByEmail(email_)
    if err != nil {
        return fmt.Errorf("no pending signup found, please signup again")
    }


	//2. check expiry
	if pendingUser.IsExpired() {
		u.repo.DeletePendingByEmail(email_)
		return fmt.Errorf("otp expired, please signup again")
	}

	//3. check code matches
	if pendingUser.OTP != otp{
		return fmt.Errorf("invalid OTP")
	}

	// 4. NOW create the real user — already verified
    user := &domain.User{
        Name:       pendingUser.Name,
        Email:      pendingUser.Email,
        Password:   pendingUser.Password,
        Role:       domain.RoleCustomer,
        IsVerified: true,
    }

	if err := u.repo.Create(user); err != nil {
        return fmt.Errorf("failed to create user: %w", err)
    }

    // 5. clean up pending record
    u.repo.DeletePendingByEmail(email_)

	return nil
}

//Login
func (u *userUsecase) Login(email_, password string) (string, string, error) {
	// 1. Find user
	user, err := u.repo.FindByEmail(email_)
	if err != nil{
		return "", "", fmt.Errorf("invalid credentials")
	}

	//2. check verified
	if !user.IsVerified{
		return "", "", fmt.Errorf("user not verified, please verify")
	}

	//3. check blocked
	if user.IsBlocked{
		return "", "", fmt.Errorf("account has been blocked, contact the support team")
	}

	// 4. check password
	if !hash.CheckPassword(password, user.Password){
		return "", "", fmt.Errorf("invalid credentials")
	}

	// generate both token
	tokens, err := jwt.GenerateTokenPair(
		user.ID, 
		user.Email, 
		string(user.Role),
		u.cfg.JWT.Secret,
	)
	if err != nil{
		return "", "", fmt.Errorf("faild to generate tokens: %w", err)
	}

	// save the referesh token in user redis db
	if err := u.tokenStore.Save(user.ID, tokens.RefreshToken, 7*24*time.Hour); err != nil{
		return "", "", fmt.Errorf("faild to save referesh token: %w", err)
	}

	return tokens.AccessToken, tokens.RefreshToken, nil
}

func (u *userUsecase) RefreshToken(refreshToken string) (string, error){
	// 1. validate token signature
	claims, err := jwt.ValidateToken(refreshToken, u.cfg.JWT.Secret)
	if err != nil{
		return "", fmt.Errorf("invalid referesh token")
	}

	//2. check token exists in redis
	stored, err := u.tokenStore.Get(claims.UserID)
	if err != nil{
		return "", fmt.Errorf("refresh token not fount: %w", err)
	}

	// check stored token matches
	if stored != refreshToken{
		return "", fmt.Errorf("referesh token mismatch, please login again")
	}

	// 4. check user still exists and is active
	user, err := u.repo.FindByID(claims.UserID)
	if err != nil {
		return "", fmt.Errorf("user not found")
	}
 
	if user.IsBlocked {
		return "", fmt.Errorf("account has been blocked, contact the support team")
	}

	// 5. generate new access token only
	accessToken, err := jwt.GenerateAccessToken(
		user.ID,
		user.Email,
		string(user.Role),
		u.cfg.JWT.Secret,
	)
	if err != nil {
		return "", fmt.Errorf("failed to generate access token: %w", err)
	}
 
	return accessToken, nil
}

//Logout
func (u *userUsecase) Logout(userID uint, accessToken string) error{
	// delete refresh token from redis
	if err := u.tokenStore.Delete(userID); err != nil{
		return fmt.Errorf("faild to logout: %w", err)
	}

	// 2. blacklist the access token until it expires
    if err := u.tokenStore.BlacklistToken(accessToken, 15*time.Minute); err != nil {
        return fmt.Errorf("failed to blacklist token: %w", err)
    }

	return nil
}

// get user
func (u *userUsecase) GetUser(userID uint) (*domain.User, error){
	user, err := u.repo.FindByID(userID)
	if err != nil {
		return nil, fmt.Errorf("user not fount")
	}

	return user, nil
}


func generateOTP() (string, error) {
	otp := ""
	for i := 0; i < 6; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", err
		}
		otp += num.String()
	}
	return otp, nil
}