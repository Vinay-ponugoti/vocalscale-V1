package middleware

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter implements production-ready rate limiting
type RateLimiter struct {
	requests    map[string][]time.Time
	mu          sync.RWMutex
	muMap       map[string]*sync.Mutex
	Limit       int
	Window      time.Duration
	stopCleanup chan bool
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		requests:    make(map[string][]time.Time),
		muMap:       make(map[string]*sync.Mutex),
		Limit:       limit,
		Window:      window,
		stopCleanup: make(chan bool),
	}

	go rl.cleanupOldIPs()

	return rl
}

// Stop shuts down the cleanup routine gracefully
func (rl *RateLimiter) Stop() {
	close(rl.stopCleanup)
}

// cleanupOldIPs removes IPs that haven't made requests recently
func (rl *RateLimiter) cleanupOldIPs() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			rl.mu.Lock()
			now := time.Now()
			cutoff := now.Add(-rl.Window * 2)
			for ip, times := range rl.requests {
				if len(times) > 0 && times[len(times)-1].Before(cutoff) {
					delete(rl.requests, ip)
					delete(rl.muMap, ip)
				}
			}
			rl.mu.Unlock()
		case <-rl.stopCleanup:
			return
		}
	}
}

// getMutex retrieves or creates a mutex for a specific IP (Flaw #2 Fix)
func (rl *RateLimiter) getMutex(key string) *sync.Mutex {
	rl.mu.RLock()
	mu, exists := rl.muMap[key]
	rl.mu.RUnlock()

	if !exists {
		rl.mu.Lock()
		// Double-check pattern
		mu, exists = rl.muMap[key]
		if !exists {
			mu = &sync.Mutex{}
			rl.muMap[key] = mu
		}
		rl.mu.Unlock()
	}
	return mu
}

// Allow checks if request is allowed
func (rl *RateLimiter) Allow(key string) bool {
	ipMu := rl.getMutex(key)
	ipMu.Lock()
	defer ipMu.Unlock()

	now := time.Now()
	cutoff := now.Add(-rl.Window)

	validRequests := []time.Time{}
	for _, t := range rl.requests[key] {
		if t.After(cutoff) {
			validRequests = append(validRequests, t)
		}
	}

	if len(validRequests) >= rl.Limit {
		rl.requests[key] = validRequests
		return false
	}

	validRequests = append(validRequests, now)
	rl.requests[key] = validRequests
	return true
}

// SecurityHeaders adds security headers
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

		csp := "default-src 'self'; " +
			"script-src 'self' 'nonce-{nonce}' https://js.stripe.com; " +
			"style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; " +
			"img-src 'self' data: https:; " +
			"connect-src 'self' https://api.stripe.com; " +
			"frame-src 'self' https://js.stripe.com; " +
			"object-src 'none'; " +
			"base-uri 'self'; " +
			"form-action 'self';"

		c.Header("Content-Security-Policy", csp)

		c.Next()
	}
}

// RateLimitMiddleware creates rate limiting middleware from existing RateLimiter
func RateLimitMiddleware(rl *RateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		key := c.ClientIP()

		if !rl.Allow(key) {
			c.JSON(429, gin.H{
				"error":       "Too many requests",
				"retry_after": rl.Window.Seconds(),
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RateLimit creates rate limiting middleware (deprecated, use RateLimitMiddleware)
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	rl := NewRateLimiter(limit, window)

	return func(c *gin.Context) {
		if c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		key := c.ClientIP()

		if !rl.Allow(key) {
			c.JSON(429, gin.H{
				"error":       "Too many requests",
				"retry_after": rl.Window.Seconds(),
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
