package usecase

import (
	"fmt"

	cartDomain    "github.com/akhilbabu26/multibrand_database_4/internal/domain/cart"
	productDomain "github.com/akhilbabu26/multibrand_database_4/internal/domain/product"
)

type cartUsecase struct {
	repo        cartDomain.CartRepository
	productRepo productDomain.ProductRepository
}

func NewCartUsecase(
	repo cartDomain.CartRepository,
	productRepo productDomain.ProductRepository,
) cartDomain.CartUsecase {
	return &cartUsecase{
		repo:        repo,
		productRepo: productRepo,
	}
}

func (u *cartUsecase) AddToCart(userID, productID uint, quantity int) error {
	product, err := u.productRepo.FindByID(productID)
	if err != nil {
		return fmt.Errorf("product not found")
	}
	if !product.IsActive {
		return fmt.Errorf("product is not available")
	}
	if product.Stock < quantity {
		return fmt.Errorf("insufficient stock, only %d available", product.Stock)
	}

	cart, err := u.repo.GetOrCreateCart(userID)
	if err != nil {
		return fmt.Errorf("failed to get cart: %w", err)
	}

	existingItem, err := u.repo.GetCartItem(cart.ID, productID)
	if err != nil {
		return fmt.Errorf("failed to check cart: %w", err)
	}

	if existingItem != nil {
		newQty := existingItem.Quantity + quantity
		if product.Stock < newQty {
			return fmt.Errorf("insufficient stock, only %d available", product.Stock)
		}
		return u.repo.UpdateCartItem(cart.ID, productID, newQty)
	}

	return u.repo.AddCartItem(cart.ID, productID, quantity)
}

// AddToCartDirect — used by wishlist MoveToCart with quantity 1
func (u *cartUsecase) AddToCartDirect(userID, productID uint) error {
	return u.AddToCart(userID, productID, 1)
}

func (u *cartUsecase) RemoveFromCart(userID, productID uint) error {
	cart, err := u.repo.GetOrCreateCart(userID)
	if err != nil {
		return fmt.Errorf("failed to get cart: %w", err)
	}

	item, err := u.repo.GetCartItem(cart.ID, productID)
	if err != nil {
		return fmt.Errorf("failed to check cart: %w", err)
	}
	if item == nil {
		return fmt.Errorf("product not in cart")
	}

	return u.repo.RemoveCartItem(cart.ID, productID)
}

func (u *cartUsecase) UpdateQuantity(userID, productID uint, quantity int) error {
	if quantity <= 0 {
		return fmt.Errorf("quantity must be greater than 0")
	}

	product, err := u.productRepo.FindByID(productID)
	if err != nil {
		return fmt.Errorf("product not found")
	}
	if product.Stock < quantity {
		return fmt.Errorf("insufficient stock, only %d available", product.Stock)
	}

	cart, err := u.repo.GetOrCreateCart(userID)
	if err != nil {
		return fmt.Errorf("failed to get cart: %w", err)
	}

	item, err := u.repo.GetCartItem(cart.ID, productID)
	if err != nil {
		return fmt.Errorf("failed to check cart: %w", err)
	}
	if item == nil {
		return fmt.Errorf("product not in cart")
	}

	return u.repo.UpdateCartItem(cart.ID, productID, quantity)
}

func (u *cartUsecase) GetCart(userID uint) (*cartDomain.CartResponse, error) {
	cart, err := u.repo.GetCartWithItems(userID)
	if err != nil {
		return &cartDomain.CartResponse{
			Items:      []cartDomain.CartItemResponse{},
			TotalItems: 0,
			TotalPrice: 0,
		}, nil
	}

	var items []cartDomain.CartItemResponse
	var totalPrice float64
	totalItems := 0

	for _, item := range cart.Items {
		product, err := u.productRepo.FindByID(item.ProductID)
		if err != nil {
			continue
		}

		subtotal := product.SalePrice * float64(item.Quantity)
		totalPrice += subtotal
		totalItems += item.Quantity

		items = append(items, cartDomain.CartItemResponse{
			ID:        item.ID,
			ProductID: item.ProductID,
			Name:      product.Name,
			ImageURL:  product.ImageURL,
			SalePrice: product.SalePrice,
			Quantity:  item.Quantity,
			Subtotal:  subtotal,
		})
	}

	return &cartDomain.CartResponse{
		ID:         cart.ID,
		Items:      items,
		TotalItems: totalItems,
		TotalPrice: totalPrice,
	}, nil
}

func (u *cartUsecase) ClearCart(userID uint) error {
	cart, err := u.repo.GetOrCreateCart(userID)
	if err != nil {
		return fmt.Errorf("failed to get cart: %w", err)
	}
	return u.repo.ClearCart(cart.ID)
}