package errors

import "fmt"

// AUTH
func InvalidCredentials(err error) *AppError {
	return Unauthorized("invalid credentials", err)
}

func AccountNotVerified() *AppError {
	return Forbidden("account not verified, please verify your email", nil)
}

func AccountBlocked() *AppError {
	return Forbidden("account has been blocked, contact support", nil)
}

func TokenExpired() *AppError {
	return Unauthorized("token expired, please login again", nil)
}

func TokenInvalid() *AppError {
	return Unauthorized("invalid token", nil)
}

func SessionExpired() *AppError {
	return Unauthorized("session expired, please login again", nil)
}

func EmailAlreadyExists(err error) *AppError {
	return Conflict("email already registered", err)
}

func OTPExpired() *AppError {
	return BadRequest("otp expired, please try again", nil)
}

func OTPInvalid() *AppError {
	return BadRequest("invalid otp", nil)
}

func NoOTPFound() *AppError {
	return BadRequest("no pending signup found, please signup again", nil)
}

// USER
func UserNotFound(err error) *AppError {
	return NotFound("user not found", err)
}

func UnauthorizedAccess() *AppError {
	return Forbidden("unauthorized", nil)
}

func CannotBlockSelf() *AppError {
	return BadRequest("you cannot block yourself", nil)
}

func CannotDeleteSelf() *AppError {
	return BadRequest("you cannot delete yourself", nil)
}

func UserAlreadyBlocked() *AppError {
	return BadRequest("user is already blocked", nil)
}

func UserNotBlocked() *AppError {
	return BadRequest("user is not blocked", nil)
}

func CannotBlockAdmin() *AppError {
	return BadRequest("cannot block an admin account", nil)
}

func CannotDeleteAdmin() *AppError {
	return BadRequest("cannot delete an admin account", nil)
}

// PRODUCT
func ProductNotFound(err error) *AppError {
	return NotFound("product not found", err)
}

func ProductNotAvailable() *AppError {
	return BadRequest("product is not available", nil)
}

func InsufficientStock() *AppError {
	return BadRequest("insufficient stock", nil)
}

// CART
func CartEmpty() *AppError {
	return BadRequest("cart is empty, please add items first", nil)
}

func ProductNotInCart() *AppError {
	return BadRequest("product not in cart", nil)
}

// wishlist
func ProductInWishlist() *AppError {
	return Conflict("product already in wishlist", nil)
}

func ProductNotInWishlist() *AppError {
	return BadRequest("product not in wishlist", nil)
}

// address
func AddressNotFound(err error) *AppError {
	return NotFound("address not found", err)
}

// order
func OrderNotFound(err error) *AppError {
	return NotFound("order not found", err)
}

func OrderCannotBeCancelled() *AppError {
	return BadRequest("order cannot be cancelled at this stage", nil)
}

func InvalidPaymentMethod() *AppError {
	return BadRequest("invalid payment method", nil)
}

func InvalidPaymentSignature() *AppError {
	return BadRequest("invalid payment signature", nil)
}

func InvalidStatusTransition(from, to string) *AppError {
	return BadRequest(
		fmt.Sprintf("invalid status transition from '%s' to '%s'", from, to),
		nil,
	)
}
