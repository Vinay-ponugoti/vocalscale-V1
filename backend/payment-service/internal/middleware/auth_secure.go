package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// User represents authenticated user data
type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// AuthConfig holds authentication configuration
type AuthConfig struct {
	SupabaseURL string
	SupabaseKey string
}

// SupabaseAuthMiddleware validates tokens using Supabase Auth API
func SupabaseAuthMiddleware(config AuthConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		token := parts[1]
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Empty token"})
			c.Abort()
			return
		}

		// Validate token with Supabase Auth API
		user, err := validateTokenWithSupabase(token, config)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Store user info in context
		c.Set("user_id", user.ID)
		c.Set("user_email", user.Email)

		c.Next()
	}
}

// validateTokenWithSupabase calls Supabase Auth API to validate token
func validateTokenWithSupabase(token string, config AuthConfig) (*User, error) {
	url := fmt.Sprintf("%s/auth/v1/user", config.SupabaseURL)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("apikey", config.SupabaseKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to validate token: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("token validation failed with status: %d", resp.StatusCode)
	}

	var userData map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&userData); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Extract user ID and email from response
	user := &User{}
	if id, ok := userData["id"].(string); ok {
		user.ID = id
	}
	if email, ok := userData["email"].(string); ok {
		user.Email = email
	}

	if user.ID == "" {
		return nil, fmt.Errorf("invalid user data from Supabase")
	}

	return user, nil
}
