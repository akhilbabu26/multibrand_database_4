package contracts

import (
	"context"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	"github.com/akhilbabu26/multibrand_database_4/internal/repository/generic"
	"gorm.io/gorm"
)

type CartRepository interface {
	generic.Repository[entities.Cart]
	WithTx(tx *gorm.DB) CartRepository
	GetOrCreateCart(userID uint) (*entities.Cart, error)
	GetCartWithItems(userID uint) (*entities.Cart, error)
	GetCartWithProducts(userID uint) (*dto.CartResponse, error)
	GetCartItem(cartID, productID uint) (*entities.CartItem, error)
	AddCartItem(cartID, productID uint, quantity int) error
	UpdateCartItem(cartID, productID uint, quantity int) error
	RemoveCartItem(cartID, productID uint) error
	ClearCart(cartID uint) error
	IsInCart(userID, productID uint) bool
}

type CartUsecase interface {
	AddToCart(ctx context.Context, userID, productID uint, quantity int) error
	RemoveFromCart(ctx context.Context, userID, productID uint) error
	UpdateQuantity(ctx context.Context, userID, productID uint, quantity int) error
	GetCart(ctx context.Context, userID uint) (*dto.CartResponse, error)
	ClearCart(ctx context.Context, userID uint) error
	AddToCartDirect(ctx context.Context, userID, productID uint) error
	IsInCart(ctx context.Context, userID, productID uint) bool
}
