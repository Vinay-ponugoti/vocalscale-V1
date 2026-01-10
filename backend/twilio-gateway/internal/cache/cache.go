package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"twilio-gateway/internal/business"
)

const (
	BusinessContextCacheTTL = 5 * time.Minute
	CacheKeyPrefix          = "biz_context:"
)

type CacheService struct {
	Redis *redis.Client
}

func NewCacheService(rdb *redis.Client) *CacheService {
	return &CacheService{Redis: rdb}
}

// GetBusinessContextCached retrieves cached business context or fetches fresh
func (cs *CacheService) GetBusinessContextCached(ctx context.Context, userID string, bizService *business.BusinessService) (*business.BusinessContext, error) {
	cacheKey := fmt.Sprintf("%s%s", CacheKeyPrefix, userID)

	// Try cache first
	cachedData, err := cs.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var cachedCtx business.BusinessContext
		if err := json.Unmarshal([]byte(cachedData), &cachedCtx); err == nil {
			log.Printf("✅ [%s] Using cached business context", userID)
			return &cachedCtx, nil
		}
	}

	// Cache miss - fetch fresh data
	log.Printf("🔄 [%s] Cache miss, fetching fresh business context", userID)
	bizCtx, err := bizService.GetBusinessContext(userID)
	if err != nil {
		return nil, err
	}

	// Store in cache for next time
	if data, err := json.Marshal(bizCtx); err == nil {
		cs.Redis.Set(ctx, cacheKey, data, BusinessContextCacheTTL)
	}

	return bizCtx, nil
}

// InvalidateBusinessContext clears cache for a user
func (cs *CacheService) InvalidateBusinessContext(ctx context.Context, userID string) error {
	cacheKey := fmt.Sprintf("%s%s", CacheKeyPrefix, userID)
	return cs.Redis.Del(ctx, cacheKey).Err()
}
