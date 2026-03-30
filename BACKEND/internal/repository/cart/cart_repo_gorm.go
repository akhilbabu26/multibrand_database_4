package repository

import (
	"errors"
	"time"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/models/cart"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"gorm.io/gorm"
)

type cartRepository struct {
	db *gorm.DB
}

func NewCartRepository(db *gorm.DB) domain.CartRepository {
	return &cartRepository{db: db}
}

func (r *cartRepository) WithTx(tx *gorm.DB) domain.CartRepository {
	return &cartRepository{db: tx}
}

func (r *cartRepository) GetOrCreateCart(userID uint) (*domain.Cart, error) {
	var cart domain.Cart
	err := r.db.Where("user_id = ?", userID).First(&cart).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			cart = domain.Cart{UserID: userID}
			if err := r.db.Create(&cart).Error; err != nil {
				return nil, apperrors.Internal("failed to create cart", err)
			}
			return &cart, nil
		}
		return nil, apperrors.Internal("failed to get cart", err)
	}
	return &cart, nil
}

func (r *cartRepository) GetCartWithItems(userID uint) (*domain.Cart, error) {
	var cart domain.Cart
	if err := r.db.Where("user_id = ?", userID).
		Preload("Items").
		First(&cart).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.CartEmpty()
		}
		return nil, apperrors.Internal("failed to get cart", err)
	}
	return &cart, nil
}

// N+1 Fix — single JOIN query
func (r *cartRepository) GetCartWithProducts(userID uint) (*domain.CartResponse, error) {
	type Result struct {
		CartID    uint
		UserID    uint
		ItemID    uint
		ProductID uint
		Quantity  int
		Name      string
		ImageURL  string
		SalePrice float64
	}

	var results []Result

	err := r.db.Raw(`
		SELECT
			c.id       AS cart_id,
			c.user_id  AS user_id,
			ci.id      AS item_id,
			ci.product_id,
			ci.quantity,
			p.name,
			p.image_url,
			p.sale_price
		FROM carts c
		JOIN cart_items ci ON ci.cart_id = c.id
		JOIN products p  ON p.id = ci.product_id
		WHERE c.user_id  = ?
		AND   p.is_active = true
	`, userID).Scan(&results).Error

	if err != nil {
		return nil, apperrors.Internal("failed to get cart", err)
	}

	if len(results) == 0 {
		// Get cart ID even if it has no items
		var cart domain.Cart
		if err := r.db.Where("user_id = ?", userID).First(&cart).Error; err != nil {
			// No cart exists yet, return empty response
			return &domain.CartResponse{
				ID:         0,
				UserID:     userID,
				Items:      []domain.CartItemResponse{},
				TotalItems: 0,
				TotalPrice: 0,
			}, nil
		}
		// Cart exists but empty
		return &domain.CartResponse{
			ID:         cart.ID,
			UserID:     userID,
			Items:      []domain.CartItemResponse{},
			TotalItems: 0,
			TotalPrice: 0,
		}, nil
	}

	var items []domain.CartItemResponse
	var totalPrice float64
	totalItems := 0

	for _, r := range results {
		subtotal := r.SalePrice * float64(r.Quantity)
		totalPrice += subtotal
		totalItems += r.Quantity

		items = append(items, domain.CartItemResponse{
			ID:        r.ItemID,
			ProductID: r.ProductID,
			Name:      r.Name,
			ImageURL:  r.ImageURL,
			SalePrice: r.SalePrice,
			Quantity:  r.Quantity,
			Subtotal:  subtotal,
		})
	}

	return &domain.CartResponse{
		ID:         results[0].CartID,
		UserID:     userID,
		Items:      items,
		TotalItems: totalItems,
		TotalPrice: totalPrice,
	}, nil
}

func (r *cartRepository) GetCartItem(cartID, productID uint) (*domain.CartItem, error) {
	var item domain.CartItem
	if err := r.db.Where("cart_id = ? AND product_id = ?", cartID, productID).
		First(&item).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, apperrors.Internal("failed to get cart item", err)
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
		return apperrors.Internal("failed to add cart item", err)
	}
	return nil
}

func (r *cartRepository) UpdateCartItem(cartID, productID uint, quantity int) error {
	if err := r.db.Model(&domain.CartItem{}).
		Where("cart_id = ? AND product_id = ?", cartID, productID).
		Update("quantity", quantity).Error; err != nil {
		return apperrors.Internal("failed to update cart item", err)
	}
	return nil
}

func (r *cartRepository) RemoveCartItem(cartID, productID uint) error {
	if err := r.db.Where("cart_id = ? AND product_id = ?", cartID, productID).
		Delete(&domain.CartItem{}).Error; err != nil {
		return apperrors.Internal("failed to remove cart item", err)
	}
	return nil
}

func (r *cartRepository) ClearCart(cartID uint) error {
	if err := r.db.Where("cart_id = ?", cartID).
		Delete(&domain.CartItem{}).Error; err != nil {
		return apperrors.Internal("failed to clear cart", err)
	}
	return nil
}

// unused — kept for compatibility
var _ = time.Now
