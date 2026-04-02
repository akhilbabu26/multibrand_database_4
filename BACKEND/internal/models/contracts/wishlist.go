package contracts

import (
	"context"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	"github.com/akhilbabu26/multibrand_database_4/internal/repository/generic"
)

type WishlistRepository interface {
	generic.Repository[entities.Wishlist]
	Add(userID, productID uint) error
	Remove(userID, productID uint) error
	GetByUserID(userID uint) ([]*entities.Wishlist, error)
	IsInWishlist(userID, productID uint) bool
	DeleteByProductID(userID, productID uint) error
	GetWishlistWithProducts(userID uint) ([]*dto.WishlistResponse, error)
}

type WishlistUsecase interface {
	AddToWishlist(ctx context.Context, userID, productID uint) error
	RemoveFromWishlist(ctx context.Context, userID, productID uint) error
	GetWishlist(ctx context.Context, userID uint) ([]*dto.WishlistResponse, error)
	MoveToCart(ctx context.Context, userID, productID uint) error
}
