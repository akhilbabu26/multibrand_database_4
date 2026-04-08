package errors

import "github.com/akhilbabu26/multibrand_database_4/pkg/constant"

// AppError is the central error type
type AppError struct {
	Code      int    `json:"-"` // HTTP status code
	Message   string `json:"message"`
	ErrorCode string `json:"code"` // machine-readable code
	Details   any    `json:"details,omitempty"`
	Err       error  `json:"-"` // internal error (not exposed)
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return e.Err.Error()
	}
	return e.Message
}

// GENERIC CONSTRUCTOR
func New(code int, errorCode, message string, err error) *AppError {
	return &AppError{
		Code:      code,
		Message:   message,
		ErrorCode: errorCode,
		Err:       err,
	}
}

// COMMON ERROR BUILDERS
func BadRequest(message string, err error) *AppError {
	return New(constant.BADREQUEST, "BAD_REQUEST", message, err)
}

func Unauthorized(message string, err error) *AppError {
	return New(constant.UNAUTHORIZED, "UNAUTHORIZED", message, err)
}

func Forbidden(message string, err error) *AppError {
	return New(constant.NOTFOUND, "FORBIDDEN", message, err)
}

func NotFound(message string, err error) *AppError {
	return New(constant.NOTFOUND, "NOT_FOUND", message, err)
}

func Conflict(message string, err error) *AppError {
	return New(constant.CONFLICT, "CONFLICT", message, err)
}

func Internal(message string, err error) *AppError {
	return New(constant.INTERNALSERVERERROR, "INTERNAL_ERROR", message, err)
}

// VALIDATION ERROR
func ValidationFailed(details any) *AppError {
	return &AppError{
		Code:      constant.BADREQUEST,
		Message:   "validation failed",
		ErrorCode: "VALIDATION_ERROR",
		Details:   details,
	}
}
