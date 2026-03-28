package usecase

import (
	wishlistDomain "github.com/akhilbabu26/multibrand_database_4/internal/models/wishlist"
	productDomain  "github.com/akhilbabu26/multibrand_database_4/internal/models/product"
	cartDomain     "github.com/akhilbabu26/multibrand_database_4/internal/models/cart"
	apperrors      "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
)

type wishlistUsecase struct {
	repo        wishlistDomain.WishlistRepository
	productRepo productDomain.ProductRepository
	cartUsecase cartDomain.CartUsecase
}

func NewWishlistUsecase(
	repo wishlistDomain.WishlistRepository,
	productRepo productDomain.ProductRepository,
	cartUsecase cartDomain.CartUsecase,
) wishlistDomain.WishlistUsecase {
	return &wishlistUsecase{
		repo:        repo,
		productRepo: productRepo,
		cartUsecase: cartUsecase,
	}
}

func (u *wishlistUsecase) AddToWishlist(userID, productID uint) error {
	product, err := u.productRepo.FindByID(productID)
	if err != nil {
		return err    // already AppError
	}
	if !product.IsActive {
		return apperrors.ProductNotAvailable()
	}
	if u.repo.IsInWishlist(userID, productID) {
		return apperrors.ProductInWishlist()
	}
	return u.repo.Add(userID, productID)
}

func (u *wishlistUsecase) RemoveFromWishlist(userID, productID uint) error {
	if !u.repo.IsInWishlist(userID, productID) {
		return apperrors.ProductNotInWishlist()
	}
	return u.repo.Remove(userID, productID)
}

// N+1 Fix — uses JOIN query
func (u *wishlistUsecase) GetWishlist(userID uint) ([]*wishlistDomain.WishlistResponse, error) {
	return u.repo.GetWishlistWithProducts(userID)
}

func (u *wishlistUsecase) MoveToCart(userID, productID uint) error {
	if !u.repo.IsInWishlist(userID, productID) {
		return apperrors.ProductNotInWishlist()
	}
	if err := u.cartUsecase.AddToCartDirect(userID, productID); err != nil {
		return err
	}
	return u.repo.DeleteByProductID(userID, productID)
}