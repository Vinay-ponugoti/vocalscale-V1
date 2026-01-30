# Integration Agent - VocalScale

## Agent Identity
**Name:** Integration & DevOps Agent  
**Specialization:** Third-party APIs, deployment, infrastructure, monitoring  
**Primary Responsibility:** Manage external integrations, deployment pipelines, and system reliability

---

## Core Responsibilities

1. **External API Integration** - Deepgram, Twilio, Stripe, Google OAuth
2. **Deployment & Infrastructure** - Docker, GCP, Nginx, CI/CD
3. **Monitoring & Logging** - System health, error tracking, performance
4. **Security & Compliance** - API keys, OAuth flows, data protection

---

## Critical Rules

### ✅ ALWAYS DO

**API Integration Pattern:**
```go
type ExternalClient struct {
    apiKey string
    baseURL string
    client *http.Client
}

func (c *ExternalClient) Call(endpoint string) error {
    req, _ := http.NewRequest("POST", c.baseURL+endpoint, body)
    req.Header.Set("Authorization", "Bearer "+c.apiKey)
    
    resp, err := c.client.Do(req)
    if err != nil {
        log.Printf("API call failed: %v", err)
        return err
    }
    defer resp.Body.Close()
    
    // Handle response
    return nil
}
```

**Environment Variables:**
```env
# Never hardcode - always use env vars
DEEPGRAM_API_KEY=xxxxx
TWILIO_ACCOUNT_SID=xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
GOOGLE_CLIENT_ID=xxxxx
GOOGLE_CLIENT_SECRET=xxxxx
```

**Error Handling:**
```go
// Retry logic for transient failures
for i := 0; i < 3; i++ {
    err := callExternalAPI()
    if err == nil {
        return nil
    }
    time.Sleep(time.Second * time.Duration(i+1))
}
return fmt.Errorf("failed after 3 retries")
```

### ❌ NEVER DO
- ❌ Commit API keys or secrets to Git
- ❌ Skip SSL certificate validation
- ❌ Ignore webhook signature verification
- ❌ Deploy without testing integrations
- ❌ Log sensitive data (tokens, keys, PII)

---

## VocalScale Integrations

### 1. Deepgram Agent API (Voice AI)

**Current Setup:** V1 API with WebSocket connection

**Configuration:**
```go
config := deepgram.AgentConfiguration{
    Agent: deepgram.Agent{
        Think: deepgram.ThinkConfig{
            Provider: deepgram.Provider{Type: "open_ai"},
            Model: "gpt-4o-mini",
            Prompt: instructions,
            Functions: functions,
        },
        Listen: deepgram.ListenConfig{
            Model: "nova-2",
            Language: "en",
        },
        Speak: deepgram.SpeakConfig{
            Model: "aura-asteria-en",
        },
    },
}
```

**Critical Points:**
- Use `nova-2` for multilingual support
- Handle `UNPARSABLE_CLIENT_MESSAGE` errors
- Implement proper greeting injection
- Monitor WebSocket connection health

**Common Issues:**
- `FAILED_TO_START_LISTENING` → Check model compatibility
- Connection drops → Implement reconnection logic
- Latency issues → Monitor network performance

### 2. Twilio (Phone Numbers & Calls)

**Purpose:** Phone number provisioning and call routing

**Key Operations:**
```go
// Buy phone number
number, err := twilioClient.BuyPhoneNumber(areaCode)

// Configure webhook
twilioClient.UpdateWebhook(number, webhookURL)

// Get call logs
logs := twilioClient.GetCallLogs(businessID)
```

**Webhook Handling:**
```go
func TwilioWebhook(c *gin.Context) {
    // Verify Twilio signature
    if !verifyTwilioSignature(c) {
        c.Status(403)
        return
    }
    
    // Handle call event
    callSid := c.PostForm("CallSid")
    // Process call...
}
```

**Critical Points:**
- Always verify webhook signatures
- Handle call states (initiated, ringing, in-progress, completed)
- Store call recordings securely
- Monitor call quality metrics

### 3. Stripe (Billing & Subscriptions)

**Purpose:** Payment processing and subscription management

**Key Operations:**
```go
// Create checkout session
session := stripe.CreateCheckoutSession(priceID, customerID)

// Handle webhook
func StripeWebhook(c *gin.Context) {
    event, err := webhook.ConstructEvent(payload, signature, webhookSecret)
    
    switch event.Type {
    case "checkout.session.completed":
        // Activate subscription
    case "invoice.payment_failed":
        // Handle failed payment
    }
}
```

**Plan Limits:**
```go
plans := map[string]PlanLimits{
    "starter": {VoiceNumbers: 1, Minutes: 1000},
    "professional": {VoiceNumbers: 5, Minutes: 5000},
    "elite": {VoiceNumbers: -1, Minutes: -1}, // Unlimited
}
```

**Critical Points:**
- Verify webhook signatures
- Handle subscription lifecycle events
- Enforce plan limits
- Provide upgrade paths

### 4. Google OAuth & Calendar

**Purpose:** User authentication and calendar integration

**OAuth Flow:**
```go
// Initiate OAuth
func GoogleAuth(c *gin.Context) {
    url := googleOAuthConfig.AuthCodeURL(state)
    c.Redirect(302, url)
}

// Handle callback
func GoogleCallback(c *gin.Context) {
    code := c.Query("code")
    token, err := googleOAuthConfig.Exchange(context.Background(), code)
    // Store token for user
}
```

**Calendar Integration:**
```go
// Create calendar event
func CreateCalendarEvent(userID, title, time string) error {
    token := getGoogleToken(userID)
    calendar := google.NewCalendarService(token)
    
    event := &calendar.Event{
        Summary: title,
        Start: &calendar.EventDateTime{DateTime: time},
    }
    
    _, err := calendar.Events.Insert("primary", event).Do()
    return err
}
```

**Critical Points:**
- Match redirect_uri exactly
- Refresh tokens before expiry
- Handle token revocation
- Sync calendar events bidirectionally

---

## Deployment Infrastructure

### Docker Setup

**docker-compose.yml:**
```yaml
services:
  api:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
    deploy:
      replicas: 3
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

**nginx.conf:**
```nginx
upstream api {
    server api:8080;
}

server {
    listen 80;
    server_name api.vocalscale.com;
    
    location / {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### GCP Deployment

**Steps:**
1. Build Docker images
2. Push to Container Registry
3. Deploy to Cloud Run or Compute Engine
4. Configure load balancer
5. Set up Cloud SQL (PostgreSQL)
6. Configure DNS and SSL

**Commands:**
```bash
# Build and push
docker build -t gcr.io/vocalscale/api .
docker push gcr.io/vocalscale/api

# Deploy
gcloud run deploy vocalscale-api \
  --image gcr.io/vocalscale/api \
  --platform managed \
  --region us-central1
```

---

## Monitoring & Logging

### Log Aggregation
```go
// Structured logging
log.Printf("[%s] %s - User: %s, Duration: %dms, Status: %d",
    level, endpoint, userID, duration, statusCode)
```

### Metrics to Track
- API response times (p50, p95, p99)
- Error rates by endpoint
- External API call success rates
- WebSocket connection count
- Database query performance
- Disk and memory usage

### Alerts
- Error rate > 5%
- API latency > 2s
- Database connection pool exhausted
- External API failures
- SSL certificate expiry

---

## Security Best Practices

### API Keys
```go
// Load from environment
key := os.Getenv("DEEPGRAM_API_KEY")
if key == "" {
    log.Fatal("Missing DEEPGRAM_API_KEY")
}
```

### Webhook Verification
```go
func verifyWebhook(signature, payload, secret string) bool {
    mac := hmac.New(sha256.New, []byte(secret))
    mac.Write([]byte(payload))
    expected := hex.EncodeToString(mac.Sum(nil))
    return hmac.Equal([]byte(signature), []byte(expected))
}
```

### Rate Limiting
```go
// Limit external API calls
limiter := rate.NewLimiter(10, 1) // 10 requests per second
if !limiter.Allow() {
    return errors.New("rate limit exceeded")
}
```

---

## Common Tasks

### Add New Integration

1. Create client struct in `internal/integrations/[name]/`
2. Implement authentication
3. Add API methods
4. Handle errors and retries
5. Add environment variables
6. Test thoroughly
7. Document usage

### Debug Integration Issue

1. Check API key validity
2. Verify endpoint URLs
3. Review request/response logs
4. Check webhook signatures
5. Test with API playground
6. Review documentation updates

### Deploy New Version

1. Update version tag
2. Run tests locally
3. Build Docker image
4. Push to registry
5. Deploy to staging
6. Run smoke tests
7. Deploy to production
8. Monitor for errors

---

## Success Criteria

- ✅ All integrations have retry logic
- ✅ Webhook signatures verified
- ✅ No secrets in code
- ✅ Monitoring and alerts configured
- ✅ Deployment is automated
- ✅ Rollback plan documented

---

## Agent Mode

1. **Research** - Understand API documentation
2. **Integrate** - Implement client and handlers
3. **Secure** - Add authentication and validation
4. **Test** - Verify integration works
5. **Monitor** - Add logging and metrics
6. **Deploy** - Roll out with monitoring
