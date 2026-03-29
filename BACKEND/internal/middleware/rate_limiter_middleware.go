package middleware

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/ulule/limiter/v3"
	sredis "github.com/ulule/limiter/v3/drivers/store/redis"
)

// RateLimiter blocks IPs that exceed the provided threshold String (e.g. "5-M")
func RateLimiter(redisClient *redis.Client, rate string) gin.HandlerFunc {
	// Parse limit (e.g. "5-M" = 5 req / minute)
	rateLimit, err := limiter.NewRateFromFormatted(rate)
	if err != nil {
		log.Fatalf("failed to parse rate limit: %v", err)
	}

	store, err := sredis.NewStoreWithOptions(redisClient, limiter.StoreOptions{
		Prefix: "rate_limit_router:",
	})
	if err != nil {
		log.Fatalf("failed to create redis rate limit store: %v", err)
	}

	instance := limiter.New(store, rateLimit)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		if ip == "" {
			ip = "unknown"
		}

		limitContext, err := instance.Get(c, ip)
		if err != nil {
			log.Printf("rate limiter fallback error: %v", err)
			c.Next()
			return
		}

		c.Header("X-RateLimit-Limit", strconv.FormatInt(limitContext.Limit, 10))
		c.Header("X-RateLimit-Remaining", strconv.FormatInt(limitContext.Remaining, 10))
		c.Header("X-RateLimit-Reset", strconv.FormatInt(limitContext.Reset, 10))

		if limitContext.Reached {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": "Too many requests. Please calm down and try again later.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
