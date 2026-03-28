package domain

// contract to repo
type CartRepository interface{
	GetOrCreateCart(userID uint) (*Cart, error)
	GetCartWithItems(userID uint) (*Cart, error)
	GetCartWithProducts(userID uint) (*CartResponse, error)
	GetCartItem(cartID, productID uint) (*CartItem, error)
	AddCartItem(cartID, productID uint, quantity int) error
	UpdateCartItem(cartID, productID uint, quantity int) error
	RemoveCartItem(cartID, productID uint) error
	ClearCart(cartID uint) error
}

// contract to usecase
type CartUsecase interface{
	AddToCart(userID, productID uint, quantity int) error
	RemoveFromCart(userID, productID uint) error
	UpdateQuantity(userID, productID uint, quantity int) error
	GetCart(userID uint) (*CartResponse, error)
	ClearCart(userID uint) error
	AddToCartDirect(userID, productID uint) error
}
