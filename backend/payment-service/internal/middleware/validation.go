package middleware

import (
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

// InputValidation provides input sanitization and validation
func InputValidation() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Validate content type for POST/PUT requests
		if c.Request.Method == "POST" || c.Request.Method == "PUT" {
			contentType := c.GetHeader("Content-Type")
			if !strings.Contains(contentType, "application/json") {
				c.JSON(400, gin.H{"error": "Content-Type must be application/json"})
				c.Abort()
				return
			}
		}

		// Sanitize path parameters
		for key, value := range c.Params {
			c.Params[key].Value = sanitizeString(value.Value)
		}

		c.Next()
	}
}

// sanitizeString removes potentially harmful characters
func sanitizeString(input string) string {
	// Remove SQL injection attempts
	sqlPattern := regexp.MustCompile(`(?i)(union|select|insert|update|delete|drop|create|alter|exec|script)`)
	cleaned := sqlPattern.ReplaceAllString(input, "")
	
	// Remove XSS attempts
	xssPattern := regexp.MustCompile(`(<script>|<iframe>|<object>|<embed>|<form>|<input>|<link>|<meta>)`)
	cleaned = xssPattern.ReplaceAllString(cleaned, "")
	
	// Trim whitespace
	cleaned = strings.TrimSpace(cleaned)
	
	return cleaned
}

// ValidateUUID validates UUID format
func ValidateUUID(uuid string) bool {
	uuidPattern := regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)
	return uuidPattern.MatchString(uuid)
}