package validator

import (
	"fmt"
	"reflect"
	"strings"
	"unicode"

	"github.com/go-playground/validator/v10"
)

// ─────────────────────────────────────────
// ERROR TYPES
// ─────────────────────────────────────────

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type ValidationErrors struct {
	Errors []ValidationError `json:"errors"`
}

func (v *ValidationErrors) Add(field, message string) {
	v.Errors = append(v.Errors, ValidationError{Field: field, Message: message})
}

func (v *ValidationErrors) Error() string {
	return "validation failed"
}

// ─────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────

var validate *validator.Validate

func init() {
	validate = validator.New()

	// use json tag names in error messages
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" || name == "" {
			return fld.Name
		}
		return name
	})

	// custom validators
	validate.RegisterValidation("indian_phone", validateIndianPhone)
	validate.RegisterValidation("pincode", validatePinCode)
	validate.RegisterValidation("payment_method", validatePaymentMethod)
	validate.RegisterValidation("order_status", validateOrderStatus)
	validate.RegisterValidation("shoe_size", validateShoeSize)
	validate.RegisterValidation("gender", validateGender)
}

func ValidateStruct(s any) error {
	return validate.Struct(s)
}

// ─────────────────────────────────────────
// ERROR FORMATTER
// ─────────────────────────────────────────

func FormatValidationError(err error) *ValidationErrors {
	ve := &ValidationErrors{}

	for _, e := range err.(validator.ValidationErrors) {
		field := toSnakeCase(e.Field())

		switch e.Tag() {
		case "required":
			ve.Add(field, field+" is required")
		case "email":
			ve.Add(field, "invalid email format")
		case "min":
			ve.Add(field, fmt.Sprintf("minimum length is %s characters", e.Param()))
		case "max":
			ve.Add(field, fmt.Sprintf("maximum length is %s characters", e.Param()))
		case "len":
			ve.Add(field, fmt.Sprintf("must be exactly %s characters", e.Param()))
		case "gt":
			ve.Add(field, fmt.Sprintf("must be greater than %s", e.Param()))
		case "gte":
			ve.Add(field, fmt.Sprintf("must be at least %s", e.Param()))
		case "numeric":
			ve.Add(field, "must contain only numbers")
		case "eqfield":
			ve.Add(field, "does not match "+toSnakeCase(e.Param()))
		case "indian_phone":
			ve.Add(field, "must be a valid 10-digit Indian phone number")
		case "pincode":
			ve.Add(field, "must be a valid 6-digit pin code")
		case "payment_method":
			ve.Add(field, "must be 'cod' or 'razorpay'")
		case "order_status":
			ve.Add(field, "must be one of: pending, confirmed, shipped, delivered, cancelled")
		case "shoe_size":
			ve.Add(field, "must be a valid shoe size: 38-46")
		case "gender":
			ve.Add(field, "must be one of: men, women, unisex, kids")
		case "omitempty":
			// skip — field is optional
		default:
			ve.Add(field, fmt.Sprintf("invalid value for %s", field))
		}
	}

	return ve
}

// ─────────────────────────────────────────
// CUSTOM VALIDATORS
// ─────────────────────────────────────────

func validateIndianPhone(fl validator.FieldLevel) bool {
	phone := fl.Field().String()
	if len(phone) != 10 {
		return false
	}
	return phone[0] >= '6' && phone[0] <= '9'
}

func validatePinCode(fl validator.FieldLevel) bool {
	pin := fl.Field().String()
	if len(pin) != 6 {
		return false
	}
	for _, c := range pin {
		if c < '0' || c > '9' {
			return false
		}
	}
	return true
}

func validatePaymentMethod(fl validator.FieldLevel) bool {
	val := fl.Field().String()
	return val == "cod" || val == "razorpay"
}

func validateOrderStatus(fl validator.FieldLevel) bool {
	val := fl.Field().String()
	switch val {
	case "pending", "confirmed", "shipped", "delivered", "cancelled":
		return true
	}
	return false
}

func validateShoeSize(fl validator.FieldLevel) bool {
	val := fl.Field().String()
	switch val {
	case "38", "39", "40", "41", "42", "43", "44", "45", "46":
		return true
	}
	return false
}

func validateGender(fl validator.FieldLevel) bool {
	val := fl.Field().String()
	switch val {
	case "men", "women", "unisex", "kids":
		return true
	}
	return false
}

// ─────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────

func toSnakeCase(s string) string {
	var out []rune
	for i, r := range s {
		if i > 0 && unicode.IsUpper(r) {
			out = append(out, '_')
		}
		out = append(out, unicode.ToLower(r))
	}
	return string(out)
}