package postgres

import (
	"errors"
	"time"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	"github.com/akhilbabu26/multibrand_database_4/internal/repository/generic"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"gorm.io/gorm"
)

type cartRepository struct {
	generic.Repository[entities.Cart]
}

func NewCartRepository(db *gorm.DB) contracts.CartRepository {
	return &cartRepository{
		Repository: generic.NewGenericRepository[entities.Cart](db),
	}
}

func (r *cartRepository) WithTx(tx *gorm.DB) contracts.CartRepository {
	return &cartRepository{
		Repository: generic.NewGenericRepository[entities.Cart](tx),
	}
}

func (r *cartRepository) GetOrCreateCart(userID uint) (*entities.Cart, error) {
	var cart entities.Cart
	err := r.DB().Where("user_id = ?", userID).First(&cart).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			cart = entities.Cart{UserID: userID}
			if err := r.DB().Create(&cart).Error; err != nil {
				return nil, apperrors.Internal("failed to create cart", err)
			}
			return &cart, nil
		}
		return nil, apperrors.Internal("failed to get cart", err)
	}
	return &cart, nil
}

func (r *cartRepository) GetCartWithItems(userID uint) (*entities.Cart, error) {
	var cart entities.Cart
	if err := r.DB().Where("user_id = ?", userID).
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
func (r *cartRepository) GetCartWithProducts(userID uint) (*dto.CartResponse, error) {
	type Result struct {
		CartID    uint
		UserID    uint
		ItemID    uint
		ProductID uint
		Quantity  int
		Name      string
		Brand     string
		Size      string
		ImageURL  string
		SalePrice float64
	}

	var results []Result

	err := r.DB().Raw(`
		SELECT
			c.id       AS cart_id,
			c.user_id  AS user_id,
			ci.id      AS item_id,
			ci.product_id,
			ci.quantity,
			p.name,
			p.brand,
			p.size,
			COALESCE(
				(SELECT pi.image_url FROM product_images pi
				 WHERE pi.product_id = p.id
				 ORDER BY pi.is_primary DESC, pi.id ASC
				 LIMIT 1),
				''
			) AS image_url,
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
		var cart entities.Cart
		if err := r.DB().Where("user_id = ?", userID).First(&cart).Error; err != nil {
			// No cart exists yet, return empty response
			return &dto.CartResponse{
				ID:         0,
				UserID:     userID,
				Items:      []dto.CartItemResponse{},
				TotalItems: 0,
				TotalPrice: 0,
			}, nil
		}
		// Cart exists but empty
		return &dto.CartResponse{
			ID:         cart.ID,
			UserID:     userID,
			Items:      []dto.CartItemResponse{},
			TotalItems: 0,
			TotalPrice: 0,
		}, nil
	}

	var items []dto.CartItemResponse
	var totalPrice float64
	totalItems := 0

	for _, r := range results {
		subtotal := r.SalePrice * float64(r.Quantity)
		totalPrice += subtotal
		totalItems += r.Quantity

		items = append(items, dto.CartItemResponse{
			ID:        r.ItemID,
			ProductID: r.ProductID,
			Name:      r.Name,
			Brand:     r.Brand,
			Size:      r.Size,
			ImageURL:  r.ImageURL,
			SalePrice: r.SalePrice,
			Quantity:  r.Quantity,
			Subtotal:  subtotal,
		})
	}

	return &dto.CartResponse{
		ID:         results[0].CartID,
		UserID:     userID,
		Items:      items,
		TotalItems: totalItems,
		TotalPrice: totalPrice,
	}, nil
}

func (r *cartRepository) GetCartItem(cartID, productID uint) (*entities.CartItem, error) {
	var item entities.CartItem
	if err := r.DB().Where("cart_id = ? AND product_id = ?", cartID, productID).
		First(&item).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, apperrors.Internal("failed to get cart item", err)
	}
	return &item, nil
}

func (r *cartRepository) AddCartItem(cartID, productID uint, quantity int) error {
	item := &entities.CartItem{
		CartID:    cartID,
		ProductID: productID,
		Quantity:  quantity,
	}
	if err := r.DB().Create(item).Error; err != nil {
		return apperrors.Internal("failed to add cart item", err)
	}
	return nil
}

func (r *cartRepository) UpdateCartItem(cartID, productID uint, quantity int) error {
	if err := r.DB().Model(&entities.CartItem{}).
		Where("cart_id = ? AND product_id = ?", cartID, productID).
		Update("quantity", quantity).Error; err != nil {
		return apperrors.Internal("failed to update cart item", err)
	}
	return nil
}

func (r *cartRepository) RemoveCartItem(cartID, productID uint) error {
	if err := r.DB().Where("cart_id = ? AND product_id = ?", cartID, productID).
		Delete(&entities.CartItem{}).Error; err != nil {
		return apperrors.Internal("failed to remove cart item", err)
	}
	return nil
}

func (r *cartRepository) IsInCart(userID, productID uint) bool {
	var count int64
	r.DB().Model(&entities.CartItem{}).
		Joins("JOIN carts ON carts.id = cart_items.cart_id").
		Where("carts.user_id = ? AND cart_items.product_id = ?", userID, productID).
		Count(&count)
	return count > 0
}

func (r *cartRepository) ClearCart(cartID uint) error {
	if err := r.DB().Where("cart_id = ?", cartID).
		Delete(&entities.CartItem{}).Error; err != nil {
		return apperrors.Internal("failed to clear cart", err)
	}
	return nil
}

// unused — kept for compatibility
var _ = time.Now
