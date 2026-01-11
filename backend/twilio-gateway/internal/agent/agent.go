package agent

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"regexp"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"twilio-gateway/internal/appointments"
	"twilio-gateway/internal/business"
	"twilio-gateway/internal/llm"
	"twilio-gateway/internal/redis"
	"twilio-gateway/internal/types"
	"twilio-gateway/internal/voice"
)

// Constants for validation and limits
const (
	MaxTranscriptLength = 2000
	MinTranscriptLength = 1
	MaxHistorySize      = 12
	TTSSendTimeout      = 100 * time.Millisecond
	LLMRequestTimeout   = 30 * time.Second
	ExternalCallTimeout = 10 * time.Second
	LogTimeout          = 5 * time.Second
	BookingTimeout      = 30 * time.Second
	DefaultTimezone     = "America/New_York"
)

// ConversationManager manages the state and logic for a voice call.
type ConversationManager struct {
	LLMClient    *llm.LLMClient
	BizService   *business.BusinessService
	ApptsService *appointments.AppointmentsService
	VoiceService *voice.VoiceService
	Redis        *redis.RedisClient
	UserID       string
	CallID       string

	// Thread-safe conversation history
	History   []llm.Message
	HistoryMu sync.RWMutex

	// Configuration and Metadata
	ContextStr    string
	CallerData    map[string]any
	VoiceSettings *voice.VoiceSettings
	TTSParams     map[string]string
	Timezone      string

	// Thread-safe booking state
	BookingState types.BookingState
	StateMu      sync.RWMutex

	// Atomic message count
	MessageCount  int64
	SystemPrompt  string
	InitializedAt time.Time

	// Precompiled regex for performance and correctness
	phoneRegex        *regexp.Regexp
	emailRegex        *regexp.Regexp
	relativeDateRegex *regexp.Regexp
	timeRegex         *regexp.Regexp

	// Shutdown coordination
	shutdownOnce sync.Once
	shutdownChan chan struct{}
}

// --- CONSTRUCTOR & INITIALIZATION ---

// NewConversationManager initializes the manager and compiles regex patterns.
func NewConversationManager(
	llmClient *llm.LLMClient,
	bizService *business.BusinessService,
	apptsService *appointments.AppointmentsService,
	voiceService *voice.VoiceService,
	redisClient *redis.RedisClient,
	userID, callID string,
	callerData map[string]any,
) (*ConversationManager, error) {
	// Validate required dependencies
	if llmClient == nil {
		return nil, fmt.Errorf("llmClient cannot be nil")
	}
	if bizService == nil {
		return nil, fmt.Errorf("bizService cannot be nil")
	}
	if apptsService == nil {
		return nil, fmt.Errorf("apptsService cannot be nil")
	}
	if voiceService == nil {
		return nil, fmt.Errorf("voiceService cannot be nil")
	}
	if redisClient == nil {
		return nil, fmt.Errorf("redisClient cannot be nil")
	}
	if userID == "" {
		return nil, fmt.Errorf("userID cannot be empty")
	}
	if callID == "" {
		return nil, fmt.Errorf("callID cannot be empty")
	}

	// Initialize with default fast context if available
	businessName := "the business"
	if callerData != nil {
		if name, ok := callerData["business_name"].(string); ok && name != "" {
			businessName = name
		}
	}

	// Ensure callerData is not nil
	if callerData == nil {
		callerData = make(map[string]any)
	}

	return &ConversationManager{
		LLMClient:     llmClient,
		BizService:    bizService,
		ApptsService:  apptsService,
		VoiceService:  voiceService,
		Redis:         redisClient,
		UserID:        userID,
		CallID:        callID,
		History:       make([]llm.Message, 0, MaxHistorySize),
		CallerData:    callerData,
		ContextStr:    fmt.Sprintf("IDENTITY & STYLE:\nBUSINESS NAME: %s\nYou are the AI Assistant for %s.\nCRITICAL RULE: Be extremely concise.", businessName, businessName),
		BookingState:  types.BookingState{},
		Timezone:      DefaultTimezone,
		shutdownChan:  make(chan struct{}),
		InitializedAt: time.Now(),
		// Compile regex once at startup - more strict patterns
		phoneRegex:        regexp.MustCompile(`(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})`),
		emailRegex:        regexp.MustCompile(`(?i)^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`),
		relativeDateRegex: regexp.MustCompile(`(?i)\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|this week)\b`),
		timeRegex:         regexp.MustCompile(`(?i)\b(\d{1,2}:\d{2}\s*(am|pm)|\d{1,2}\s*(am|pm)|morning|afternoon|evening)\b`),
	}, nil
}

// Initialize sets up the conversation manager with business context
func (am *ConversationManager) Initialize(ctx context.Context) error {
	start := time.Now()

	bizCtx, err := am.BizService.GetBusinessContext(am.UserID)
	if err != nil {
		log.Printf("❌ Failed to fetch business context: %v", err)
		return fmt.Errorf("failed to fetch business context: %w", err)
	}

	voiceSettings, err := am.VoiceService.GetVoiceSettings(am.UserID)
	if err != nil {
		log.Printf("⚠️ Failed to fetch voice settings, using defaults: %v", err)
		voiceSettings = &voice.VoiceSettings{
			VoiceName:        "aura-athena-en",
			Language:         "en-US",
			SpeakingRate:     70,
			Volume:           80,
			Pitch:            0,
			ConversationTone: "professional",
		}
	}

	// Extract timezone from business context if available
	timezone := DefaultTimezone
	if bizCtx != nil && bizCtx.Profile != nil {
		if tz, ok := bizCtx.Profile["timezone"].(string); ok && tz != "" {
			timezone = tz
		}
	}

	// Update state under lock
	am.StateMu.Lock()
	am.VoiceSettings = voiceSettings
	am.TTSParams = am.VoiceService.GetTTSParameters(voiceSettings)
	am.Timezone = timezone
	am.StateMu.Unlock()

	am.ContextStr = am.BizService.FormatContextForPrompt(bizCtx)

	// Build system prompt (reads ContextStr, doesn't need lock)
	am.StateMu.RLock()
	language := am.VoiceSettings.Language
	am.StateMu.RUnlock()

	systemPrompt := am.buildSystemPrompt(language)

	// Update history under its own lock
	am.HistoryMu.Lock()
	am.SystemPrompt = systemPrompt
	am.History = append(am.History, llm.Message{Role: "system", Content: systemPrompt})

	// Load memory from Redis (Phase 2)
	historyKey := fmt.Sprintf("history:%s", am.CallID)
	historyData, err := am.Redis.LRange(historyKey, 0, -1)
	if err == nil && len(historyData) > 0 {
		log.Printf("🧠 Loading %d messages from memory for call %s", len(historyData), am.CallID)
		for _, msgJSON := range historyData {
			var msg llm.Message
			if err := json.Unmarshal([]byte(msgJSON), &msg); err == nil {
				am.History = append(am.History, msg)
			}
		}
	}
	am.HistoryMu.Unlock()

	// Update calls (Status: In Progress) - Phase 2
	payload := map[string]any{
		"status":     "in_progress",
		"updated_at": time.Now().Format(time.RFC3339),
	}
	if err := am.BizService.UpdateCall(am.CallID, payload); err != nil {
		log.Printf("⚠️ Failed to update call status to in_progress: %v", err)
	}

	log.Printf("✅ Agent initialized in %.0fms for call %s", float64(time.Since(start).Milliseconds()), am.CallID)
	return nil
}

// --- CORE HANDLERS ---

// HandleTranscript processes user input, manages LLM streaming, and updates state.
func (am *ConversationManager) HandleTranscript(ctx context.Context, transcript string, ttsChan chan<- string) error {
	// Check if shutting down
	select {
	case <-am.shutdownChan:
		return fmt.Errorf("conversation manager is shutting down")
	default:
	}

	// Input validation
	transcript = strings.TrimSpace(transcript)
	if len(transcript) < MinTranscriptLength {
		return nil // Ignore empty input
	}
	if len(transcript) > MaxTranscriptLength {
		transcript = transcript[:MaxTranscriptLength]
		log.Printf("⚠️ Transcript truncated to %d chars for call %s", MaxTranscriptLength, am.CallID)
	}

	// Sanitize input to prevent injection
	transcript = am.sanitizeInput(transcript)

	// Async logging with recovery
	am.safeLogTranscript(am.CallID, "user", transcript)

	// Publish transcript.final event to Redis
	event := types.CallEvent{
		Event:     "transcript.final",
		CallID:    am.CallID,
		UserID:    am.UserID,
		Timestamp: time.Now().Unix(),
		Text:      transcript,
		Data:      transcript, // Backward compatibility
	}
	eventData, _ := json.Marshal(event)
	am.Redis.Publish("call_events", string(eventData))

	// 1. Fastpath: Regex Extraction (Pre-LLM)
	localBookingInfo := am.extractEntitiesLocally(transcript)
	if localBookingInfo != nil {
		am.updateStateFromMap(localBookingInfo)
	}

	// 2. Build messages snapshot
	messages := am.buildMessagesSnapshot(transcript)

	// 3. Increment message count atomically
	atomic.AddInt64(&am.MessageCount, 1)

	// 4. LLM Request with timeout
	llmCtx, cancel := context.WithTimeout(ctx, LLMRequestTimeout)
	defer cancel()

	fullText, err := am.streamLLMResponse(llmCtx, messages, ttsChan)
	if err != nil {
		log.Printf("❌ LLM stream error for call %s: %v", am.CallID, err)

		// Publish llm.error event
		errorEvent := types.CallEvent{
			Event:     "llm.error",
			CallID:    am.CallID,
			UserID:    am.UserID,
			Timestamp: time.Now().Unix(),
			Data:      err.Error(),
		}
		errData, _ := json.Marshal(errorEvent)
		am.Redis.Publish("call_events", string(errData))

		am.sendToTTS(ctx, ttsChan, "I'm having trouble connecting right now. Please hold.")
		return err
	}

	// 5. Post-Processing: Parse Structured Output from LLM
	am.parseBookingUpdate(ctx, fullText, ttsChan)

	// 6. Save to history
	cleanText := am.stripBookingTags(fullText)
	am.appendToHistory("assistant", cleanText)
	am.trimHistory()

	// Publish llm.response event
	respEvent := types.CallEvent{
		Event:     "llm.response",
		CallID:    am.CallID,
		UserID:    am.UserID,
		Timestamp: time.Now().Unix(),
		Text:      cleanText,
		Data:      cleanText, // Backward compatibility
	}
	respData, _ := json.Marshal(respEvent)
	am.Redis.Publish("call_events", string(respData))

	// Async logging
	am.safeLogTranscript(am.CallID, "assistant", cleanText)

	return nil
}

// streamLLMResponse handles the LLM streaming with retry logic and returns the full response
func (am *ConversationManager) streamLLMResponse(ctx context.Context, messages []llm.Message, ttsChan chan<- string) (string, error) {
	maxRetries := 2
	var lastErr error

	for i := 0; i <= maxRetries; i++ {
		if i > 0 {
			log.Printf("🔄 Retrying LLM request (attempt %d/%d) for call %s", i, maxRetries, am.CallID)
			time.Sleep(time.Duration(i*500) * time.Millisecond) // Exponential-ish backoff
		}

		req := llm.ChatCompletionRequest{
			Model:       "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
			Messages:    messages,
			Stream:      true,
			Temperature: 0.2,
			MaxTokens:   250,
		}

		chunkChan := make(chan string, 100)
		errChan := make(chan error, 1)

		streamCtx, cancel := context.WithCancel(ctx)
		defer cancel()

		go func() {
			defer close(chunkChan)
			if err := am.LLMClient.StreamChatCompletion(streamCtx, req, chunkChan); err != nil {
				select {
				case errChan <- err:
				default:
				}
			}
		}()

		var currentSentence strings.Builder
		var fullResponse strings.Builder
		streamFailed := false

		for {
			select {
			case <-ctx.Done():
				return fullResponse.String(), ctx.Err()
			case <-am.shutdownChan:
				return fullResponse.String(), fmt.Errorf("shutdown requested")
			case err := <-errChan:
				lastErr = err
				streamFailed = true
				break
			case chunk, ok := <-chunkChan:
				if !ok {
					// Stream complete, flush remaining
					remaining := strings.TrimSpace(currentSentence.String())
					if remaining != "" && !strings.HasPrefix(remaining, "<booking_update>") {
						am.sendToTTS(ctx, ttsChan, remaining)
					}
					return fullResponse.String(), nil
				}

				currentSentence.WriteString(chunk)
				fullResponse.WriteString(chunk)

				// Sentence boundary detection for TTS
				text := currentSentence.String()

				// Don't send booking tags to TTS
				if strings.Contains(text, "<booking_update>") {
					continue
				}

				if strings.ContainsAny(chunk, ".!?\n") && len(text) > 5 {
					sentence := strings.TrimSpace(text)
					if sentence != "" {
						am.sendToTTS(ctx, ttsChan, sentence)
						currentSentence.Reset()
					}
				}
			}
			if streamFailed {
				break
			}
		}

		if !streamFailed {
			return fullResponse.String(), nil
		}

		// If we're here, stream failed. If it's the last attempt, publish error event.
		if i == maxRetries {
			errorEvent := types.CallEvent{
				Event:     "llm.error",
				CallID:    am.CallID,
				UserID:    am.UserID,
				Timestamp: time.Now().Unix(),
				Data:      fmt.Sprintf("Attempt %d failed: %v", i+1, lastErr),
			}
			errData, _ := json.Marshal(errorEvent)
			am.Redis.Publish("call_events", string(errData))
		}
	}

	return "", lastErr
}

// --- BOOKING LOGIC ---

// BookAppointment attempts to book based on current state.
func (am *ConversationManager) BookAppointment(ctx context.Context) (string, error) {
	// Read state under lock (copy to avoid holding lock during network calls)
	am.StateMu.RLock()
	state := am.BookingState.Copy()
	am.StateMu.RUnlock()

	// Validate required fields
	if state.CustomerName == "" {
		return "", fmt.Errorf("customer name is required for booking")
	}
	if state.PreferredDate == "" {
		return "", fmt.Errorf("preferred date is required for booking")
	}

	log.Printf("📅 Attempting to book for call %s: Name=%s, Date=%s, Time=%s",
		am.CallID, maskPII(state.CustomerName), state.PreferredDate, state.PreferredTime)

	// Get slots (network call without lock)
	slots, err := am.ApptsService.GetAvailableSlots(am.UserID, state.PreferredDate)
	if err != nil {
		log.Printf("⚠️ Error checking available slots: %v. Proceeding with manual booking.", err)
	}

	var slotID string
	var matchedTime string = state.PreferredTime

	// Try to match preferred time if slots are available
	if len(slots) > 0 && state.PreferredTime != "" {
		preferredLower := strings.ToLower(state.PreferredTime)
		for _, slot := range slots {
			slotTimeLower := strings.ToLower(slot.AvailableTime)
			if strings.Contains(slotTimeLower, preferredLower) {
				slotID = slot.ID
				matchedTime = slot.AvailableTime
				break
			}
		}
	}

	// Fall back to first available slot if no match but slots exist
	if slotID == "" && len(slots) > 0 {
		slotID = slots[0].ID
		matchedTime = slots[0].AvailableTime
		log.Printf("📅 Preferred time not available, using first slot: %s", matchedTime)
	}

	// If still no matchedTime, use a default
	if matchedTime == "" {
		matchedTime = "09:00" // Default to 9 AM if nothing specified
	}

	// Book the appointment (network call without lock)
	appointment, err := am.ApptsService.BookAppointment(
		am.UserID,
		state.CustomerName,
		state.CustomerPhone,
		state.CustomerEmail,
		slotID,
		"", // notes
		state.PreferredDate,
		matchedTime,
	)
	if err != nil {
		return "", fmt.Errorf("failed to book appointment: %w", err)
	}

	// Update state with confirmation (under lock)
	am.StateMu.Lock()
	am.BookingState.Confirmed = true
	am.BookingState.ConfirmationNumber = appointment.ID
	am.BookingState.PreferredTime = matchedTime // Update with actual time
	am.StateMu.Unlock()

	confirmationMsg := fmt.Sprintf("Great news! Your appointment is confirmed for %s at %s. Your confirmation number is %s.",
		state.PreferredDate, matchedTime, appointment.ID)

	return confirmationMsg, nil
}

// parseBookingUpdate looks for the <booking_update> JSON block in the LLM response.
func (am *ConversationManager) parseBookingUpdate(ctx context.Context, text string, ttsChan chan<- string) {
	startTag := "<booking_update>"
	endTag := "</booking_update>"

	startIdx := strings.Index(text, startTag)
	if startIdx == -1 {
		return
	}

	startIdx += len(startTag)
	endIdx := strings.Index(text[startIdx:], endTag)
	if endIdx == -1 {
		log.Printf("⚠️ Found booking_update start tag but no end tag for call %s", am.CallID)
		return
	}

	jsonStr := strings.TrimSpace(text[startIdx : startIdx+endIdx])

	var update map[string]any
	if err := json.Unmarshal([]byte(jsonStr), &update); err != nil {
		log.Printf("⚠️ Failed to parse booking JSON for call %s: %v", am.CallID, err)
		return
	}

	am.updateStateFromMap(update)

	// Trigger booking if confirmed
	if confirmed, ok := update["booking_confirmed"].(bool); ok && confirmed {
		log.Printf("🎯 LLM signaled booking confirmation for call %s", am.CallID)
		if am.canAttemptBooking() {
			am.attemptBookingAsync(ctx, ttsChan)
		} else {
			am.StateMu.RLock()
			hasName := am.BookingState.CustomerName != ""
			hasDate := am.BookingState.PreferredDate != ""
			isAlreadyConfirmed := am.BookingState.ConfirmationNumber != ""
			am.StateMu.RUnlock()
			log.Printf("⚠️ Cannot attempt booking for call %s: hasName=%v, hasDate=%v, alreadyConfirmed=%v",
				am.CallID, hasName, hasDate, isAlreadyConfirmed)
		}
	}
}

// attemptBookingAsync handles booking in a goroutine with proper error handling
func (am *ConversationManager) attemptBookingAsync(ctx context.Context, ttsChan chan<- string) {
	log.Printf("🚀 Starting async booking for call %s", am.CallID)
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("❌ BookAppointment panic recovered for call %s: %v", am.CallID, r)
			}
		}()

		bookCtx, cancel := context.WithTimeout(context.Background(), BookingTimeout)
		defer cancel()

		result, err := am.BookAppointment(bookCtx)
		if err != nil {
			log.Printf("❌ Booking failed for call %s: %v", am.CallID, err)
			am.sendToTTS(ctx, ttsChan, "I'm sorry, there was an issue completing your booking. Let me try again or connect you with someone who can help.")
			return
		}

		log.Printf("✅ Booking successful for call %s: %s", am.CallID, result)
		am.sendToTTS(ctx, ttsChan, result)
	}()
}

// --- STATE MANAGEMENT ---

// updateStateFromMap updates the BookingState struct from a map.
func (am *ConversationManager) updateStateFromMap(data map[string]any) {
	am.StateMu.Lock()
	defer am.StateMu.Unlock()

	am.BookingState.LastUpdated = time.Now()
	am.BookingState.MessagesInBooking = atomic.LoadInt64(&am.MessageCount)

	if v, ok := data["is_booking"].(bool); ok {
		am.BookingState.IsBooking = v
	}
	if v, ok := data["customer_name"].(string); ok && v != "" {
		am.BookingState.CustomerName = strings.TrimSpace(v)
	}
	if v, ok := data["customer_phone"].(string); ok && v != "" {
		am.BookingState.CustomerPhone = strings.TrimSpace(v)
	}
	if v, ok := data["customer_email"].(string); ok && v != "" {
		am.BookingState.CustomerEmail = strings.ToLower(strings.TrimSpace(v))
	}
	if v, ok := data["preferred_date"].(string); ok && v != "" {
		am.BookingState.PreferredDate = strings.TrimSpace(v)
	}
	if v, ok := data["preferred_time"].(string); ok && v != "" {
		am.BookingState.PreferredTime = strings.TrimSpace(v)
	}
	if v, ok := data["booking_confirmed"].(bool); ok {
		am.BookingState.Confirmed = v
	}

	log.Printf("📊 Updated booking state for call %s: IsBooking=%v, HasName=%v, HasDate=%v",
		am.CallID, am.BookingState.IsBooking, am.BookingState.CustomerName != "", am.BookingState.PreferredDate != "")
}

// UpdateContext updates the business context and regenerates the system prompt
func (am *ConversationManager) UpdateContext(contextStr string) {
	am.StateMu.Lock()
	am.ContextStr = contextStr
	language := "en-US"
	if am.VoiceSettings != nil {
		language = am.VoiceSettings.Language
	}
	am.StateMu.Unlock()

	systemPrompt := am.buildSystemPrompt(language)

	am.HistoryMu.Lock()
	defer am.HistoryMu.Unlock()

	am.SystemPrompt = systemPrompt
	if len(am.History) > 0 && am.History[0].Role == "system" {
		am.History[0].Content = systemPrompt
	} else {
		// If no system message, insert at beginning
		newHistory := append([]llm.Message{{Role: "system", Content: systemPrompt}}, am.History...)
		am.History = newHistory
	}
	log.Printf("🔄 Agent context updated for call %s", am.CallID)
}

// UpdateVoiceSettings updates voice settings thread-safely
func (am *ConversationManager) UpdateVoiceSettings(settings *voice.VoiceSettings) {
	if settings == nil {
		log.Printf("⚠️ Attempted to update with nil voice settings for call %s", am.CallID)
		return
	}

	am.StateMu.Lock()
	am.VoiceSettings = settings
	am.TTSParams = am.VoiceService.GetTTSParameters(settings)
	am.StateMu.Unlock()

	// Rebuild system prompt with new language
	newPrompt := am.buildSystemPrompt(settings.Language)

	am.HistoryMu.Lock()
	am.SystemPrompt = newPrompt
	if len(am.History) > 0 {
		am.History[0].Content = newPrompt
	}
	am.HistoryMu.Unlock()

	log.Printf("🎤 Updated voice settings for call %s: voice=%s, lang=%s",
		am.CallID, settings.VoiceName, settings.Language)
}

// --- SHUTDOWN & LIFECYCLE ---

// Shutdown gracefully shuts down the conversation manager
func (am *ConversationManager) Shutdown(ctx context.Context) error {
	var shutdownErr error

	am.shutdownOnce.Do(func() {
		log.Printf("🛑 Shutting down conversation manager for call %s", am.CallID)

		// Signal shutdown
		close(am.shutdownChan)

		// Get final state for persistence
		am.HistoryMu.RLock()
		history := make([]llm.Message, len(am.History))
		copy(history, am.History)
		am.HistoryMu.RUnlock()

		am.StateMu.RLock()
		state := am.BookingState.Copy()
		am.StateMu.RUnlock()

		// Calculate duration
		duration := time.Since(am.InitializedAt)
		durationSeconds := int(duration.Seconds())

		// Publish call.ended event
		endEvent := types.CallEvent{
			Event:     "call.ended",
			CallID:    am.CallID,
			UserID:    am.UserID,
			Timestamp: time.Now().Unix(),
			Duration:  durationSeconds,
		}
		endData, _ := json.Marshal(endEvent)
		am.Redis.Publish("call_events", string(endData))

		// Persist conversation state
		if err := am.BizService.SaveConversationState(am.CallID, history, state, durationSeconds); err != nil {
			log.Printf("⚠️ Failed to save conversation state for call %s: %v", am.CallID, err)
			shutdownErr = err
		}

		// Log final stats
		messageCount := atomic.LoadInt64(&am.MessageCount)
		log.Printf("📊 Call %s completed: duration=%v, messages=%d, booking_confirmed=%v",
			am.CallID, duration.Round(time.Second), messageCount, state.Confirmed)
	})

	return shutdownErr
}

// Reset clears the conversation state for reuse (e.g., call transfer)
func (am *ConversationManager) Reset() {
	am.HistoryMu.Lock()
	// Keep only system prompt
	if len(am.History) > 0 {
		am.History = []llm.Message{am.History[0]}
	} else {
		am.History = []llm.Message{}
	}
	am.HistoryMu.Unlock()

	am.StateMu.Lock()
	am.BookingState = types.BookingState{}
	am.StateMu.Unlock()

	atomic.StoreInt64(&am.MessageCount, 0)

	log.Printf("🔄 Reset conversation manager for call %s", am.CallID)
}

// --- HELPERS ---

// buildSystemPrompt creates the system prompt for the LLM
func (am *ConversationManager) buildSystemPrompt(language string) string {
	callerName := ""
	if name, ok := am.CallerData["caller_name"].(string); ok {
		callerName = name
	}

	callerContext := ""
	callerStatus := "new"
	if callerName != "" {
		callerContext = fmt.Sprintf("\nCALLER PROFILE:\n- Name: %s\n- Status: Returning customer (greet by name)\n- Note: Show recognition and appreciation for their loyalty\n", callerName)
		callerStatus = "returning"
	} else {
		callerContext = "\nCALLER PROFILE:\n- Status: New customer\n- Note: Make them feel welcome and valued\n"
	}

	return fmt.Sprintf(`═══════════════════════════════════════════════════════════════════════════════
AI VOICE RECEPTIONIST SYSTEM PROMPT (PRO VERSION)
═══════════════════════════════════════════════════════════════════════════════

BUSINESS CONTEXT:
%s
%s

CURRENT TIME: %s
CALLER TYPE: %s
LANGUAGE: %s

═══════════════════════════════════════════════════════════════════════════════
CORE MISSION & INSTRUCTIONS
═══════════════════════════════════════════════════════════════════════════════

1. **PRIMARY OBJECTIVE**: You are the voice of the business. Be professional, empathetic, and efficient.
2. **VOICE CONSTRAINTS**: 
   - Keep responses concise (under 25 seconds spoken).
   - Use natural language (no robotic lists).
   - If the user cuts you off, adapt immediately in the next turn.
3. **BOOKING PROTOCOL (STRUCTURED OUTPUT)**:
   - When you detect a user wants to book, switch to booking mode.
   - You MUST output a JSON block at the very end of your response if you updated any booking details.
   - Do not speak the JSON block. Just append it.
   - Format: <booking_update>{"key": "value"}</booking_update>
   - Keys: "customer_name", "customer_phone", "customer_email", "preferred_date", "preferred_time".
   - **CRITICAL**: If the user says "yes", "confirmed", "that works", or otherwise agrees to a specific date and time you offered, you MUST include: "booking_confirmed": true.
   - Once "booking_confirmed": true is sent, the system will process the booking in the background.
4. **INTENT DETECTION**:
   - If the user asks about hours, services, or pricing, answer directly from the context.
   - If the user says "transfer", "operator", or "human", ask for the reason and say "I'll connect you shortly."

═══════════════════════════════════════════════════════════════════════════════
START CONVERSATION
`, am.ContextStr, callerContext, am.getCurrentTimeForBusiness(), callerStatus, language)
}

// buildMessagesSnapshot creates a copy of messages for LLM request
func (am *ConversationManager) buildMessagesSnapshot(transcript string) []llm.Message {
	am.HistoryMu.Lock()
	am.History = append(am.History, llm.Message{Role: "user", Content: transcript})
	messages := make([]llm.Message, len(am.History))
	copy(messages, am.History)
	am.HistoryMu.Unlock()

	// Read booking state under its lock
	am.StateMu.RLock()
	isBooking := am.BookingState.IsBooking
	state := am.BookingState.Copy()
	am.StateMu.RUnlock()

	// Inject booking state if active
	if isBooking {
		stateMsg := llm.Message{
			Role:    "system",
			Content: fmt.Sprintf("[CURRENT BOOKING STATE: Name=%q, Phone=%q, Email=%q, Date=%q, Time=%q. If missing info, ask for it naturally.]", state.CustomerName, maskPhone(state.CustomerPhone), maskEmail(state.CustomerEmail), state.PreferredDate, state.PreferredTime),
		}
		// Inject after main system prompt
		if len(messages) > 0 {
			messages = append([]llm.Message{messages[0], stateMsg}, messages[1:]...)
		}
	}

	return messages
}

// extractEntitiesLocally runs regex matching on the raw transcript.
func (am *ConversationManager) extractEntitiesLocally(transcript string) map[string]any {
	info := make(map[string]any)
	lower := strings.ToLower(transcript)

	// Intent Detection
	if strings.Contains(lower, "book") || strings.Contains(lower, "schedule") || strings.Contains(lower, "appointment") || strings.Contains(lower, "reserve") {
		info["is_booking"] = true
	}

	// Phone extraction
	if match := am.phoneRegex.FindString(transcript); match != "" {
		info["customer_phone"] = match
	}

	// Email extraction - need to find potential emails first, then validate
	for word := range strings.FieldsSeq(transcript) {
		word = strings.Trim(word, ".,;:!?")
		if strings.Contains(word, "@") && am.emailRegex.MatchString(word) {
			info["customer_email"] = word
			break
		}
	}

	// Date/Time capture
	if match := am.relativeDateRegex.FindString(transcript); match != "" {
		info["preferred_date"] = strings.ToLower(match)
	}
	if match := am.timeRegex.FindString(transcript); match != "" {
		info["preferred_time"] = strings.ToLower(match)
	}

	if len(info) > 0 {
		log.Printf("📝 Extracted entities for call %s: %d fields", am.CallID, len(info))
		return info
	}
	return nil
}

// trimHistory keeps history within bounds while preserving context
func (am *ConversationManager) trimHistory() {
	am.HistoryMu.Lock()
	defer am.HistoryMu.Unlock()

	if len(am.History) <= MaxHistorySize {
		return
	}

	// Keep: system prompt + context summary + last N messages
	systemPrompt := am.History[0]

	// Get current booking state for summary
	am.StateMu.RLock()
	state := am.BookingState.Copy()
	am.StateMu.RUnlock()

	droppedCount := len(am.History) - MaxHistorySize + 2

	summary := llm.Message{
		Role: "system",
		Content: fmt.Sprintf("[CONTEXT: %d earlier messages summarized. Booking state: IsBooking=%v, Name=%q, Date=%q, Time=%q]",
			droppedCount, state.IsBooking, state.CustomerName, state.PreferredDate, state.PreferredTime),
	}

	// Keep system prompt, summary, and last (MaxHistorySize-2) messages
	keepFrom := len(am.History) - (MaxHistorySize - 2)
	am.History = append([]llm.Message{systemPrompt, summary}, am.History[keepFrom:]...)
}

// appendToHistory adds a message to history thread-safely and persists to Redis
func (am *ConversationManager) appendToHistory(role, content string) {
	am.HistoryMu.Lock()
	msg := llm.Message{Role: role, Content: content}
	am.History = append(am.History, msg)
	am.HistoryMu.Unlock()

	// Persist to Redis (Queue-like list)
	go func() {
		data, _ := json.Marshal(msg)
		am.Redis.Client.RPush(context.Background(), fmt.Sprintf("history:%s", am.CallID), string(data))
		am.Redis.Client.Expire(context.Background(), fmt.Sprintf("history:%s", am.CallID), 1*time.Hour)
	}()
}

// LoadHistory loads conversation history from Redis
func (am *ConversationManager) LoadHistory(ctx context.Context) error {
	key := fmt.Sprintf("history:%s", am.CallID)
	historyData, err := am.Redis.Client.LRange(ctx, key, 0, -1).Result()
	if err != nil {
		return err
	}

	if len(historyData) > 0 {
		am.HistoryMu.Lock()
		defer am.HistoryMu.Unlock()

		// Preserve system prompt if it exists
		var systemPrompt *llm.Message
		if len(am.History) > 0 && am.History[0].Role == "system" {
			systemPrompt = &am.History[0]
		}

		am.History = make([]llm.Message, 0, len(historyData)+1)
		if systemPrompt != nil {
			am.History = append(am.History, *systemPrompt)
		}

		for _, item := range historyData {
			var msg llm.Message
			if err := json.Unmarshal([]byte(item), &msg); err == nil {
				am.History = append(am.History, msg)
			}
		}
		log.Printf("📚 Loaded %d messages from history for call %s", len(am.History), am.CallID)
	}
	return nil
}

// GetInitialGreeting returns the greeting message for the call
func (am *ConversationManager) GetInitialGreeting() string {
	businessName := "the business"
	if am.ContextStr != "" {
		for line := range strings.SplitSeq(am.ContextStr, "\n") {
			if prefix, ok := strings.CutPrefix(line, "BUSINESS NAME:"); ok {
				businessName = strings.TrimSpace(prefix)
				break
			}
			if strings.Contains(line, "AI Assistant for") {
				// Fallback: Extract from "You are the AI Assistant for [Name]."
				parts := strings.Split(line, "AI Assistant for")
				if len(parts) > 1 {
					name := strings.Trim(parts[1], " .")
					if name != "" {
						businessName = name
						break
					}
				}
			}
		}
	}

	var greeting string

	am.StateMu.RLock()
	voiceSettings := am.VoiceSettings
	am.StateMu.RUnlock()

	if voiceSettings != nil {
		greeting = am.VoiceService.GetGreetingPrompt(voiceSettings, businessName)
	} else {
		greeting = fmt.Sprintf("Thank you for calling %s. How can I help you today?", businessName)
	}

	if am.CallerData != nil {
		if name, ok := am.CallerData["caller_name"].(string); ok && name != "" && name != "Unknown" {
			tone := "professional"
			if voiceSettings != nil {
				tone = voiceSettings.ConversationTone
			}

			switch tone {
			case "casual":
				greeting = fmt.Sprintf("Hey %s! Thanks for calling %s again. What can I help with?", name, businessName)
			case "friendly":
				greeting = fmt.Sprintf("Welcome back %s! Great to hear from you at %s! How can I help you today?", name, businessName)
			default:
				greeting = fmt.Sprintf("Welcome back %s! Thank you for calling %s again. How can I help you today?", name, businessName)
			}
			log.Printf("🎤 Updated greeting for returning customer: %s", maskPII(name))
		}
	}

	log.Printf("🎤 Generated greeting (length: %d)", len(greeting))
	return greeting
}

// maskPII masks personally identifiable information for logging
func maskPII(s string) string {
	if len(s) == 0 {
		return ""
	}
	if len(s) <= 2 {
		return "***"
	}
	return s[:1] + strings.Repeat("*", len(s)-2) + s[len(s)-1:]
}

// maskPhone masks phone numbers for logging
func maskPhone(phone string) string {
	if len(phone) < 4 {
		return "***"
	}
	return strings.Repeat("*", len(phone)-4) + phone[len(phone)-4:]
}

// maskEmail masks email addresses for logging
func maskEmail(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return "***@***"
	}
	return maskPII(parts[0]) + "@" + parts[1]
}

// sanitizeInput removes potential injection markers from input
func (am *ConversationManager) sanitizeInput(s string) string {
	// Remove potential prompt injection markers
	s = strings.ReplaceAll(s, "<booking_update>", "")
	s = strings.ReplaceAll(s, "</booking_update>", "")
	s = strings.ReplaceAll(s, "<system>", "")
	s = strings.ReplaceAll(s, "</system>", "")
	return s
}

// getCurrentTimeForBusiness returns current time in business timezone
func (am *ConversationManager) getCurrentTimeForBusiness() string {
	loc, err := time.LoadLocation(am.Timezone)
	if err != nil {
		log.Printf("⚠️ Invalid timezone %s, using UTC: %v", am.Timezone, err)
		loc = time.UTC
	}
	return time.Now().In(loc).Format("3:04 PM MST")
}

// sendToTTS sends text to TTS channel with timeout (non-blocking)
func (am *ConversationManager) sendToTTS(ctx context.Context, ttsChan chan<- string, text string) bool {
	if text == "" || ttsChan == nil {
		return false
	}

	select {
	case ttsChan <- text:
		return true
	case <-time.After(TTSSendTimeout):
		truncated := text
		if len(truncated) > 50 {
			truncated = truncated[:50] + "..."
		}
		log.Printf("⚠️ TTS channel slow, dropping: %s", truncated)
		return false
	case <-ctx.Done():
		return false
	case <-am.shutdownChan:
		return false
	}
}

// safeLogTranscript logs transcript asynchronously with recovery
func (am *ConversationManager) safeLogTranscript(callID, role, content string) {
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("❌ LogTranscript panic recovered: %v", r)
			}
		}()

		if err := am.BizService.LogTranscript(callID, role, content); err != nil {
			log.Printf("⚠️ Failed to log transcript: %v", err)
		}
	}()
}

// stripBookingTags removes the JSON tags from text before saving to history.
func (am *ConversationManager) stripBookingTags(text string) string {
	startTag := "<booking_update>"
	if before, _, found := strings.Cut(text, startTag); found {
		return strings.TrimSpace(before)
	}
	return text
}

// canAttemptBooking checks if we have minimum required info for booking
func (am *ConversationManager) canAttemptBooking() bool {
	am.StateMu.RLock()
	defer am.StateMu.RUnlock()
	return am.BookingState.CustomerName != "" &&
		am.BookingState.PreferredDate != "" &&
		am.BookingState.ConfirmationNumber == "" // Only book if not already booked in database
}

// GetBookingState returns a copy of the current booking state
func (am *ConversationManager) GetBookingState() types.BookingState {
	am.StateMu.RLock()
	defer am.StateMu.RUnlock()
	return am.BookingState.Copy()
}

// GetHistory returns a copy of the conversation history
func (am *ConversationManager) GetHistory() []llm.Message {
	am.HistoryMu.RLock()
	defer am.HistoryMu.RUnlock()
	history := make([]llm.Message, len(am.History))
	copy(history, am.History)
	return history
}

// GetMessageCount returns the current message count
func (am *ConversationManager) GetMessageCount() int64 {
	return atomic.LoadInt64(&am.MessageCount)
}

// IsActive checks if the conversation manager is still active
func (am *ConversationManager) IsActive() bool {
	select {
	case <-am.shutdownChan:
		return false
	default:
		return true
	}
}
