package constant

import (
	"encoding/json"
	"errors"
	"strings"
)

var (
	//HTTP status codes
	SUCCESS             = 200
	CREATED             = 201
	BADREQUEST          = 400
	UNAUTHORIZED        = 401
	FORBIDDEN           = 403
	NOTFOUND            = 404
	CONFLICT            = 409
	INTERNALSERVERERROR = 500
)

type OrderStatus string
type PaymentMethod string
type PaymentStatus string

// UnmarshalJSON validates and normalizes payment methods strictly during payload binding
func (p *PaymentMethod) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}

	s = strings.ToLower(s)
	if s != string(PaymentMethodsCOD) && s != string(PaymentMethodRazorpay) {
		return errors.New("invalid payment method, must be cod or razorpay")
	}

	*p = PaymentMethod(s)
	return nil
}

const (
	OrderStatusPending   OrderStatus = "pending"
	OrderStatusConfirmed OrderStatus = "confirmed"
	OrderStatusShipped   OrderStatus = "shipped"
	OrderStatusDelivered OrderStatus = "delivered"
	OrderStatusCancelled OrderStatus = "cancelled"

	PaymentMethodsCOD     PaymentMethod = "cod"
	PaymentMethodRazorpay PaymentMethod = "razorpay"

	PaymentStatusPending  PaymentStatus = "pending"
	PaymentStatusPaid     PaymentStatus = "paid"
	PaymentStatusFailed   PaymentStatus = "failed"
	PaymentStatusRefunded PaymentStatus = "refunded"
)

var ValidStatusTransitions = map[OrderStatus][]OrderStatus{
	OrderStatusPending:   {OrderStatusConfirmed, OrderStatusCancelled},
	OrderStatusConfirmed: {OrderStatusShipped, OrderStatusCancelled},
	OrderStatusShipped:   {OrderStatusDelivered},
	OrderStatusDelivered: {},
	OrderStatusCancelled: {},
}

func IsValidTransition(current, next OrderStatus) bool {
	allowed, exists := ValidStatusTransitions[current]
	if !exists {
		return false
	}
	for _, s := range allowed {
		if s == next {
			return true
		}
	}
	return false
}
