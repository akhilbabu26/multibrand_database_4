package usecase

import (
	"context"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
)

type wishlistUsecase struct {
	repo        contracts.WishlistRepository
	productRepo contracts.ProductRepository
	cartUsecase contracts.CartUsecase
}

func NewWishlistUsecase(
	repo contracts.WishlistRepository,
	productRepo contracts.ProductRepository,
	cartUsecase contracts.CartUsecase,
) contracts.WishlistUsecase {
	return &wishlistUsecase{
		repo:        repo,
		productRepo: productRepo,
		cartUsecase: cartUsecase,
	}
}

func (u *wishlistUsecase) AddToWishlist(ctx context.Context, userID, productID uint) error {
	product, err := u.productRepo.FindByID(ctx, productID)
	if err != nil {
		return err // already AppError
	}
	if !product.IsActive {
		return apperrors.ProductNotAvailable()
	}
	if u.repo.IsInWishlist(userID, productID) {
		return apperrors.ProductInWishlist()
	}
	return u.repo.Add(userID, productID)
}

func (u *wishlistUsecase) RemoveFromWishlist(ctx context.Context, userID, productID uint) error {
	if !u.repo.IsInWishlist(userID, productID) {
		return apperrors.ProductNotInWishlist()
	}
	return u.repo.Remove(userID, productID)
}

// N+1 Fix — uses JOIN query
func (u *wishlistUsecase) GetWishlist(ctx context.Context, userID uint) ([]*dto.WishlistResponse, error) {
	return u.repo.GetWishlistWithProducts(userID)
}

func (u *wishlistUsecase) IsInWishlist(ctx context.Context, userID, productID uint) bool {
	return u.repo.IsInWishlist(userID, productID)
}

func (u *wishlistUsecase) MoveToCart(ctx context.Context, userID, productID uint) error {
	if !u.repo.IsInWishlist(userID, productID) {
		return apperrors.ProductNotInWishlist()
	}
	if err := u.cartUsecase.AddToCartDirect(ctx, userID, productID); err != nil {
		return err
	}
	return u.repo.DeleteByProductID(userID, productID)
}
