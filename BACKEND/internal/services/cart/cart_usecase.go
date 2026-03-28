package usecase

import (
	"fmt"

	cartDomain    "github.com/akhilbabu26/multibrand_database_4/internal/models/cart"
	productDomain "github.com/akhilbabu26/multibrand_database_4/internal/models/product"
	apperrors     "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
)

type cartUsecase struct {
	repo        cartDomain.CartRepository
	productRepo productDomain.ProductRepository
}

func NewCartUsecase(
	repo cartDomain.CartRepository,
	productRepo productDomain.ProductRepository,
) cartDomain.CartUsecase {
	return &cartUsecase{repo: repo, productRepo: productRepo}
}

func (u *cartUsecase) AddToCart(userID, productID uint, quantity int) error {
	product, err := u.productRepo.FindByID(productID)
	if err != nil {
		return err    // already AppError
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

func (u *cartUsecase) AddToCartDirect(userID, productID uint) error {
	return u.AddToCart(userID, productID, 1)
}

func (u *cartUsecase) RemoveFromCart(userID, productID uint) error {
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

func (u *cartUsecase) UpdateQuantity(userID, productID uint, quantity int) error {
	if quantity <= 0 {
		return apperrors.BadRequest("quantity must be greater than 0", nil)
	}

	product, err := u.productRepo.FindByID(productID)
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
func (u *cartUsecase) GetCart(userID uint) (*cartDomain.CartResponse, error) {
	return u.repo.GetCartWithProducts(userID)
}

func (u *cartUsecase) ClearCart(userID uint) error {
	cart, err := u.repo.GetOrCreateCart(userID)
	if err != nil {
		return err
	}
	return u.repo.ClearCart(cart.ID)
}