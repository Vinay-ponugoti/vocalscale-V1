package business

import (
	"fmt"
	"log"
	"net/url"
	"strings"
	"sync"
	"time"
	"twilio-gateway/internal/llm"
	"twilio-gateway/internal/supabase"
	"twilio-gateway/internal/types"
)

type BusinessService struct {
	Supabase *supabase.Client
	cache    sync.Map // userID -> *cachedContext
}

type cachedContext struct {
	context   *BusinessContext
	expiresAt time.Time
}

func NewBusinessService(s *supabase.Client) *BusinessService {
	return &BusinessService{
		Supabase: s,
	}
}

type BusinessContext struct {
	Profile       map[string]any
	VoiceSettings map[string]any
	Hours         []map[string]any
	Services      []map[string]any
	Requirements  []map[string]any
	UrgentRules   []map[string]any
}

func (b *BusinessService) LookupBusinessByNumber(toNumber string) (userID string, businessName string, isActive bool, subStatus string, err error) {
	// 1. Try candidates for various formats
	candidates := []string{strings.TrimSpace(toNumber)}

	// Format 2: 8642074768 (Strip +1)
	cleanNum := strings.TrimPrefix(strings.TrimSpace(toNumber), "+")
	if strings.HasPrefix(cleanNum, "1") && len(cleanNum) == 11 {
		candidates = append(candidates, cleanNum[1:])
	} else if len(cleanNum) == 10 {
		candidates = append(candidates, cleanNum)
	}

	// Format 3: 18642074768 (Strip +)
	if strings.HasPrefix(toNumber, "+") {
		candidates = append(candidates, toNumber[1:])
	}

	// Format 4: (864) 207-4768 (Local format often used in DB)
	if len(cleanNum) == 10 || (strings.HasPrefix(cleanNum, "1") && len(cleanNum) == 11) {
		base := cleanNum
		if len(base) == 11 {
			base = base[1:]
		}
		localFmt := fmt.Sprintf("(%s) %s-%s", base[0:3], base[3:6], base[6:10])
		candidates = append(candidates, localFmt)

		// Format 5: 864.207.4768 (Dot format)
		dotFmt := fmt.Sprintf("%s.%s.%s", base[0:3], base[3:6], base[6:10])
		candidates = append(candidates, dotFmt)

		// Format 6: 864-207-4768 (Dash format)
		dashFmt := fmt.Sprintf("%s-%s-%s", base[0:3], base[3:6], base[6:10])
		candidates = append(candidates, dashFmt)
	}

	log.Printf("🔍 Checking candidates for business lookup: %v", candidates)

	// Check 'phone_numbers' table
	var inParts []string
	uniqueCandidates := make(map[string]bool)
	for _, c := range candidates {
		if !uniqueCandidates[c] {
			inParts = append(inParts, fmt.Sprintf("\"%s\"", c))
			uniqueCandidates[c] = true
		}
	}
	inQuery := strings.Join(inParts, ",")

	queryParams := url.Values{}
	queryParams.Set("phone_number", fmt.Sprintf("in.(%s)", inQuery))

	nums, err := b.Supabase.Fetch("phone_numbers", queryParams.Encode())
	if err != nil {
		log.Printf("❌ Supabase fetch error from phone_numbers: %v", err)
	}

	if err == nil && len(nums) > 0 {
		record := nums[0]
		userID, _ = record["user_id"].(string)
		status, _ := record["status"].(string)
		// Case-insensitive check for "active"
		isActive = (strings.ToLower(status) == "active")

		log.Printf("✅ Found phone number record for %s (User: %s, Status: %s, Active: %v)", toNumber, userID, status, isActive)

		// Fetch business details including subscription status
		bizRes, err := b.Supabase.Fetch("businesses", fmt.Sprintf("user_id=eq.%s&select=business_name,subscription_status", userID))
		if err == nil && len(bizRes) > 0 {
			businessName, _ = bizRes[0]["business_name"].(string)
			subStatus, _ = bizRes[0]["subscription_status"].(string)

			// Check if active (Phase 1 Rule)
			isPremium := (strings.ToLower(subStatus) == "active" || strings.ToLower(subStatus) == "trialing")
			if !isPremium {
				log.Printf("⚠️ Business %s (User: %s) has no active subscription (Status: %s). Access denied.", businessName, userID, subStatus)
				isActive = false
			}
		}
		if businessName == "" {
			businessName = "the business"
		}
		return userID, businessName, isActive, subStatus, nil
	}

	// Fallback to 'businesses' table - try all format candidates
	fallbackInParts := []string{}
	for _, c := range candidates {
		fallbackInParts = append(fallbackInParts, fmt.Sprintf("\"%s\"", c))
	}
	fallbackInQuery := strings.Join(fallbackInParts, ",")

	fallbackParams := url.Values{}
	fallbackParams.Set("phone", fmt.Sprintf("in.(%s)", fallbackInQuery))
	fallbackParams.Set("select", "user_id,business_name,subscription_status")

	bizRes, err := b.Supabase.Fetch("businesses", fallbackParams.Encode())
	if err == nil && len(bizRes) > 0 {
		userID, _ = bizRes[0]["user_id"].(string)
		businessName, _ = bizRes[0]["business_name"].(string)
		subStatus, _ = bizRes[0]["subscription_status"].(string)

		// Check if active
		isPremium := (strings.ToLower(subStatus) == "active" || strings.ToLower(subStatus) == "trialing")
		isActive = isPremium

		if !isPremium {
			log.Printf("⚠️ Business %s (User: %s) found via fallback has no active subscription (Status: %s). Access denied.", businessName, userID, subStatus)
		} else {
			log.Printf("✅ Found business record for %s (User: %s)", toNumber, userID)
		}
		return userID, businessName, isActive, subStatus, nil
	}

	return "", "", false, "", fmt.Errorf("no business found for number %s", toNumber)
}

func (b *BusinessService) CreateCallRecord(userID, fromNumber, callSid string) (string, error) {
	newCall := map[string]any{
		"user_id":      userID,
		"caller_phone": fromNumber,
		"caller_name":  "Unknown",
		"status":       "Action Req",
		"category":     "General",
		"created_at":   time.Now().Format(time.RFC3339),
		"is_urgent":    false,
		"notes":        fmt.Sprintf("Twilio Call SID: %s", callSid),
	}

	res, err := b.Supabase.InsertWithResponse("calls", newCall)
	if err != nil {
		return "", err
	}

	if len(res) > 0 {
		if id, ok := res[0]["id"].(string); ok {
			return id, nil
		}
	}

	return "", fmt.Errorf("failed to create call record")
}

func (b *BusinessService) GetReturningCallerName(fromNumber, userID string) (string, bool) {
	if fromNumber == "" || userID == "" {
		return "Unknown", false
	}

	// Check if caller was seen in last 1 hour
	oneHourAgo := time.Now().Add(-1 * time.Hour).Format(time.RFC3339)
	query := fmt.Sprintf("caller_phone=eq.%s&user_id=eq.%s&created_at=gt.%s&caller_name=not.is.null&caller_name=neq.Unknown&order=created_at.desc&limit=1", fromNumber, userID, oneHourAgo)

	calls, err := b.Supabase.Fetch("calls", query)
	if err == nil && len(calls) > 0 {
		name, _ := calls[0]["caller_name"].(string)
		if name != "" && name != "Unknown" {
			return name, true
		}
	}

	return "Unknown", false
}

func (b *BusinessService) GetBusinessContext(userID string) (*BusinessContext, error) {
	// Check cache first
	if val, ok := b.cache.Load(userID); ok {
		cached := val.(*cachedContext)
		if time.Now().Before(cached.expiresAt) {
			log.Printf("⚡ [CACHE HIT] Business context for UserID: %s", userID)
			return cached.context, nil
		}
	}

	log.Printf("🔍 [CACHE MISS] Fetching business context for UserID: %s", userID)

	// Parallel fetch: business + voice settings in single query
	businesses, err := b.Supabase.Fetch("businesses", fmt.Sprintf("user_id=eq.%s&select=*,voice_settings(*,voice:voices(*))", userID))
	if err != nil {
		log.Printf("❌ Error fetching business: %v", err)
		return nil, err
	}

	var businessData map[string]any
	var voiceSettings map[string]any

	if len(businesses) > 0 {
		businessData = businesses[0]
		if vsList, ok := businessData["voice_settings"].([]any); ok && len(vsList) > 0 {
			voiceSettings = vsList[0].(map[string]any)
		}
	} else {
		log.Printf("⚠️ No business record found for UserID: %s - using fallback", userID)
		vs, err := b.Supabase.Fetch("voice_settings", fmt.Sprintf("user_id=eq.%s&select=*,voice:voices(*)", userID))
		if err == nil && len(vs) > 0 {
			voiceSettings = vs[0]
		}
	}

	ctx := &BusinessContext{
		Profile:       businessData,
		VoiceSettings: voiceSettings,
	}

	if businessData != nil {
		businessID := ""
		if id, ok := businessData["id"].(string); ok {
			businessID = id
		}

		if businessID != "" {
			// PARALLEL FETCH: Fetch all related data concurrently
			hoursCh := make(chan []map[string]any)
			servicesCh := make(chan []map[string]any)
			requirementsCh := make(chan []map[string]any)
			rulesCh := make(chan []map[string]any)

			go func() {
				hours, err := b.Supabase.Fetch("business_hours", fmt.Sprintf("business_id=eq.%s", businessID))
				if err != nil {
					log.Printf("❌ Error fetching business_hours: %v", err)
				}
				hoursCh <- hours
			}()

			go func() {
				services, err := b.Supabase.Fetch("services", fmt.Sprintf("business_id=eq.%s", businessID))
				if err != nil {
					log.Printf("❌ Error fetching services: %v", err)
				}
				servicesCh <- services
			}()

			go func() {
				requirements, err := b.Supabase.Fetch("booking_requirements", fmt.Sprintf("business_id=eq.%s", businessID))
				if err != nil {
					log.Printf("❌ Error fetching booking_requirements: %v", err)
				}
				requirementsCh <- requirements
			}()

			go func() {
				rules, err := b.Supabase.Fetch("urgent_call_rules", fmt.Sprintf("business_id=eq.%s", businessID))
				if err != nil {
					log.Printf("❌ Error fetching urgent_call_rules: %v", err)
				}
				rulesCh <- rules
			}()

			// Collect results
			ctx.Hours = <-hoursCh
			ctx.Services = <-servicesCh
			ctx.Requirements = <-requirementsCh
			ctx.UrgentRules = <-rulesCh
		}
	}

	// Store in cache for 5 minutes
	b.cache.Store(userID, &cachedContext{
		context:   ctx,
		expiresAt: time.Now().Add(5 * time.Minute),
	})

	return ctx, nil
}

func (b *BusinessService) GetCallerData(phoneNumber string, userID string) map[string]any {
	if phoneNumber == "" || phoneNumber == "Unknown" {
		return map[string]any{}
	}

	query := fmt.Sprintf("caller_phone=eq.%s&caller_name=not.is.null&caller_name=neq.Unknown&caller_name=neq.Unknown%%20Caller&order=created_at.desc&limit=1", phoneNumber)
	if userID != "" {
		query += fmt.Sprintf("&user_id=eq.%s", userID)
	}

	calls, err := b.Supabase.Fetch("calls", query)
	if err == nil && len(calls) > 0 {
		return map[string]any{
			"name":               calls[0]["caller_name"],
			"phone":              phoneNumber,
			"returning_customer": true,
		}
	}

	return map[string]any{
		"name":               nil,
		"phone":              phoneNumber,
		"returning_customer": false,
	}
}

func (b *BusinessService) LogTranscript(callID string, role string, content string) error {
	// Real-time transcript table 'transcripts' is missing in schema.
	// We save the full transcript at the end of the call in SaveConversationState.
	log.Printf("📝 [%s] %s: %s", callID, role, content)
	return nil
}

func (b *BusinessService) UpdateCall(callID string, payload map[string]any) error {
	return b.Supabase.Update("calls", fmt.Sprintf("id=eq.%s", callID), payload)
}

func (b *BusinessService) UpdateCallStatus(callID string, status string) error {
	payload := map[string]any{
		"status": status,
	}
	return b.UpdateCall(callID, payload)
}

func (b *BusinessService) SaveConversationState(callID string, history []llm.Message, bookingState types.BookingState, durationSeconds int) error {
	// Format transcript into a readable string
	var sb strings.Builder
	messageCount := 0
	for _, msg := range history {
		if msg.Role == "system" {
			continue
		}
		messageCount++
		role := "User"
		if msg.Role == "assistant" {
			role = "AI"
		}
		fmt.Fprintf(&sb, "%s: %s\n", role, msg.Content)
	}
	transcript := sb.String()

	payload := map[string]any{
		"transcript":       transcript,
		"full_transcript":  transcript,
		"duration_seconds": durationSeconds,
		"updated_at":       time.Now().Format(time.RFC3339),
	}

	// Map booking state fields to top-level call columns for better visibility in dashboard
	if bookingState.CustomerName != "" {
		payload["caller_name"] = bookingState.CustomerName
	}
	if bookingState.CustomerPhone != "" {
		payload["caller_phone"] = bookingState.CustomerPhone
	}

	// If we have an appointment, store it in notes since appointment_id column is missing
	if bookingState.ConfirmationNumber != "" {
		payload["notes"] = fmt.Sprintf("Appointment booked: %s", bookingState.ConfirmationNumber)
	}

	// Update status and category based on outcome
	if messageCount <= 1 {
		// Very short call with no real interaction
		payload["status"] = "Missed"
	} else if bookingState.Confirmed {
		payload["status"] = "Completed"
		payload["category"] = "Booking"
	} else if bookingState.IsBooking {
		// If they were in the middle of booking but didn't finish, mark as action required
		payload["status"] = "Action Req"
		payload["category"] = "Booking"
	} else {
		// Regular inquiry call completed
		payload["status"] = "Completed"
	}

	// Try to update the call record with the conversation state
	log.Printf("💾 Saving conversation state for call %s to Supabase...", callID)
	err := b.Supabase.Update("calls", fmt.Sprintf("id=eq.%s", callID), payload)
	if err != nil {
		log.Printf("❌ Failed to save conversation state for call %s: %v", callID, err)
		return err
	}
	log.Printf("✅ Successfully saved conversation state for call %s", callID)
	return nil
}

func (b *BusinessService) FormatContextForPrompt(ctx *BusinessContext) string {
	if ctx == nil || ctx.Profile == nil {
		log.Printf("⚠️ FormatContextForPrompt: Context or Profile is nil")
		return "You are a professional AI receptionist. You help callers with general inquiries, providing business information, and scheduling appointment bookings. Please maintain a polite and helpful demeanor throughout the conversation."
	}

	profile := ctx.Profile
	businessName := getString(profile, "business_name", "")
	if businessName == "" {
		businessName = getString(profile, "name", "the business")
	}
	log.Printf("📝 FormatContextForPrompt: Extracted Business Name = '%s'", businessName)
	address := getString(profile, "address", "")
	if address == "" {
		address = getString(profile, "business_address", "Not specified")
	}
	businessPhone := getString(profile, "phone", "Not specified")
	businessEmail := getString(profile, "email", "Not specified")
	description := getString(profile, "description", "")

	// Tone logic
	toneInstruction := "You are professional, polite, and helpful. IMPORTANT: Be extremely concise. Keep responses short and direct to reduce call length. Never over-explain."
	if vs := ctx.VoiceSettings; vs != nil {
		if tone, ok := vs["conversation_tone"].(string); ok {
			switch tone {
			case "friendly":
				toneInstruction = "You are warm and friendly, but very brief. Answer questions directly and don't use filler words."
			case "casual":
				toneInstruction = "You are relaxed and natural. Use short sentences. Be direct and get to the point quickly."
			case "professional":
				toneInstruction = "You are efficient and professional. Provide clear, concise answers without unnecessary pleasantries."
			}
		}
	}

	// Custom persona override
	if persona, ok := profile["ai_persona_prompt"].(string); ok && persona != "" {
		toneInstruction = persona + " IMPORTANT: Be extremely concise. Keep call length to a minimum."
	}

	var sb strings.Builder
	sb.WriteString("IDENTITY & STYLE:\n")
	fmt.Fprintf(&sb, "BUSINESS NAME: %s\n", businessName)
	fmt.Fprintf(&sb, "You are the AI Assistant for %s.\n", businessName)
	sb.WriteString("CRITICAL RULE: Be extremely concise. Use the fewest words possible. Never ask more than one question at a time.\n\n")

	sb.WriteString("BUSINESS INFO:\n")
	fmt.Fprintf(&sb, "- Location: %s\n", address)
	fmt.Fprintf(&sb, "- Phone: %s\n", businessPhone)
	fmt.Fprintf(&sb, "- Email: %s\n", businessEmail)
	if description != "" {
		fmt.Fprintf(&sb, "- About: %s\n", description)
	}

	// Hours
	if len(ctx.Hours) > 0 {
		sb.WriteString("- Hours: ")
		var hours []string

		// Check if it's Denormalized (single row with day_open, day_close etc)
		// vs Normalized (multiple rows with day_of_week column)
		isNormalized := false
		if len(ctx.Hours) > 1 {
			isNormalized = true
		} else if _, ok := ctx.Hours[0]["day_of_week"]; ok {
			isNormalized = true
		}

		if isNormalized {
			for _, h := range ctx.Hours {
				if enabled, ok := h["enabled"].(bool); ok && !enabled {
					continue
				}
				day := getString(h, "day_of_week", "")
				if day == "" {
					continue
				}
				open := getString(h, "open_time", "")
				closeTime := getString(h, "close_time", "")
				if len(open) > 5 {
					open = open[:5]
				}
				if len(closeTime) > 5 {
					closeTime = closeTime[:5]
				}
				if len(day) > 0 {
					day = strings.ToUpper(day[:1]) + strings.ToLower(day[1:])
				}
				hours = append(hours, fmt.Sprintf("%s (%s - %s)", day, open, closeTime))
			}
		} else {
			// Denormalized schema (single row)
			row := ctx.Hours[0]
			days := []string{"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}
			for _, day := range days {
				enabledKey := day + "_enabled"
				openKey := day + "_open"
				closeKey := day + "_close"

				enabled := true
				if e, ok := row[enabledKey].(bool); ok {
					enabled = e
				}

				if !enabled {
					continue
				}

				open := getString(row, openKey, "")
				closeTime := getString(row, closeKey, "")
				if open == "" || closeTime == "" {
					continue
				}

				if len(open) > 5 {
					open = open[:5]
				}
				if len(closeTime) > 5 {
					closeTime = closeTime[:5]
				}
				dayTitle := strings.ToUpper(day[:1]) + strings.ToLower(day[1:])
				hours = append(hours, fmt.Sprintf("%s (%s - %s)", dayTitle, open, closeTime))
			}
		}

		if len(hours) > 0 {
			sb.WriteString(strings.Join(hours, ", "))
		} else {
			sb.WriteString("Not specified")
		}
		sb.WriteString("\n")
	}

	// Services
	if len(ctx.Services) > 0 {
		sb.WriteString("- Services Offered: ")
		var services []string
		for _, s := range ctx.Services {
			name := s["name"].(string)
			price := s["price"]
			if price != nil {
				services = append(services, fmt.Sprintf("%s ($%v)", name, price))
			} else {
				services = append(services, name)
			}
		}
		sb.WriteString(strings.Join(services, ", "))
		sb.WriteString("\n")
	}

	// Urgent Rules
	if len(ctx.UrgentRules) > 0 {
		sb.WriteString("- Urgent Handling Rules:\n")
		for _, r := range ctx.UrgentRules {
			condition := getString(r, "condition_text", "")
			action := getString(r, "action", "")
			contact := getString(r, "contact", "")
			fmt.Fprintf(&sb, "  * If %s: %s (Contact: %s)\n", condition, action, contact)
		}
	}

	sb.WriteString("\nTONE & PERSONA:\n")
	sb.WriteString(toneInstruction)
	sb.WriteString("\n")

	// Booking Requirements
	if len(ctx.Requirements) > 0 {
		sb.WriteString("\nAPPOINTMENT BOOKING PROTOCOL:\n")
		sb.WriteString("When a caller wants to book an appointment, collect these details:\n")
		for _, r := range ctx.Requirements {
			name := getString(r, "field_name", "")
			required := false
			if req, ok := r["required"].(bool); ok {
				required = req
			}
			if status, ok := r["status"].(string); ok && status == "required" {
				required = true
			}

			star := ""
			if required {
				star = " (REQUIRED)"
			}
			fmt.Fprintf(&sb, "- %s%s\n", name, star)
		}
	}

	return sb.String()
}

func getString(m map[string]any, key string, fallback string) string {
	if val, ok := m[key].(string); ok && val != "" {
		return val
	}
	return fallback
}
