package domain

type WishlistRepository interface {
	Add(userID, productID uint) error
	Remove(userID, productID uint) error
	GetByUserID(userID uint) ([]*Wishlist, error)
	IsInWishlist(userID, productID uint) bool
	DeleteByProductID(userID, productID uint) error // used by MoveToCart
}

type WishlistUsecase interface{
	AddToWishlist(userID, productID uint) error
	RemoveFromWishlist(userID, productID uint) error
	GetWishlist(userID uint) ([]*WishlistResponse, error)
	MoveToCart(userID, productID uint) error
}