package usecase

import (
	"context"
	"fmt"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"

	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
)

type cartUsecase struct {
	repo        contracts.CartRepository
	productRepo contracts.ProductRepository
}

func NewCartUsecase(
	repo contracts.CartRepository,
	productRepo contracts.ProductRepository,
) contracts.CartUsecase {
	return &cartUsecase{repo: repo, productRepo: productRepo}
}

func (u *cartUsecase) AddToCart(ctx context.Context, userID, productID uint, quantity int) error {
	product, err := u.productRepo.FindByID(ctx, productID)
	if err != nil {
		return err // already AppError
	}
	if !product.IsActive {
		return apperrors.ProductNotAvailable()
	}
	if product.Stock < quantity {
		return apperrors.BadRequest(
			fmt.Sprintf("insufficient stock, only %d available", product.Stock), nil,
		)
	}

	cart, err := u.repo.GetOrCreateCart(userID)
	if err != nil {
		return err
	}

	existingItem, err := u.repo.GetCartItem(cart.ID, productID)
	if err != nil {
		return err
	}

	if existingItem != nil {
		newQty := existingItem.Quantity + quantity
		if product.Stock < newQty {
			return apperrors.BadRequest(
				fmt.Sprintf("insufficient stock, only %d available", product.Stock), nil,
			)
		}
		return u.repo.UpdateCartItem(cart.ID, productID, newQty)
	}

	return u.repo.AddCartItem(cart.ID, productID, quantity)
}

func (u *cartUsecase) AddToCartDirect(ctx context.Context, userID, productID uint) error {
	return u.AddToCart(ctx, userID, productID, 1)
}

func (u *cartUsecase) RemoveFromCart(ctx context.Context, userID, productID uint) error {
	cart, err := u.repo.GetOrCreateCart(userID)
	if err != nil {
		return err
	}

	item, err := u.repo.GetCartItem(cart.ID, productID)
	if err != nil {
		return err
	}
	if item == nil {
		return apperrors.ProductNotInCart()
	}

	return u.repo.RemoveCartItem(cart.ID, productID)
}

func (u *cartUsecase) UpdateQuantity(ctx context.Context, userID, productID uint, quantity int) error {
	if quantity <= 0 {
		return apperrors.BadRequest("quantity must be greater than 0", nil)
	}

	product, err := u.productRepo.FindByID(ctx, productID)
	if err != nil {
		return err
	}
	if product.Stock < quantity {
		return apperrors.BadRequest(
			fmt.Sprintf("insufficient stock, only %d available", product.Stock), nil,
		)
	}

	cart, err := u.repo.GetOrCreateCart(userID)
	if err != nil {
		return err
	}

	item, err := u.repo.GetCartItem(cart.ID, productID)
	if err != nil {
		return err
	}
	if item == nil {
		return apperrors.ProductNotInCart()
	}

	return u.repo.UpdateCartItem(cart.ID, productID, quantity)
}

// N+1 Fix — uses JOIN query
func (u *cartUsecase) GetCart(ctx context.Context, userID uint) (*dto.CartResponse, error) {
	return u.repo.GetCartWithProducts(userID)
}

func (u *cartUsecase) ClearCart(ctx context.Context, userID uint) error {
	cart, err := u.repo.GetOrCreateCart(userID)
	if err != nil {
		return err
	}
	return u.repo.ClearCart(cart.ID)
}
