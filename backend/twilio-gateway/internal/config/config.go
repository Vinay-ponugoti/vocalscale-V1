package config

import (
	"os"
)

type Config struct {
	Port               string
	RedisURL           string
	DeepgramAPIKey     string
	PythonAPIURL       string
	SupabaseURL        string
	SupabaseKey        string
	SupabaseServiceKey string
	TogetherAPIKey     string
	OpenAIAPIKey       string
	Environment        string
	TwilioAuthToken    string
	BaseURL            string
	Version            string
}

func LoadConfig() *Config {
	return &Config{
		Port:               getEnv("PORT", "8081"),
		RedisURL:           getEnv("REDIS_URL", "localhost:6379"),
		DeepgramAPIKey:     getEnv("DEEPGRAM_API_KEY", ""),
		PythonAPIURL:       getEnv("PYTHON_API_URL", "http://localhost:8000"),
		SupabaseURL:        getEnv("SUPABASE_URL", ""),
		SupabaseKey:        getEnv("SUPABASE_KEY", ""),
		SupabaseServiceKey: getEnv("SUPABASE_SERVICE_KEY", ""),
		TogetherAPIKey:     getEnv("TOGETHER_API_KEY", ""),
		OpenAIAPIKey:       getEnv("OPENAI_API_KEY", ""),
		Environment:        getEnv("ENVIRONMENT", "development"),
		TwilioAuthToken:    getEnv("TWILIO_AUTH_TOKEN", ""),
		BaseURL:            getEnv("BASE_URL", ""),
		Version:            getEnv("VERSION", "1.0.0"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
