package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type TokenStore struct{
	client *redis.Client
}

func NewTokenStore(client *redis.Client) *TokenStore{
	return &TokenStore{client: client}
}

// save in redis
func (t *TokenStore) Save(userID uint, token string, ttl time.Duration) error {
	key := fmt.Sprintf("refresh:%d", userID)

	return t.client.Set(context.Background(), key, token, ttl).Err()
}

//get from redis
func (t *TokenStore) Get(userID uint) (string, error){
	key := fmt.Sprintf("refresh:%d", userID)

	token, err := t.client.Get(context.Background(), key).Result()
	if err == redis.Nil{
		return "", fmt.Errorf("token not fount")
	}
	return token, err
}

// blacklist a token on logout
func (t *TokenStore) BlacklistToken(token string, ttl time.Duration) error{
	key := fmt.Sprintf("blacklist:%s", token)

	return t.client.Set(context.Background(), key, "1", ttl).Err()
}

// check if token is blacklisted
func (t *TokenStore) IsBlacklisted(token string) bool {
    key := fmt.Sprintf("blacklist:%s", token)
    val, err := t.client.Get(context.Background(), key).Result()
    return err == nil && val == "1"
}

// delete from redis
func (t *TokenStore) Delete(userID uint) error {
	key := fmt.Sprintf("refresh:%d", userID)

	return t.client.Del(context.Background(), key).Err()
}

