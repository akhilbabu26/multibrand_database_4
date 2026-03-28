package repository

import (
	"time"

	domain    "github.com/akhilbabu26/multibrand_database_4/internal/models/wishlist"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
	"gorm.io/gorm"
)

type wishlistRepository struct {
	db *gorm.DB
}

func NewWishlistRepository(db *gorm.DB) domain.WishlistRepository {
	return &wishlistRepository{db: db}
}

func (r *wishlistRepository) Add(userID, productID uint) error {
	wishlist := &domain.Wishlist{
		UserID:    userID,
		ProductID: productID,
	}
	if err := r.db.Create(wishlist).Error; err != nil {
		return apperrors.Internal("failed to add to wishlist", err)
	}
	return nil
}

func (r *wishlistRepository) Remove(userID, productID uint) error {
	if err := r.db.Where("user_id = ? AND product_id = ?", userID, productID).
		Delete(&domain.Wishlist{}).Error; err != nil {
		return apperrors.Internal("failed to remove from wishlist", err)
	}
	return nil
}

func (r *wishlistRepository) GetByUserID(userID uint) ([]*domain.Wishlist, error) {
	var wishlist []*domain.Wishlist
	if err := r.db.Where("user_id = ?", userID).
		Find(&wishlist).Error; err != nil {
		return nil, apperrors.Internal("failed to get wishlist", err)
	}
	return wishlist, nil
}

func (r *wishlistRepository) IsInWishlist(userID, productID uint) bool {
	var count int64
	r.db.Model(&domain.Wishlist{}).
		Where("user_id = ? AND product_id = ?", userID, productID).
		Count(&count)
	return count > 0
}

func (r *wishlistRepository) DeleteByProductID(userID, productID uint) error {
	if err := r.db.Where("user_id = ? AND product_id = ?", userID, productID).
		Delete(&domain.Wishlist{}).Error; err != nil {
		return apperrors.Internal("failed to delete wishlist item", err)
	}
	return nil
}

// ✅ N+1 Fix — single JOIN query
func (r *wishlistRepository) GetWishlistWithProducts(userID uint) ([]*domain.WishlistResponse, error) {
	type Result struct {
		WishlistID uint
		ProductID  uint
		Name       string
		SalePrice  float64
		ImageURL   string
		CreatedAt  time.Time
	}

	var results []Result

	err := r.db.Raw(`
		SELECT
			w.id AS wishlist_id,
			w.product_id,
			w.created_at,
			p.name,
			p.sale_price,
			p.image_url
		FROM wishlists w
		JOIN products p ON p.id = w.product_id
		WHERE w.user_id  = ?
		AND   p.is_active = true
		ORDER BY w.created_at DESC
	`, userID).Scan(&results).Error

	if err != nil {
		return nil, apperrors.Internal("failed to get wishlist", err)
	}

	var response []*domain.WishlistResponse
	for _, r := range results {
		response = append(response, &domain.WishlistResponse{
			ID:        r.WishlistID,
			ProductID: r.ProductID,
			Product: &domain.ProductInWishlist{
				ID:        r.ProductID,
				Name:      r.Name,
				SalePrice: r.SalePrice,
				ImageURL:  r.ImageURL,
			},
			CreatedAt: r.CreatedAt,
		})
	}

	return response, nil
}