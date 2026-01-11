package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"sync"
	"time"

	"voice-ai/payment-service/internal/config"
	"voice-ai/payment-service/internal/stripesvc"
	"voice-ai/payment-service/internal/supabase"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/webhook"
)

var (
	emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	phoneRegex = regexp.MustCompile(`^\+?[1-9]\d{1,14}$`)
)

type BillingHandler struct {
	config     *config.Config
	stripe     *stripesvc.Client
	supabase   *supabase.Client
	mu         sync.Mutex
	plansCache []map[string]interface{}
	cacheTime  time.Time
}

func NewBillingHandler(cfg *config.Config, s *stripesvc.Client, sb *supabase.Client) *BillingHandler {
	return &BillingHandler{
		config:   cfg,
		stripe:   s,
		supabase: sb,
	}
}

func (h *BillingHandler) GetPlans(c *gin.Context) {
	h.mu.Lock()
	// Reduced cache time to 5 minutes for better responsiveness to database changes
	if len(h.plansCache) > 0 && time.Since(h.cacheTime) < 5*time.Minute {
		plans := h.plansCache
		h.mu.Unlock()
		c.JSON(http.StatusOK, plans)
		return
	}
	h.mu.Unlock()

	plans, err := h.supabase.Fetch("plans", "order=price_amount&is=deleted_at")
	if err != nil {
		log.Printf("Error fetching plans: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plans"})
		return
	}

	h.mu.Lock()
	h.plansCache = plans
	h.cacheTime = time.Now()
	// If database is empty, ensure cache is also empty
	if len(plans) == 0 {
		h.plansCache = nil
	}
	h.mu.Unlock()

	// If no plans found, return empty array instead of null
	if plans == nil {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	c.JSON(http.StatusOK, plans)
}

func (h *BillingHandler) getSubscriptionInternal(userID string) (map[string]interface{}, error) {
	// 1. Fetch subscription with plan details using Supabase join
	subs, err := h.supabase.Fetch("subscriptions", fmt.Sprintf("user_id=eq.%s&select=*,plans(*)", userID))
	if err == nil && len(subs) > 0 {
		sub := subs[0]
		status := safeString(sub, "status")
		plan := normalizePlan(sub)

		return map[string]interface{}{
			"status":                 status,
			"current_period_start":   toUnix(sub["current_period_start"]),
			"current_period_end":     toUnix(sub["current_period_end"]),
			"cancel_at_period_end":   sub["cancel_at_period_end"],
			"stripe_subscription_id": safeString(sub, "stripe_subscription_id"),
			"plans":                  plan,
		}, nil
	}

	// 2. Fallback to businesses table for status or customer ID to sync
	biz, err := h.supabase.Fetch("businesses", fmt.Sprintf("user_id=eq.%s&select=subscription_status,stripe_customer_id", userID))
	if err == nil && len(biz) > 0 {
		customerID := safeString(biz[0], "stripe_customer_id")
		if customerID != "" {
			// Proactively try to sync if we have a customer ID but no sub in DB
			log.Printf("Proactive sync for user %s with customer %s", userID, customerID)
			_ = h.syncSubscription(userID, "", customerID)

			// Try fetching again after sync
			subs, err = h.supabase.Fetch("subscriptions", fmt.Sprintf("user_id=eq.%s&select=*,plans(*)", userID))
			if err == nil && len(subs) > 0 {
				sub := subs[0]
				plan := normalizePlan(sub)
				return map[string]interface{}{
					"status":                 safeString(sub, "status"),
					"current_period_start":   toUnix(sub["current_period_start"]),
					"current_period_end":     toUnix(sub["current_period_end"]),
					"cancel_at_period_end":   sub["cancel_at_period_end"],
					"stripe_subscription_id": safeString(sub, "stripe_subscription_id"),
					"plans":                  plan,
				}, nil
			}
		}

		status := safeString(biz[0], "subscription_status")
		if status == "" {
			status = "inactive"
		}
		return map[string]interface{}{"status": status}, nil
	}

	return nil, fmt.Errorf("subscription not found")
}

func (h *BillingHandler) getUsageInternal(userID string) (map[string]interface{}, error) {
	// 1. Fetch total minutes from subscription plan
	totalMinutes := 0.0
	subs, err := h.supabase.Fetch("subscriptions", fmt.Sprintf("user_id=eq.%s&select=*,plans(*)", userID))
	if err == nil && len(subs) > 0 {
		sub := subs[0]
		plan := normalizePlan(sub)

		if plan != nil {
			if limits, ok := plan["limits"].(map[string]interface{}); ok {
				if aiMinutes, ok := limits["ai_minutes"].(float64); ok {
					totalMinutes = aiMinutes
				}
			}
		}
	}

	// 2. Fetch call statistics using SQL aggregation for performance
	usage, err := h.supabase.Fetch("calls", fmt.Sprintf("user_id=eq.%s&is=deleted_at&select=duration_seconds.sum()", userID))
	if err != nil {
		return nil, err
	}

	var totalSeconds float64
	if len(usage) > 0 {
		if sum, ok := usage[0]["sum"].(float64); ok {
			totalSeconds = sum
		}
	}

	usedMinutes := totalSeconds / 60.0
	// For total calls, we still need a count
	countData, _ := h.supabase.Fetch("calls", fmt.Sprintf("user_id=eq.%s&is=deleted_at&select=id.count()", userID))
	totalCalls := 0
	if len(countData) > 0 {
		if count, ok := countData[0]["count"].(float64); ok {
			totalCalls = int(count)
		}
	}

	avgDuration := 0.0
	if totalCalls > 0 {
		avgDuration = totalSeconds / float64(totalCalls)
	}

	return map[string]interface{}{
		"used_minutes":      usedMinutes,
		"total_minutes":     totalMinutes,
		"total_calls":       totalCalls,
		"avg_duration":      avgDuration,
		"remaining_minutes": max(0, totalMinutes-usedMinutes),
	}, nil
}

func (h *BillingHandler) CreateCheckoutSession(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var body struct {
		PriceID   string `json:"price_id"`
		UserEmail string `json:"user_email"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Use email from context if not provided in body
	if body.UserEmail == "" {
		body.UserEmail = c.GetString("user_email")
	}

	// Input validation
	if body.UserEmail == "" || !emailRegex.MatchString(body.UserEmail) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	if len(body.PriceID) < 5 || len(body.PriceID) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid price ID"})
		return
	}

	// Use mutex to prevent race condition
	h.mu.Lock()

	// Check current status with database-level conflict handling
	subs, err := h.supabase.Fetch("subscriptions", fmt.Sprintf("user_id=eq.%s&is=deleted_at", userID))
	var customerID string
	var planID string

	if err == nil && len(subs) > 0 {
		status := safeString(subs[0], "status")
		if status == "active" || status == "trialing" {
			h.mu.Unlock()
			c.JSON(http.StatusConflict, gin.H{"error": "You already have an active subscription plan"})
			return
		}
		customerID = safeString(subs[0], "stripe_customer_id")
		planID = safeString(subs[0], "plan_id")
	}

	// Validate Stripe customer if exists
	if customerID != "" {
		_, err := h.stripe.GetCustomer(customerID)
		if err != nil {
			log.Printf("Stripe customer %s not found for user %s, clearing: %v", customerID, userID, err)
			customerID = ""

			_, _ = h.supabase.UpsertWithConflict("subscriptions", map[string]interface{}{
				"user_id":                userID,
				"stripe_customer_id":     nil,
				"stripe_subscription_id": nil,
				"plan_id":                nil,
				"status":                 "inactive",
				"updated_at":             time.Now().Format(time.RFC3339),
			}, "user_id")
		}
	}

	// Get plan details
	plans, err := h.supabase.Fetch("plans", fmt.Sprintf("stripe_price_id=eq.%s&is=deleted_at", body.PriceID))
	if planID == "" && err == nil && len(plans) > 0 {
		planID = safeString(plans[0], "id")
	}

	// Create checkout session inside lock to prevent double-subscription race
	session, err := h.stripe.CreateCheckoutSession(
		userID,
		body.PriceID,
		planID,
		body.UserEmail,
		customerID,
		h.config.StripeSuccessURL,
		h.config.StripeCancelURL,
	)

	h.mu.Unlock()

	if err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok {
			log.Printf("Stripe error for user %s: code=%s msg=%s", userID, stripeErr.Code, stripeErr.Msg)
			c.JSON(http.StatusBadRequest, gin.H{"error": stripeErr.Msg})
			return
		}
		log.Printf("Error creating checkout session: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create checkout session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": session.URL})
}

func (h *BillingHandler) HandleWebhook(c *gin.Context) {
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("Webhook: Failed to read request body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
		return
	}

	sigHeader := c.GetHeader("Stripe-Signature")
	if sigHeader == "" {
		log.Printf("Webhook: Missing signature header")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing signature"})
		return
	}

	event, err := webhook.ConstructEventWithOptions(payload, sigHeader, h.config.StripeWebhookSecret, webhook.ConstructEventOptions{
		IgnoreAPIVersionMismatch: true,
	})
	if err != nil {
		log.Printf("Webhook signature verification failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid signature"})
		return
	}

	log.Printf("Webhook: Processing event type: %s", event.Type)

	switch event.Type {
	case "checkout.session.completed":
		var session stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
			log.Printf("Webhook: Failed to parse session: %v", err)
			return
		}

		if session.Subscription != nil && session.Subscription.ID != "" {
			userID := session.Metadata["user_id"]
			if userID != "" {
				if err := h.syncSubscription(userID, session.Subscription.ID, session.Customer.ID); err != nil {
					log.Printf("Webhook: Sync failed for session %s: %v", session.ID, err)
					// We return 500 so Stripe retries
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Sync failed"})
					return
				}
			}
		}

	case "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted":
		var sub stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &sub); err != nil {
			log.Printf("Webhook: Failed to parse subscription: %v", err)
			return
		}

		userID := sub.Metadata["user_id"]
		if userID == "" {
			subs, err := h.supabase.Fetch("subscriptions", fmt.Sprintf("stripe_customer_id=eq.%s", sub.Customer.ID))
			if err == nil && len(subs) > 0 {
				userID = safeString(subs[0], "user_id")
			}
		}

		if userID != "" {
			if err := h.syncSubscription(userID, sub.ID, sub.Customer.ID); err != nil {
				log.Printf("Webhook: Sync failed for sub %s: %v", sub.ID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Sync failed"})
				return
			}
		}

	case "invoice.payment_succeeded", "invoice.payment_failed":
		var inv stripe.Invoice
		if err := json.Unmarshal(event.Data.Raw, &inv); err != nil {
			log.Printf("Webhook: Failed to parse invoice: %v", err)
			return
		}

		userID := inv.Metadata["user_id"]
		if userID == "" && inv.Subscription != nil {
			subs, err := h.supabase.Fetch("subscriptions", fmt.Sprintf("stripe_subscription_id=eq.%s", inv.Subscription.ID))
			if err == nil && len(subs) > 0 {
				userID = safeString(subs[0], "user_id")
			}
		}

		if userID != "" {
			invoiceData := map[string]interface{}{
				"user_id":            userID,
				"stripe_invoice_id":  inv.ID,
				"currency":           string(inv.Currency),
				"amount_paid":        inv.AmountPaid,
				"amount_due":         inv.AmountDue,
				"status":             string(inv.Status),
				"hosted_invoice_url": inv.HostedInvoiceURL,
				"invoice_pdf":        inv.InvoicePDF,
				"created_at":         time.Unix(inv.Created, 0).Format(time.RFC3339),
			}
			if _, err := h.supabase.UpsertWithConflict("invoices", invoiceData, "stripe_invoice_id"); err != nil {
				log.Printf("Webhook: Failed to save invoice %s: %v", inv.ID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save invoice"})
				return
			}

			if event.Type == "invoice.payment_failed" {
				if _, err := h.supabase.Update("subscriptions", fmt.Sprintf("user_id=eq.%s", userID), map[string]interface{}{
					"status":     "past_due",
					"updated_at": time.Now().Format(time.RFC3339),
				}); err != nil {
					log.Printf("Webhook: Failed to update status for failed payment: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Status update failed"})
					return
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func (h *BillingHandler) syncSubscription(userID, subID, customerID string) error {
	if userID == "" {
		return fmt.Errorf("empty userID")
	}

	// 1. Get subscription from Stripe if not provided
	var sub *stripe.Subscription
	var err error
	if subID != "" {
		sub, err = h.stripe.GetSubscription(subID)
		if err != nil {
			return fmt.Errorf("stripe error fetching sub %s: %w", subID, err)
		}
	} else if customerID != "" {
		// Fallback: search by customer if subID is unknown
		// This is a bit more complex with stripe-go, but usually we have subID or customerID
		// For now, if we don't have subID, we might just return or try to find it
	}

	if sub == nil {
		// Try to find the latest subscription for this customer
		if customerID != "" {
			// You might want to implement GetLatestSubscription in stripesvc
			// For now, we'll assume we have the subID from the webhook or DB
		}
	}

	if sub == nil {
		return fmt.Errorf("could not find subscription to sync")
	}

	if len(sub.Items.Data) == 0 {
		return fmt.Errorf("no subscription items for sub %s", sub.ID)
	}

	priceID := sub.Items.Data[0].Price.ID
	plans, err := h.supabase.Fetch("plans", fmt.Sprintf("stripe_price_id=eq.%s", priceID))
	var planID interface{}
	if err == nil && len(plans) > 0 {
		planID = plans[0]["id"]
	}

	data := map[string]interface{}{
		"user_id":                userID,
		"stripe_subscription_id": sub.ID,
		"stripe_customer_id":     customerID,
		"plan_id":                planID,
		"status":                 string(sub.Status),
		"current_period_start":   time.Unix(sub.CurrentPeriodStart, 0).Format(time.RFC3339),
		"current_period_end":     time.Unix(sub.CurrentPeriodEnd, 0).Format(time.RFC3339),
		"cancel_at_period_end":   sub.CancelAtPeriodEnd,
		"updated_at":             time.Now().Format(time.RFC3339),
		"deleted_at":             nil,
	}

	if _, err := h.supabase.UpsertWithConflict("subscriptions", data, "user_id"); err != nil {
		return fmt.Errorf("db error subscriptions: %w", err)
	}

	if _, err := h.supabase.Update("businesses", fmt.Sprintf("user_id=eq.%s", userID), map[string]interface{}{
		"subscription_status": string(sub.Status),
		"updated_at":          time.Now().Format(time.RFC3339),
	}); err != nil {
		return fmt.Errorf("db error businesses: %w", err)
	}

	return nil
}

func (h *BillingHandler) GetInvoices(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	invoices, err := h.getInvoicesInternal(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch invoices"})
		return
	}

	c.JSON(http.StatusOK, invoices)
}

func (h *BillingHandler) getInvoicesInternal(userID string) ([]map[string]interface{}, error) {
	invoices, err := h.supabase.Fetch("invoices", fmt.Sprintf("user_id=eq.%s&is=deleted_at&order=created_at.desc", userID))
	if err != nil {
		return nil, err
	}

	if len(invoices) > 0 {
		return invoices, nil
	}

	subs, err := h.supabase.Fetch("subscriptions", fmt.Sprintf("user_id=eq.%s&is=deleted_at", userID))
	if err != nil || len(subs) == 0 {
		return []map[string]interface{}{}, nil
	}

	customerID := safeString(subs[0], "stripe_customer_id")
	if customerID == "" {
		return []map[string]interface{}{}, nil
	}

	stripeInvoices, err := h.stripe.GetInvoices(customerID)
	if err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	for _, inv := range stripeInvoices {
		invoiceData := map[string]interface{}{
			"user_id":            userID,
			"stripe_invoice_id":  inv.ID,
			"currency":           string(inv.Currency),
			"amount_paid":        inv.AmountPaid,
			"amount_due":         inv.AmountDue,
			"status":             string(inv.Status),
			"hosted_invoice_url": inv.HostedInvoiceURL,
			"invoice_pdf":        inv.InvoicePDF,
			"created_at":         time.Unix(inv.Created, 0).Format(time.RFC3339),
		}
		result = append(result, invoiceData)

		// Sync to database
		_, _ = h.supabase.UpsertWithConflict("invoices", invoiceData, "stripe_invoice_id")
	}

	return result, nil
}

func (h *BillingHandler) GetPaymentMethod(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	pm, err := h.getPaymentMethodInternal(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payment method"})
		return
	}

	c.JSON(http.StatusOK, pm)
}

func (h *BillingHandler) getPaymentMethodInternal(userID string) (interface{}, error) {
	subs, err := h.supabase.Fetch("subscriptions", fmt.Sprintf("user_id=eq.%s&is=deleted_at", userID))
	if err != nil || len(subs) == 0 {
		return nil, nil
	}

	customerID := safeString(subs[0], "stripe_customer_id")
	if customerID == "" {
		return nil, nil
	}

	pm, err := h.stripe.GetPaymentMethod(customerID)
	if err != nil {
		return nil, err
	}

	if pm == nil {
		return nil, nil
	}

	if pm.Type == "card" {
		return gin.H{
			"type":      "card",
			"brand":     pm.Card.Brand,
			"last4":     pm.Card.Last4,
			"exp_month": pm.Card.ExpMonth,
			"exp_year":  pm.Card.ExpYear,
		}, nil
	}
	return gin.H{"type": pm.Type}, nil
}
