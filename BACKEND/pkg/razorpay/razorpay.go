package razorpay

import (
	"crypto/hmac" // Implements HMAC (Hash-based Message Authentication Code), used to verify both the integrity and authenticity of a message using a secret key.
	"crypto/sha256" // Provides the SHA-256 hashing algorithm, a secure one-way hash function that produces a 256-bit (32-byte) digest
	"encoding/hex" // Used to encode/decode data to/from hexadecimal string representation (e.g., converting raw bytes []byte → "a3f1b2...").
	"fmt"

	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/config"
	rzp "github.com/razorpay/razorpay-go"
)

type RazorpayClient struct{
	client *rzp.Client
	keyID string
	keySecret string
}

// NewRazorpayClient creates a new Razorpay client
func NewRazorpayClient(cfg *config.RazorpayConfig) *RazorpayClient {
	client := rzp.NewClient(cfg.KeyID, cfg.KeySecret)
	return &RazorpayClient{
		client:    client,
		keyID:     cfg.KeyID,
		keySecret: cfg.KeySecret,
	}
}

// CreateOrder creates a new Razorpay order
func (r *RazorpayClient) CreateOrder(amount float64, orderID uint) (string, error){
	// razorpay amount is in paise (1 rupee = 100 paise)
	amountInPaise := int(amount * 100)

	data := map[string]interface{}{
		"amount":   amountInPaise,
		"currency": "INR",
		"receipt":  fmt.Sprintf("order_%d", orderID),
		"notes": map[string]interface{}{
			"order_id": orderID,
		},
	}

	body, err := r.client.Order.Create(data, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create razorpay order: %w", err)
	}

	// extract razorpay order id
	razorpayOrderID, ok := body["id"].(string)
	if !ok {
		return "", fmt.Errorf("invalid razorpay response")
	}

	return razorpayOrderID, nil
}

// VerifyPayment verifies razorpay payment signature
func (r *RazorpayClient) VerifyPayment(razorpayOrderID, razorpayPaymentID, razorpaySignature string) bool {
	// signature = HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
	data := razorpayOrderID + "|" + razorpayPaymentID

	h := hmac.New(sha256.New, []byte(r.keySecret))
	h.Write([]byte(data))
	expectedSignature := hex.EncodeToString(h.Sum(nil))

	return hmac.Equal([]byte(expectedSignature), []byte(razorpaySignature))
}

// GetKeyID returns the razorpay key id for frontend
func (r *RazorpayClient) GetKeyID() string {
	return r.keyID
}
