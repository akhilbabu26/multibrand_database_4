package usecase

import (
	"fmt"

	wishlistDomain "github.com/akhilbabu26/multibrand_database_4/internal/domain/wishlist"
	productDomain  "github.com/akhilbabu26/multibrand_database_4/internal/domain/product"
	cartDomain     "github.com/akhilbabu26/multibrand_database_4/internal/domain/cart"
)

type wishlistUsecase struct {
	repo        wishlistDomain.WishlistRepository
	productRepo productDomain.ProductRepository
	cartUsecase cartDomain.CartUsecase // depends on cart usecase for MoveToCart
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
	// 1. check product exists and active
	product, err := u.productRepo.FindByID(productID)
	if err != nil {
		return fmt.Errorf("product not found")
	}
	if !product.IsActive {
		return fmt.Errorf("product is not available")
	}

	// 2. check already in wishlist
	if u.repo.IsInWishlist(userID, productID) {
		return fmt.Errorf("product already in wishlist")
	}

	return u.repo.Add(userID, productID)
}

func (u *wishlistUsecase) RemoveFromWishlist(userID, productID uint) error {
	if !u.repo.IsInWishlist(userID, productID) {
		return fmt.Errorf("product not in wishlist")
	}
	return u.repo.Remove(userID, productID)
}

func (u *wishlistUsecase) GetWishlist(userID uint) ([]*wishlistDomain.WishlistResponse, error) {
	wishlist, err := u.repo.GetByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get wishlist: %w", err)
	}

	var response []*wishlistDomain.WishlistResponse
	for _, w := range wishlist {
		product, err := u.productRepo.FindByID(w.ProductID)
		if err != nil {
			continue // skip deleted products
		}

		response = append(response, &wishlistDomain.WishlistResponse{
			ID:        w.ID,
			ProductID: w.ProductID,
			Product: &wishlistDomain.ProductInWishlist{
				ID:        product.ID,
				Name:      product.Name,
				SalePrice: product.SalePrice,
				ImageURL:  product.ImageURL,
			},
			CreatedAt: w.CreatedAt,
		})
	}

	return response, nil
}

func (u *wishlistUsecase) MoveToCart(userID, productID uint) error {
	// 1. check in wishlist
	if !u.repo.IsInWishlist(userID, productID) {
		return fmt.Errorf("product not in wishlist")
	}

	// 2. add to cart with quantity 1
	if err := u.cartUsecase.AddToCartDirect(userID, productID); err != nil {
		return fmt.Errorf("failed to move to cart: %w", err)
	}

	// 3. remove from wishlist
	return u.repo.DeleteByProductID(userID, productID)
}