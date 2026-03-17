package repository

import(
	"fmt"

	domain "github.com/akhilbabu26/multibrand_database_4/internal/domain/wishlist"

	"gorm.io/gorm"
)

type wishlistRepository struct{
	db *gorm.DB
}

func NewWishlistRepository(db *gorm.DB) domain.WishlistRepository{
	return &wishlistRepository{db: db}
}

func (r *wishlistRepository) Add(userID, productID uint) error{
	wishlist := &domain.Wishlist{
		UserID: userID,	
		ProductID: productID,
	}

	if err := r.db.Create(wishlist).Error; err != nil{
		return fmt.Errorf("Faild to add to wishllist: %w", err)
	}

	return nil
}

func (r *wishlistRepository) Remove(userID, productID uint) error {
	if err := r.db.Where("user_id = ? AND product_id = ?", userID, productID).
		Delete(&domain.Wishlist{}).Error; err != nil {
		return fmt.Errorf("failed to remove from wishlist: %w", err)
	}
	return nil
}

func (r *wishlistRepository) GetByUserID(userID uint) ([]*domain.Wishlist, error){
	var wishlist []*domain.Wishlist
	if err := r.db.Where("user_id = ?", userID).
		Find(&wishlist).Error; err != nil{
			return nil, fmt.Errorf("failed to get wishlist: %w", err)
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
		return fmt.Errorf("failed to delete wishlist item: %w", err)
	}
	return nil
}