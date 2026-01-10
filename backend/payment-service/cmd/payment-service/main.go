package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"voice-ai/payment-service/internal/config"
	"voice-ai/payment-service/internal/handlers"
	"voice-ai/payment-service/internal/middleware"
	"voice-ai/payment-service/internal/stripesvc"
	"voice-ai/payment-service/internal/supabase"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	if err := validateConfig(cfg); err != nil {
		log.Fatalf("Configuration validation failed: %v", err)
	}

	stripeClient := stripesvc.NewClient(cfg.StripeAPIKey)
	supabaseClient := supabase.NewClient(cfg.SupabaseURL, cfg.SupabaseKey)
	billingHandler := handlers.NewBillingHandler(cfg, stripeClient, supabaseClient)
	subscriptionHandler := handlers.NewSubscriptionHandler(cfg, stripeClient, supabaseClient, billingHandler)

	r := gin.Default()

	r.Use(middleware.SecurityHeaders())

	rl := middleware.NewRateLimiter(300, time.Minute)
	defer rl.Stop()
	r.Use(middleware.RateLimitMiddleware(rl))

	r.Use(corsMiddleware(cfg))

	// Metrics endpoint
	r.GET("/metrics", metricsHandler)

	billing := r.Group("/billing")
	{
		billing.POST("/webhook", billingHandler.HandleWebhook)

		protected := billing.Group("")
		protected.Use(middleware.SupabaseAuthMiddleware(middleware.AuthConfig{
			SupabaseURL: cfg.SupabaseURL,
			SupabaseKey: cfg.SupabaseKey,
		}))
		{
			protected.GET("/invoices", billingHandler.GetInvoices)
			protected.GET("/payment-method", billingHandler.GetPaymentMethod)
			protected.POST("/checkout", billingHandler.CreateCheckoutSession)
		}
	}

	subscription := r.Group("/subscription")
	{
		subscription.GET("/plans", billingHandler.GetPlans)

		protected := subscription.Group("")
		protected.Use(middleware.SupabaseAuthMiddleware(middleware.AuthConfig{
			SupabaseURL: cfg.SupabaseURL,
			SupabaseKey: cfg.SupabaseKey,
		}))
		{
			protected.GET("/details", subscriptionHandler.GetBillingDetails)
			protected.GET("/status", subscriptionHandler.GetSubscription)
			protected.GET("/usage", subscriptionHandler.GetUsage)
			protected.POST("/sync", subscriptionHandler.Sync)
			protected.POST("/update", subscriptionHandler.UpdateSubscription)
		}
	}

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		log.Printf("Starting payment-service on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to run server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}

// Metrics variables
var (
	metricsMu           sync.Mutex
	totalCheckouts      int64
	totalInvoices       int64
	totalSubscriptions  int64
	activeSubscriptions int64
	failedPayments      int64
	successfulPayments  int64
)

// metricsHandler returns Prometheus-formatted metrics
func metricsHandler(c *gin.Context) {
	metricsMu.Lock()
	defer metricsMu.Unlock()

	metrics := fmt.Sprintf("# HELP payment_service_checkouts_total Total number of checkout sessions created\n"+
		"# TYPE payment_service_checkouts_total counter\n"+
		"payment_service_checkouts_total %d\n\n"+
		"# HELP payment_service_invoices_total Total number of invoices\n"+
		"# TYPE payment_service_invoices_total counter\n"+
		"payment_service_invoices_total %d\n\n"+
		"# HELP payment_service_subscriptions_total Total number of subscriptions\n"+
		"# TYPE payment_service_subscriptions_total counter\n"+
		"payment_service_subscriptions_total %d\n\n"+
		"# HELP payment_service_subscriptions_active Number of active subscriptions\n"+
		"# TYPE payment_service_subscriptions_active gauge\n"+
		"payment_service_subscriptions_active %d\n\n"+
		"# HELP payment_service_payments_failed_total Total number of failed payments\n"+
		"# TYPE payment_service_payments_failed_total counter\n"+
		"payment_service_payments_failed_total %d\n\n"+
		"# HELP payment_service_payments_successful_total Total number of successful payments\n"+
		"# TYPE payment_service_payments_successful_total counter\n"+
		"payment_service_payments_successful_total %d\n",
		totalCheckouts, totalInvoices, totalSubscriptions, activeSubscriptions, failedPayments, successfulPayments)

	c.Data(200, "text/plain; version=0.0.4; charset=utf-8", []byte(metrics))
}

func validateConfig(cfg *config.Config) error {
	if cfg.StripeAPIKey == "" {
		return log.New(os.Stdout, "", 0).Output(1, "STRIPE_API_KEY is required")
	}
	if cfg.StripeWebhookSecret == "" {
		return log.New(os.Stdout, "", 0).Output(1, "STRIPE_WEBHOOK_SECRET is required")
	}
	if cfg.SupabaseURL == "" {
		return log.New(os.Stdout, "", 0).Output(1, "SUPABASE_URL is required")
	}
	if cfg.SupabaseKey == "" {
		return log.New(os.Stdout, "", 0).Output(1, "SUPABASE_SERVICE_ROLE_KEY is required")
	}
	if cfg.StripeSuccessURL == "" {
		return log.New(os.Stdout, "", 0).Output(1, "STRIPE_SUCCESS_URL is required")
	}
	if cfg.StripeCancelURL == "" {
		return log.New(os.Stdout, "", 0).Output(1, "STRIPE_CANCEL_URL is required")
	}
	return nil
}

func corsMiddleware(cfg *config.Config) gin.HandlerFunc {
	allowedOrigins := []string{
		cfg.StripeSuccessURL,
		cfg.StripeCancelURL,
		"http://localhost:3000",
		"http://localhost:5173",
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin == "" {
			c.Next()
			return
		}

		allowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}

		if allowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
