package stripesvc

import (
	"context"
	"crypto/tls"
	"net/http"
	"time"

	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/client"
)

// Client wraps the Stripe API with instance-scoped configuration.
// This prevents race conditions by avoiding global state mutation.
type Client struct {
	sc     *client.API
	apiKey string
}

// NewClient creates a new, thread-safe Stripe client instance.
func NewClient(apiKey string) *Client {
	// 1. Configure HTTP Client with timeouts and TLS settings
	httpClient := &http.Client{
		Timeout: 15 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				MinVersion: tls.VersionTLS12,
			},
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 10,
			IdleConnTimeout:     90 * time.Second,
		},
	}

	// 2. Create a Backend Configuration
	back := stripe.GetBackendWithConfig(stripe.APIBackend, &stripe.BackendConfig{
		HTTPClient: httpClient,
	})

	// 3. Initialize the Stripe Client API with our custom backend
	sc := &client.API{}
	sc.Init(apiKey, &stripe.Backends{
		API: back,
	})

	return &Client{
		sc:     sc,
		apiKey: apiKey,
	}
}

// api returns the Stripe API instance.
func (c *Client) api() *client.API {
	return c.sc
}

// CreateCheckoutSession creates a new Stripe Checkout Session.
func (c *Client) CreateCheckoutSession(userID, priceID, planID, userEmail, customerID, successURL, cancelURL string) (*stripe.CheckoutSession, error) {
	// Use context with timeout directly
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	params := &stripe.CheckoutSessionParams{
		SuccessURL: stripe.String(successURL),
		CancelURL:  stripe.String(cancelURL),
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
		Mode: stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceID),
				Quantity: stripe.Int64(1),
			},
		},
		SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
			Metadata: map[string]string{
				"user_id": userID,
				"plan_id": planID,
			},
		},
		Params: stripe.Params{
			Metadata: map[string]string{
				"user_id": userID,
				"plan_id": planID,
			},
		},
		AllowPromotionCodes: stripe.Bool(true),
	}

	if customerID != "" {
		params.Customer = stripe.String(customerID)
	} else if userEmail != "" {
		params.CustomerEmail = stripe.String(userEmail)
	}

	// NATIVE TIMEOUT SUPPORT: Pass context to params.
	// The Stripe library handles cancellation internally if ctx expires.
	params.Context = ctx

	// Add idempotency key to prevent duplicate sessions if the request is retried
	idempotencyKey := "checkout_" + userID + "_" + priceID
	params.IdempotencyKey = stripe.String(idempotencyKey)

	// SYNCHRONOUS CALL: No goroutine overhead.
	return c.api().CheckoutSessions.New(params)
}

// CreatePortalSession creates a Stripe Customer Portal session.
func (c *Client) CreatePortalSession(customerID, returnURL string) (*stripe.BillingPortalSession, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(customerID),
		ReturnURL: stripe.String(returnURL),
	}
	params.Context = ctx

	return c.api().BillingPortalSessions.New(params)
}

// CancelSubscription cancels a subscription at the end of the period.
func (c *Client) CancelSubscription(subID string) (*stripe.Subscription, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	params := &stripe.SubscriptionParams{
		CancelAtPeriodEnd: stripe.Bool(true),
	}
	params.Context = ctx

	return c.api().Subscriptions.Update(subID, params)
}

// ReactivateSubscription removes the cancellation flag from a subscription.
func (c *Client) ReactivateSubscription(subID string) (*stripe.Subscription, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	params := &stripe.SubscriptionParams{
		CancelAtPeriodEnd: stripe.Bool(false),
	}
	params.Context = ctx

	return c.api().Subscriptions.Update(subID, params)
}

// GetInvoices retrieves a list of invoices for a customer.
func (c *Client) GetInvoices(customerID string) ([]*stripe.Invoice, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	params := &stripe.InvoiceListParams{
		Customer: stripe.String(customerID),
	}
	params.Filters.AddFilter("limit", "", "12")

	// NATIVE TIMEOUT
	params.Context = ctx

	// SYNCHRONOUS CALL
	i := c.api().Invoices.List(params)

	invoices := []*stripe.Invoice{}
	for i.Next() {
		invoices = append(invoices, i.Invoice())
	}

	return invoices, i.Err()
}

// GetPaymentMethod retrieves the default payment method for a customer.
func (c *Client) GetPaymentMethod(customerID string) (*stripe.PaymentMethod, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var pm *stripe.PaymentMethod

	// 1. Try to get default from Customer Invoice Settings
	cust, err := c.api().Customers.Get(customerID, &stripe.CustomerParams{
		Params: stripe.Params{
			Expand: []*string{stripe.String("invoice_settings.default_payment_method")},
		},
	})

	if err == nil {
		if cust.InvoiceSettings != nil && cust.InvoiceSettings.DefaultPaymentMethod != nil {
			return cust.InvoiceSettings.DefaultPaymentMethod, nil
		}
	}

	// Fallback: List payment methods and get first one
	listParams := &stripe.PaymentMethodListParams{
		Customer: stripe.String(customerID),
		Type:     stripe.String("card"),
	}
	// We only need the most recent card
	listParams.Filters.AddFilter("limit", "", "1")
	listParams.Context = ctx

	i := c.api().PaymentMethods.List(listParams)

	if i.Next() {
		pm = i.PaymentMethod()
	}

	return pm, i.Err()
}

// GetSubscription retrieves a subscription by ID.
func (c *Client) GetSubscription(subID string) (*stripe.Subscription, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	params := &stripe.SubscriptionParams{}

	// NATIVE TIMEOUT
	params.Context = ctx

	// SYNCHRONOUS CALL
	return c.api().Subscriptions.Get(subID, params)
}

// GetCustomer retrieves a customer by ID.
func (c *Client) GetCustomer(customerID string) (*stripe.Customer, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	params := &stripe.CustomerParams{}

	// NATIVE TIMEOUT
	params.Context = ctx

	// SYNCHRONOUS CALL
	return c.api().Customers.Get(customerID, params)
}
