package redis

import (
	"context"
	"log"
	"strings"
	"time"
	"twilio-gateway/internal/config"

	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	Client *redis.Client
	Ctx    context.Context
}

func NewRedisClient(cfg *config.Config) *RedisClient {
	var options *redis.Options
	var err error

	if strings.HasPrefix(cfg.RedisURL, "redis://") || strings.HasPrefix(cfg.RedisURL, "rediss://") {
		options, err = redis.ParseURL(cfg.RedisURL)
		if err != nil {
			log.Printf("❌ Failed to parse Redis URL: %v", err)
			// Fallback to basic options
			options = &redis.Options{
				Addr: "localhost:6379",
			}
		}
	} else {
		options = &redis.Options{
			Addr: cfg.RedisURL,
		}
	}

	rdb := redis.NewClient(options)

	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("⚠️ Redis connection failed: %v", err)
	}

	return &RedisClient{
		Client: rdb,
		Ctx:    ctx,
	}
}

func (r *RedisClient) Ping(ctx context.Context) *redis.StatusCmd {
	return r.Client.Ping(ctx)
}

func (r *RedisClient) Get(key string) (string, error) {
	return r.Client.Get(r.Ctx, key).Result()
}

func (r *RedisClient) Set(key string, value interface{}, expiration interface{}) error {
	var exp time.Duration
	switch v := expiration.(type) {
	case time.Duration:
		exp = v
	case int:
		exp = time.Duration(v) * time.Second
	default:
		exp = 0
	}
	return r.Client.Set(r.Ctx, key, value, exp).Err()
}

func (r *RedisClient) Publish(channel, message string) {
	err := r.Client.Publish(r.Ctx, channel, message).Err()
	if err != nil {
		log.Printf("❌ Redis publish failed: %v", err)
	}
}

func (r *RedisClient) Subscribe(channel string) *redis.PubSub {
	return r.Client.Subscribe(r.Ctx, channel)
}

func (r *RedisClient) LPush(key string, values ...interface{}) error {
	return r.Client.LPush(r.Ctx, key, values...).Err()
}

func (r *RedisClient) LRange(key string, start, stop int64) ([]string, error) {
	return r.Client.LRange(r.Ctx, key, start, stop).Result()
}

func (r *RedisClient) LTrim(key string, start, stop int64) error {
	return r.Client.LTrim(r.Ctx, key, start, stop).Err()
}
