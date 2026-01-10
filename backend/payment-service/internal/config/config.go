package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	StripeAPIKey        string
	StripeWebhookSecret string
	SupabaseURL         string
	SupabaseKey         string
	StripeSuccessURL    string
	StripeCancelURL     string
	SupabaseJWTSecret   string
	Port                string
}

func LoadConfig() *Config {
	godotenv.Load() // Ignore error if .env doesn't exist

	return &Config{
		StripeAPIKey:        os.Getenv("STRIPE_API_KEY"),
		StripeWebhookSecret: os.Getenv("STRIPE_WEBHOOK_SECRET"),
		SupabaseURL:         os.Getenv("SUPABASE_URL"),
		SupabaseKey:         os.Getenv("SUPABASE_SERVICE_ROLE_KEY"), // Use service role key for backend
		StripeSuccessURL:    os.Getenv("STRIPE_SUCCESS_URL"),
		StripeCancelURL:     os.Getenv("STRIPE_CANCEL_URL"),
		SupabaseJWTSecret:   os.Getenv("SUPABASE_JWT_SECRET"),
		Port:                getEnv("PORT", "8082"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
