package handlers

import (
	"fmt"
	"log"
	"net/http"

	"voice-ai/payment-service/internal/config"
	"voice-ai/payment-service/internal/stripesvc"
	"voice-ai/payment-service/internal/supabase"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v74"
)

type SubscriptionHandler struct {
	config   *config.Config
	stripe   *stripesvc.Client
	supabase *supabase.Client
	billing  *BillingHandler // Reference to billing handler for shared logic if needed
}

func NewSubscriptionHandler(cfg *config.Config, s *stripesvc.Client, sb *supabase.Client, bh *BillingHandler) *SubscriptionHandler {
	return &SubscriptionHandler{
		config:   cfg,
		stripe:   s,
		supabase: sb,
		billing:  bh,
	}
}

func (h *SubscriptionHandler) GetSubscription(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	sub, err := h.billing.getSubscriptionInternal(userID)
	if err != nil {
		// Return null if no subscription or business record exists
		c.JSON(http.StatusOK, nil)
		return
	}

	c.JSON(http.StatusOK, sub)
}

func (h *SubscriptionHandler) GetUsage(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Check if subscription exists first
	_, err := h.billing.getSubscriptionInternal(userID)
	if err != nil {
		c.JSON(http.StatusOK, nil)
		return
	}

	usage, err := h.billing.getUsageInternal(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch usage"})
		return
	}

	c.JSON(http.StatusOK, usage)
}

func (h *SubscriptionHandler) UpdateSubscription(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var body struct {
		Action string `json:"action"` // "cancel" or "reactivate"
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// 1. Get subscription from DB
	subs, err := h.supabase.Fetch("subscriptions", fmt.Sprintf("user_id=eq.%s&is=deleted_at", userID))
	if err != nil || len(subs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found"})
		return
	}

	subID := safeString(subs[0], "stripe_subscription_id")
	if subID == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stripe subscription not found"})
		return
	}

	// 2. Process with Stripe API
	var updatedSub *stripe.Subscription
	if body.Action == "cancel" {
		updatedSub, err = h.stripe.CancelSubscription(subID)
	} else if body.Action == "reactivate" {
		updatedSub, err = h.stripe.ReactivateSubscription(subID)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid action"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Stripe update failed", "details": err.Error()})
		return
	}

	// 3. Update database records
	customerID := safeString(subs[0], "stripe_customer_id")
	if err := h.billing.syncSubscription(userID, updatedSub.ID, customerID); err != nil {
		log.Printf("Sync failed after update: %v", err)
		// We still return success as Stripe update worked
	}

	// 4. Return processed data to frontend
	c.JSON(http.StatusOK, gin.H{
		"status":               "success",
		"action":               body.Action,
		"cancel_at_period_end": updatedSub.CancelAtPeriodEnd,
	})
}

func (h *SubscriptionHandler) Sync(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// 1. Get user/business to find stripe customer ID
	businesses, err := h.supabase.Fetch("businesses", fmt.Sprintf("user_id=eq.%s", userID))
	if err != nil || len(businesses) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User profile not found"})
		return
	}

	customerID := ""
	if val, ok := businesses[0]["stripe_customer_id"].(string); ok {
		customerID = val
	}

	if customerID == "" {
		// If no customer ID, nothing to sync yet
		c.JSON(http.StatusOK, gin.H{"status": "no_customer"})
		return
	}

	// 2. Fetch subscription from DB to get subscription ID
	subs, err := h.supabase.Fetch("subscriptions", fmt.Sprintf("user_id=eq.%s", userID))
	subID := ""
	if err == nil && len(subs) > 0 {
		if val, ok := subs[0]["stripe_subscription_id"].(string); ok {
			subID = val
		}
	}

	// 3. Perform the sync
	if err := h.billing.syncSubscription(userID, subID, customerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Sync failed", "details": err.Error()})
		return
	}

	// 4. Return success (or don't if called from GetBillingDetails)
	if c.Writer.Status() != http.StatusOK {
		c.JSON(http.StatusOK, gin.H{"status": "synced"})
	}
}

func (h *SubscriptionHandler) GetBillingDetails(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Optional: force sync with Stripe
	if c.Query("sync") == "true" {
		h.Sync(c)
	}

	sub, err := h.billing.getSubscriptionInternal(userID)

	// If no subscription found, we return a minimal response or 404
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"subscription":   nil,
			"usage":          nil,
			"invoices":       []interface{}{},
			"payment_method": nil,
		})
		return
	}

	usage, _ := h.billing.getUsageInternal(userID)
	invoices, _ := h.billing.getInvoicesInternal(userID)
	pm, _ := h.billing.getPaymentMethodInternal(userID)

	response := gin.H{
		"subscription":   sub,
		"usage":          usage,
		"invoices":       invoices,
		"payment_method": pm,
	}

	c.JSON(http.StatusOK, response)
}
