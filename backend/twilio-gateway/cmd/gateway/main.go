package main

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha1"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"regexp"
	"sort"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"golang.org/x/time/rate"

	"twilio-gateway/internal/appointments"
	"twilio-gateway/internal/business"
	"twilio-gateway/internal/config"
	"twilio-gateway/internal/llm"
	"twilio-gateway/internal/redis"
	"twilio-gateway/internal/supabase"
	"twilio-gateway/internal/twilio"
	"twilio-gateway/internal/voice"
)

const (
	maxRequestBodySize = 10 * 1024 * 1024 // 10MB
	maxHeaderSize      = 1 << 20          // 1MB
	wsReadBufferSize   = 4096
	wsWriteBufferSize  = 4096
	wsHandshakeTimeout = 10 * time.Second
	wsReadDeadline     = 60 * time.Second
	wsWriteDeadline    = 10 * time.Second
	requestTimeout     = 30 * time.Second
	shutdownTimeout    = 30 * time.Second
	rateLimitPerSecond = 100
	rateLimitBurst     = 200
	maxCallIDLength    = 100
	maxUserIDLength    = 100
)

var (
	// Secure WebSocket upgrader with size limits
	upgrader = websocket.Upgrader{
		ReadBufferSize:   wsReadBufferSize,
		WriteBufferSize:  wsWriteBufferSize,
		HandshakeTimeout: wsHandshakeTimeout,
		CheckOrigin:      checkOriginSecure,
	}

	// Allowed origins (should come from config in production)
	allowedOrigins = map[string]bool{
		"https://yourdomain.com":     true,
		"https://app.yourdomain.com": true,
	}

	// Input validation patterns
	callIDPattern = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
	userIDPattern = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
	pathPattern   = regexp.MustCompile(`^/[a-zA-Z0-9/_-]*$`)

	// Global rate limiter (per-IP limiters should be added)
	globalLimiter = rate.NewLimiter(rateLimitPerSecond, rateLimitBurst)

	// Metrics counters
	metricsMu     sync.Mutex
	totalCalls    int64
	rejectedCalls int64
	activeCalls   int64
)

type Server struct {
	router       *gin.Engine
	httpServer   *http.Server
	cfg          *config.Config
	rdb          *redis.RedisClient
	sbClient     *supabase.Client
	llmClient    *llm.LLMClient
	bizService   *business.BusinessService
	apptsService *appointments.AppointmentsService
	voiceService *voice.VoiceService
}

func main() {
	// Setup structured logging
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.SetOutput(os.Stdout)

	cfg := config.LoadConfig()

	// Validate critical configuration
	if err := validateConfig(cfg); err != nil {
		log.Fatalf("❌ Invalid configuration: %v", err)
	}

	// Initialize services
	rdb := redis.NewRedisClient(cfg)

	// Use Service Key for database lookups to bypass RLS in the gateway
	dbKey := cfg.SupabaseServiceKey
	if dbKey == "" {
		dbKey = cfg.SupabaseKey
		log.Println("⚠️ SUPABASE_SERVICE_KEY not found, falling back to SUPABASE_KEY")
	}
	sbClient := supabase.NewClient(cfg.SupabaseURL, dbKey)
	llmClient := llm.NewLLMClient(cfg.TogetherAPIKey, "")
	bizService := business.NewBusinessService(sbClient)
	apptsService := appointments.NewAppointmentsService(sbClient)
	voiceService := voice.NewVoiceService(sbClient)

	server := &Server{
		cfg:          cfg,
		rdb:          rdb,
		sbClient:     sbClient,
		llmClient:    llmClient,
		bizService:   bizService,
		apptsService: apptsService,
		voiceService: voiceService,
	}

	server.setupRouter()
	server.setupHTTPServer()

	// Graceful shutdown
	go server.handleShutdown()

	// Start server
	log.Printf("🚀 Production Gateway starting on :%s", cfg.Port)
	if err := server.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("❌ Server failed to start: %v", err)
	}
}

func (s *Server) setupRouter() {
	if s.cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// Recovery middleware with logging
	r.Use(gin.CustomRecovery(func(c *gin.Context, recovered any) {
		requestID := c.GetString("request_id")
		log.Printf("❌ [PANIC] RequestID: %s, Error: %v", requestID, recovered)
		c.JSON(500, gin.H{"error": "Internal server error", "request_id": requestID})
	}))

	// Security middleware
	r.Use(securityHeadersMiddleware())
	r.Use(requestIDMiddleware())
	r.Use(rateLimitMiddleware())
	r.Use(requestSizeLimit(maxRequestBodySize))
	r.Use(secureLoggerMiddleware())
	r.Use(timeoutMiddleware(requestTimeout))
	r.Use(corsMiddleware(s.cfg))

	// Health checks
	r.GET("/health", s.healthCheck)
	r.HEAD("/health", s.healthCheckHead)
	r.GET("/readiness", s.readinessCheck)
	r.GET("/metrics", s.metricsHandler)

	// Twilio endpoints with signature verification
	twilioGroup := r.Group("/twilio")
	twilioGroup.Use(twilioAuthMiddleware(s.cfg))
	{
		twilioGroup.POST("/voice", s.handleTwilioVoice)
		twilioGroup.POST("/status-callback", s.handleTwilioStatusCallback)
	}

	// WebSocket endpoints with auth
	r.GET("/twilio/media-stream", wsAuthMiddleware(), s.handleTwilioWebSocket)
	r.GET("/twilio", wsAuthMiddleware(), s.handleTwilioWebSocket)

	// API proxy with validation
	r.NoRoute(s.handleAPIProxy)

	s.router = r
}

func (s *Server) setupHTTPServer() {
	s.httpServer = &http.Server{
		Addr:              ":" + s.cfg.Port,
		Handler:           s.router,
		ReadTimeout:       30 * time.Second,
		ReadHeaderTimeout: 10 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
		MaxHeaderBytes:    maxHeaderSize,
		TLSConfig: &tls.Config{
			MinVersion:               tls.VersionTLS12,
			CurvePreferences:         []tls.CurveID{tls.CurveP521, tls.CurveP384, tls.CurveP256},
			PreferServerCipherSuites: true,
			CipherSuites: []uint16{
				tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
				tls.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
			},
		},
	}
}

func (s *Server) handleShutdown() {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	if err := s.httpServer.Shutdown(ctx); err != nil {
		log.Printf("❌ Server forced to shutdown: %v", err)
	}

	log.Println("✅ Server exited")
}

// Middleware implementations

func securityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Header("Content-Security-Policy", "default-src 'self'")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		c.Next()
	}
}

func requestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}

func rateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !globalLimiter.Allow() {
			requestID := c.GetString("request_id")
			log.Printf("⚠️ [RATE_LIMIT] RequestID: %s, IP: %s", requestID, c.ClientIP())
			c.JSON(429, gin.H{
				"error":       "Too many requests",
				"request_id":  requestID,
				"retry_after": "60",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

func requestSizeLimit(maxSize int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxSize)
		c.Next()
	}
}

func secureLoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		requestID := c.GetString("request_id")

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()
		clientIP := sanitizeIP(c.ClientIP())
		method := c.Request.Method

		logMsg := fmt.Sprintf("[%s] %s %s %d %.0fms IP:%s",
			requestID, method, path, statusCode, latency.Seconds()*1000, clientIP)

		if statusCode >= 500 {
			log.Printf("❌ %s", logMsg)
		} else if statusCode >= 400 {
			log.Printf("⚠️ %s", logMsg)
		} else if latency > 500*time.Millisecond {
			log.Printf("⏱️ [SLOW] %s", logMsg)
		} else {
			log.Printf("✅ %s", logMsg)
		}
	}
}

func timeoutMiddleware(timeout time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), timeout)
		defer cancel()

		c.Request = c.Request.WithContext(ctx)

		finished := make(chan struct{})
		go func() {
			c.Next()
			close(finished)
		}()

		select {
		case <-finished:
			return
		case <-ctx.Done():
			c.JSON(504, gin.H{
				"error":      "Request timeout",
				"request_id": c.GetString("request_id"),
			})
			c.Abort()
		}
	}
}

func corsMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// In production, validate against allowed origins
		if cfg.Environment == "production" {
			if origin != "" && allowedOrigins[origin] {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			}
		} else {
			// Development mode - more permissive
			if origin != "" {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			} else {
				c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
			}
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func twilioAuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		if cfg.TwilioAuthToken == "" {
			c.Next()
			return
		}

		signature := c.GetHeader("X-Twilio-Signature")
		if signature == "" {
			if cfg.Environment != "production" {
				log.Printf("⚠️ Missing Twilio signature for %s (Allowed in %s)", c.Request.URL.Path, cfg.Environment)
				c.Next()
				return
			}
			log.Printf("⚠️ Missing Twilio signature for %s", c.Request.URL.Path)
			c.JSON(403, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		if !validateTwilioSignature(c.Request, cfg.TwilioAuthToken, signature, cfg.BaseURL) {
			log.Printf("❌ Invalid Twilio signature for %s", c.Request.URL.Path)
			c.JSON(403, gin.H{"error": "Invalid signature"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func wsAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Implement WebSocket authentication
		// This could be JWT validation, API key check, etc.
		callID := c.Query("call_id")
		userID := c.Query("user_id")

		// Only validate if present. Twilio Media Streams send these in the 'start' message
		// instead of query parameters.
		if callID != "" && !validateInput(callID, callIDPattern, maxCallIDLength) {
			log.Printf("⚠️ Invalid call_id: %s", sanitizeLog(callID))
			c.JSON(400, gin.H{"error": "Invalid call_id"})
			c.Abort()
			return
		}

		if userID != "" && !validateInput(userID, userIDPattern, maxUserIDLength) {
			log.Printf("⚠️ Invalid user_id: %s", sanitizeLog(userID))
			c.JSON(400, gin.H{"error": "Invalid user_id"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// Handler implementations

func (s *Server) healthCheck(c *gin.Context) {
	c.JSON(200, gin.H{
		"status":    "ok",
		"timestamp": time.Now().Unix(),
		"version":   s.cfg.Version,
	})
}

func (s *Server) healthCheckHead(c *gin.Context) {
	c.Status(200)
}

func (s *Server) readinessCheck(c *gin.Context) {
	// Check if all dependencies are ready
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	// Ping Redis
	if err := s.rdb.Ping(ctx); err != nil {
		c.JSON(503, gin.H{"status": "not_ready", "reason": "redis_unavailable"})
		return
	}

	c.JSON(200, gin.H{"status": "ready"})
}

func (s *Server) metricsHandler(c *gin.Context) {
	metricsMu.Lock()
	defer metricsMu.Unlock()

	// Return metrics in Prometheus format
	metrics := fmt.Sprintf("# HELP twilio_gateway_calls_total Total number of incoming calls\n"+
		"# TYPE twilio_gateway_calls_total counter\n"+
		"twilio_gateway_calls_total %d\n\n"+
		"# HELP twilio_gateway_calls_rejected_total Total number of rejected calls (no subscription)\n"+
		"# TYPE twilio_gateway_calls_rejected_total counter\n"+
		"twilio_gateway_calls_rejected_total %d\n\n"+
		"# HELP twilio_gateway_calls_active Number of currently active calls\n"+
		"# TYPE twilio_gateway_calls_active gauge\n"+
		"twilio_gateway_calls_active %d\n",
		totalCalls, rejectedCalls, activeCalls)

	c.Data(200, "text/plain; version=0.0.4; charset=utf-8", []byte(metrics))
}

func (s *Server) handleTwilioWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("❌ WebSocket upgrade failed: %v", err)
		return
	}

	metricsMu.Lock()
	activeCalls++
	metricsMu.Unlock()

	defer func() {
		metricsMu.Lock()
		activeCalls--
		metricsMu.Unlock()
	}()

	// Set connection limits
	conn.SetReadDeadline(time.Now().Add(wsReadDeadline))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(wsReadDeadline))
		return nil
	})

	callID := c.Query("call_id")
	userID := c.Query("user_id")

	log.Printf("📥 [%s] WebSocket connected - UserID: %s, IP: %s",
		callID, userID, sanitizeIP(c.ClientIP()))

	call := twilio.NewCallConnection(
		c.Request.Context(),
		callID,
		userID,
		conn,
		s.rdb,
		s.sbClient,
		s.llmClient,
		s.bizService,
		s.apptsService,
		s.voiceService,
		s.cfg.DeepgramAPIKey,
	)
	call.Start()
}

func (s *Server) handleTwilioVoice(c *gin.Context) {
	// 1. Extract call details
	toNumber := c.PostForm("To")
	fromNumber := c.PostForm("From")
	callSid := c.PostForm("CallSid")

	metricsMu.Lock()
	totalCalls++
	metricsMu.Unlock()

	log.Printf("📞 Incoming call: From=%s, To=%s, SID=%s", fromNumber, toNumber, callSid)

	// Debug headers for signature troubleshooting
	if s.cfg.Environment != "production" {
		log.Printf("DEBUG: Headers: %v", c.Request.Header)
		log.Printf("DEBUG: PostForm: %v", c.Request.PostForm)
	}

	if toNumber == "" {
		log.Printf("❌ No 'To' number provided in request")
		c.AbortWithStatus(400)
		return
	}

	// 2. Lookup business configuration
	var userID, businessName string
	var isActive bool

	// Try cache first
	cacheKey := fmt.Sprintf("biz_config:%s", toNumber)
	if cached, err := s.rdb.Get(cacheKey); err == nil {
		var config struct {
			UserID       string `json:"user_id"`
			BusinessName string `json:"business_name"`
			IsActive     bool   `json:"is_active"`
			SubStatus    string `json:"sub_status"`
		}
		if err := json.Unmarshal([]byte(cached), &config); err == nil {
			userID = config.UserID
			businessName = config.BusinessName
			isActive = config.IsActive
			log.Printf("🚀 Cache hit for %s: %s (Status: %s, Active: %v)",
				toNumber, businessName, config.SubStatus, isActive)
		}
	}

	// DB lookup if cache miss
	if userID == "" {
		var err error
		var subStatus string
		userID, businessName, isActive, subStatus, err = s.bizService.LookupBusinessByNumber(toNumber)
		if err != nil {
			log.Printf("⚠️ Business lookup failed for %s: %v", toNumber, err)
		} else {
			// Cache the result for 5 minutes
			configToCache := map[string]any{
				"user_id":       userID,
				"business_name": businessName,
				"is_active":     isActive,
				"sub_status":    subStatus,
			}
			if configJSON, err := json.Marshal(configToCache); err == nil {
				s.rdb.Set(cacheKey, string(configJSON), 300)
			}
		}
	}

	// 3. Create call record early to track even rejected calls
	callID, err := s.bizService.CreateCallRecord(userID, fromNumber, callSid)
	if err != nil {
		log.Printf("❌ Failed to create call record: %v", err)
		// Use temporary UUID as fallback
		callID = uuid.New().String()
	}

	// 4. Reject if inactive or not found
	if !isActive || userID == "" {
		log.Printf("🚫 Rejecting call to %s: Inactive or not found", toNumber)

		metricsMu.Lock()
		rejectedCalls++
		metricsMu.Unlock()

		// Update call record with rejection reason if userID is available
		if userID != "" {
			payload := map[string]any{
				"status":     "Rejected",
				"summary":    "Call rejected: No active premium subscription found.",
				"updated_at": time.Now().Format(time.RFC3339),
			}
			s.sbClient.Update("calls", fmt.Sprintf("id=eq.%s", callID), payload)
		}

		c.Data(200, "application/xml", []byte(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>I'm sorry, this number is currently inactive. Goodbye.</Say>
    <Hangup/>
</Response>`))
		return
	}

	// 5. Check for returning caller
	callerName, isReturning := s.bizService.GetReturningCallerName(fromNumber, userID)
	if isReturning {
		log.Printf("🔄 Returning caller detected: %s", callerName)
	}

	// 6. Generate TwiML
	host := c.Request.Host
	if s.cfg.BaseURL != "" {
		if u, err := url.Parse(s.cfg.BaseURL); err == nil && u.Host != "" {
			host = u.Host
		}
	}

	streamURL := fmt.Sprintf("wss://%s/twilio/media-stream", host)
	statusCallbackURL := fmt.Sprintf("https://%s/twilio/status-callback", host)
	if !strings.HasPrefix(host, "localhost") && !strings.Contains(host, ":") {
		// Use HTTPS/WSS for non-localhost
	} else {
		// Fallback for development
		statusCallbackURL = fmt.Sprintf("http://%s/twilio/status-callback", host)
	}

	twiml := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<Response statusCallback="%s">
    <Connect>
        <Stream url="%s">
            <Parameter name="call_id" value="%s" />
            <Parameter name="user_id" value="%s" />
            <Parameter name="business_name" value="%s" />
            <Parameter name="caller_name" value="%s" />
        </Stream>
    </Connect>
    <Pause length="40" />
</Response>`, statusCallbackURL, streamURL, callID, userID, businessName, callerName)

	log.Printf("✅ Generated TwiML for call %s (SID: %s)", callID, callSid)

	// 7. Store mapping and publish event
	mappingData := map[string]string{
		"call_id": callID,
		"user_id": userID,
	}
	if mappingJSON, err := json.Marshal(mappingData); err == nil {
		s.rdb.Set(fmt.Sprintf("call_mapping:%s", callSid), string(mappingJSON), 3600)
	}

	initiatedEvent := map[string]any{
		"event":         "call.initiated",
		"call_id":       callID,
		"call_sid":      callSid,
		"user_id":       userID,
		"from_number":   fromNumber,
		"to_number":     toNumber,
		"business_name": businessName,
		"timestamp":     time.Now().Format(time.RFC3339),
	}
	if eventJSON, err := json.Marshal(initiatedEvent); err == nil {
		s.rdb.Publish("call_events", string(eventJSON))
	}

	c.Data(200, "application/xml", []byte(twiml))
}

func (s *Server) handleTwilioStatusCallback(c *gin.Context) {
	callSid := c.PostForm("CallSid")
	callStatus := c.PostForm("CallStatus")
	duration := c.PostForm("CallDuration")

	log.Printf("📞 Status callback for %s: %s (Duration: %s)", callSid, callStatus, duration)

	if callStatus == "canceled" || callStatus == "no-answer" || callStatus == "busy" || callStatus == "failed" {
		// Find call by SID in notes
		calls, err := s.sbClient.Fetch("calls", fmt.Sprintf("notes=ilike.%%%s%%", callSid))
		if err == nil && len(calls) > 0 {
			call := calls[0]
			status, _ := call["status"].(string)

			// Only update if it's still in "Action Req" status
			if status == "Action Req" {
				newStatus := "Missed"
				if callStatus == "canceled" || callStatus == "failed" {
					newStatus = "Canceled"
				}

				payload := map[string]any{
					"status":           newStatus,
					"summary":          fmt.Sprintf("Call %s before AI could answer.", callStatus),
					"duration_seconds": 0, // Should parse duration if needed
					"updated_at":       time.Now().Format(time.RFC3339),
				}
				s.sbClient.Update("calls", fmt.Sprintf("id=eq.%s", call["id"]), payload)
				log.Printf("✅ Updated stuck call %s status to %s", call["id"], newStatus)
			}
		}
	}

	c.JSON(200, gin.H{"status": "ok"})
}

func (s *Server) handleAPIProxy(c *gin.Context) {
	path := c.Request.URL.Path

	if !strings.HasPrefix(path, "/api/") {
		c.JSON(404, gin.H{"error": "Not found"})
		return
	}

	// Validate path
	if !pathPattern.MatchString(path) {
		log.Printf("⚠️ Invalid path pattern: %s", sanitizeLog(path))
		c.JSON(400, gin.H{"error": "Invalid path"})
		return
	}

	s.proxyRequest(c, s.cfg.PythonAPIURL, path)
}

func (s *Server) proxyRequest(c *gin.Context, baseURL, path string) {
	target := buildProxyURL(baseURL, path)

	// Validate target URL
	if _, err := url.Parse(target); err != nil {
		log.Printf("❌ Invalid proxy URL: %v", err)
		c.JSON(500, gin.H{"error": "Invalid proxy configuration"})
		return
	}

	requestID := c.GetString("request_id")
	log.Printf("🔀 [%s] Proxying %s to: %s", requestID, c.Request.Method, sanitizeURL(target))

	// Read body with size limit
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("❌ [%s] Failed to read body: %v", requestID, err)
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	// Create proxy request with timeout
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, c.Request.Method, target, bytes.NewBuffer(body))
	if err != nil {
		log.Printf("❌ [%s] Failed to create request: %v", requestID, err)
		c.JSON(500, gin.H{"error": "Proxy error"})
		return
	}

	// Copy safe headers
	copySafeHeaders(req, c.Request)
	req.Header.Set("X-Go-Gateway", "true")
	req.Header.Set("X-Request-ID", requestID)
	req.Header.Set("X-Forwarded-For", sanitizeIP(c.ClientIP()))

	// Execute request
	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 10,
			IdleConnTimeout:     90 * time.Second,
			TLSHandshakeTimeout: 10 * time.Second,
			DialContext: (&net.Dialer{
				Timeout:   5 * time.Second,
				KeepAlive: 30 * time.Second,
			}).DialContext,
		},
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ [%s] Proxy request failed: %v", requestID, err)
		c.JSON(502, gin.H{"error": "Backend unavailable"})
		return
	}
	defer resp.Body.Close()

	// Copy response headers
	for k, vv := range resp.Header {
		for _, v := range vv {
			c.Header(k, v)
		}
	}

	// Read response body
	respBody, err := io.ReadAll(io.LimitReader(resp.Body, maxRequestBodySize))
	if err != nil {
		log.Printf("❌ [%s] Failed to read response: %v", requestID, err)
		c.JSON(502, gin.H{"error": "Invalid backend response"})
		return
	}

	log.Printf("✅ [%s] Proxy response: %d (%d bytes)", requestID, resp.StatusCode, len(respBody))
	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), respBody)
}

// Utility functions

func validateConfig(cfg *config.Config) error {
	if cfg.Port == "" {
		return fmt.Errorf("port is required")
	}
	if cfg.SupabaseURL == "" {
		return fmt.Errorf("supabase URL is required")
	}
	if cfg.SupabaseKey == "" {
		return fmt.Errorf("supabase key is required")
	}
	return nil
}

func checkOriginSecure(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return true
	}

	// In production, check against allowedOrigins
	if os.Getenv("ENVIRONMENT") == "production" {
		return allowedOrigins[origin]
	}

	return true
}

func validateTwilioSignature(r *http.Request, authToken, signature, baseURL string) bool {
	// 1. Build the full URL
	// Twilio uses the full URL including protocol, host, and query string
	url := buildFullURL(r, baseURL)

	// 2. Get POST parameters only
	// r.ParseForm() populates both Form (query + post) and PostForm (post only)
	r.ParseForm()
	params := make([]string, 0, len(r.PostForm))
	for k := range r.PostForm {
		params = append(params, k)
	}
	sort.Strings(params)

	// 3. Concatenate: URL + param1 + value1 + param2 + value2...
	var data strings.Builder
	data.WriteString(url)
	for _, k := range params {
		data.WriteString(k)
		// Twilio expects all values for a key to be concatenated if there are multiple
		// but usually there's only one. PostForm[k] is a []string.
		for _, v := range r.PostForm[k] {
			data.WriteString(v)
		}
	}

	// 4. Compute HMAC-SHA1
	mac := hmac.New(sha1.New, []byte(authToken))
	mac.Write([]byte(data.String()))
	computedHash := mac.Sum(nil)
	computedSignature := base64.StdEncoding.EncodeToString(computedHash)

	// Debug logging if it fails (can be removed later)
	if !hmac.Equal([]byte(computedSignature), []byte(signature)) {
		log.Printf("DEBUG: Signature Mismatch")
		log.Printf("DEBUG: Reconstructed URL: %s", url)
		log.Printf("DEBUG: Expected Signature: %s", signature)
		log.Printf("DEBUG: Computed Signature: %s", computedSignature)
	}

	// 5. Constant-time comparison
	return hmac.Equal([]byte(computedSignature), []byte(signature))
}

func buildFullURL(r *http.Request, baseURL string) string {
	// If BaseURL is provided in config, use it as the source of truth for protocol and host
	if baseURL != "" {
		baseURL = strings.TrimSuffix(baseURL, "/")
		return baseURL + r.URL.RequestURI()
	}

	// Otherwise, try to reconstruct from headers (useful for proxies like ngrok)
	scheme := "https"
	if proto := r.Header.Get("X-Forwarded-Proto"); proto != "" {
		scheme = proto
	} else if r.TLS == nil {
		scheme = "http"
	}

	host := r.Host
	if forwardedHost := r.Header.Get("X-Forwarded-Host"); forwardedHost != "" {
		host = forwardedHost
	}

	return fmt.Sprintf("%s://%s%s", scheme, host, r.URL.RequestURI())
}

func validateInput(input string, pattern *regexp.Regexp, maxLen int) bool {
	if input == "" || len(input) > maxLen {
		return false
	}
	return pattern.MatchString(input)
}

func buildProxyURL(baseURL, path string) string {
	baseURL = strings.TrimSuffix(baseURL, "/")
	if strings.Contains(baseURL, "/api") && strings.HasPrefix(path, "/api") {
		baseURL = strings.TrimSuffix(baseURL, "/api")
	}
	return baseURL + path
}

func copySafeHeaders(dst, src *http.Request) {
	safeHeaders := []string{
		"Content-Type",
		"Content-Length",
		"Accept",
		"Accept-Encoding",
		"User-Agent",
	}

	for _, h := range safeHeaders {
		if v := src.Header.Get(h); v != "" {
			dst.Header.Set(h, v)
		}
	}
}

func sanitizeIP(ip string) string {
	// Remove port if present
	if host, _, err := net.SplitHostPort(ip); err == nil {
		return host
	}
	return ip
}

func sanitizeLog(s string) string {
	// Remove potentially dangerous characters for log injection
	s = strings.ReplaceAll(s, "\n", "")
	s = strings.ReplaceAll(s, "\r", "")
	if len(s) > 100 {
		s = s[:100] + "..."
	}
	return s
}

func sanitizeURL(s string) string {
	// Remove sensitive query parameters before logging
	u, err := url.Parse(s)
	if err != nil {
		return "[invalid-url]"
	}

	// Remove sensitive params
	q := u.Query()
	sensitiveParams := []string{"token", "key", "secret", "password", "auth"}
	for _, param := range sensitiveParams {
		if q.Has(param) {
			q.Set(param, "[REDACTED]")
		}
	}
	u.RawQuery = q.Encode()

	return u.String()
}
