package repository

import (
	"errors"
	"fmt"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/domain/cart"
	
	"gorm.io/gorm"
)

type cartRepository struct{
	db *gorm.DB
}

func NewCartRepository(db *gorm.DB) domain.CartRepository{
	return &cartRepository{db: db}
}

// when adding get the cart and if the cart not existis create cart and add item then get the cart
func (r *cartRepository) GetOrCreateCart(userID uint) (*domain.Cart, error) {
	var cart domain.Cart
	err := r.db.Where("user_id = ?", userID).First(&cart).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			cart = domain.Cart{UserID: userID}
			if err := r.db.Create(&cart).Error; err != nil {
				return nil, fmt.Errorf("failed to create cart: %w", err)
			}
			return &cart, nil
		}
		return nil, fmt.Errorf("failed to get cart: %w", err)
	}
	return &cart, nil
}

func (r *cartRepository) GetCartWithItems(userID uint) (*domain.Cart, error) {
	var cart domain.Cart
	if err := r.db.Where("user_id = ?", userID).
		Preload("Items").
		First(&cart).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("cart not found")
		}
		return nil, fmt.Errorf("failed to get cart: %w", err)
	}
	return &cart, nil
}

func (r *cartRepository) GetCartItem(cartID, productID uint) (*domain.CartItem, error) {
	var item domain.CartItem
	if err := r.db.Where("cart_id = ? AND product_id = ?", cartID, productID).
		First(&item).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get cart item: %w", err)
	}
	return &item, nil
}

func (r *cartRepository) AddCartItem(cartID, productID uint, quantity int) error {
	item := &domain.CartItem{
		CartID:    cartID,
		ProductID: productID,
		Quantity:  quantity,
	}
	if err := r.db.Create(item).Error; err != nil {
		return fmt.Errorf("failed to add cart item: %w", err)
	}
	return nil
}

func (r *cartRepository) UpdateCartItem(cartID, productID uint, quantity int) error {
	if err := r.db.Model(&domain.CartItem{}).
		Where("cart_id = ? AND product_id = ?", cartID, productID).
		Update("quantity", quantity).Error; err != nil {
		return fmt.Errorf("failed to update cart item: %w", err)
	}
	return nil
}

func (r *cartRepository) RemoveCartItem(cartID, productID uint) error {
	if err := r.db.Where("cart_id = ? AND product_id = ?", cartID, productID).
		Delete(&domain.CartItem{}).Error; err != nil {
		return fmt.Errorf("failed to remove cart item: %w", err)
	}
	return nil
}

func (r *cartRepository) ClearCart(cartID uint) error {
	if err := r.db.Where("cart_id = ?", cartID).
		Delete(&domain.CartItem{}).Error; err != nil {
		return fmt.Errorf("failed to clear cart: %w", err)
	}
	return nil
}