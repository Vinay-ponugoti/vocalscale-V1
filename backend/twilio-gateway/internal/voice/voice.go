package voice

import (
	"fmt"
	"log"
	"strings"
	"sync"
	"time"
	"twilio-gateway/internal/supabase"
)

type VoiceSettings struct {
	ID               string `json:"id"`
	UserID           string `json:"user_id"`
	BusinessID       string `json:"business_id"`
	VoiceModel       string `json:"voice_model"`
	VoiceName        string `json:"voice_name"`
	Language         string `json:"language"`
	SpeakingRate     int    `json:"speaking_rate"` // 0-100
	Volume           int    `json:"volume"`        // 0-100
	Pitch            int    `json:"pitch"`         // -20 to 20
	ConversationTone string `json:"conversation_tone"`
}

type Voice struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Model     string `json:"model"`
	Language  string `json:"language"`
	Gender    string `json:"gender"`
	IsEnabled bool   `json:"is_enabled"`
}

type VoiceService struct {
	Supabase *supabase.Client
	cache    sync.Map // userID -> *cachedVoiceSettings
}

type cachedVoiceSettings struct {
	settings  *VoiceSettings
	expiresAt time.Time
}

func NewVoiceService(sbClient *supabase.Client) *VoiceService {
	return &VoiceService{
		Supabase: sbClient,
	}
}

// GetVoiceSettings fetches voice settings for a user
func (vs *VoiceService) GetVoiceSettings(userID string) (*VoiceSettings, error) {
	// Check cache first
	if val, ok := vs.cache.Load(userID); ok {
		cached := val.(*cachedVoiceSettings)
		if time.Now().Before(cached.expiresAt) {
			log.Printf("⚡ [CACHE HIT] Voice settings for user %s", userID)
			return cached.settings, nil
		}
	}

	log.Printf("🎤 [CACHE MISS] Fetching voice settings for user %s", userID)

	query := fmt.Sprintf("user_id=eq.%s&select=*,voice:voices(*)", userID)
	settings, err := vs.Supabase.Fetch("voice_settings", query)
	if err != nil {
		log.Printf("❌ Error fetching voice settings: %v", err)
		return nil, err
	}

	if len(settings) == 0 {
		log.Printf("⚠️ No voice settings found for user %s, using defaults", userID)
		return &VoiceSettings{
			VoiceModel:       "aura-athena-en",
			VoiceName:        "aura-athena-en",
			Language:         "en-US",
			SpeakingRate:     70,
			Volume:           80,
			Pitch:            0,
			ConversationTone: "professional",
		}, nil
	}

	settingsData := settings[0]

	// Safe string extraction helper
	getString := func(data map[string]interface{}, key string, defaultValue string) string {
		if val, ok := data[key]; ok && val != nil {
			if str, ok := val.(string); ok {
				return str
			}
		}
		return defaultValue
	}

	voiceSettings := &VoiceSettings{
		ID:               getString(settingsData, "id", ""),
		UserID:           getString(settingsData, "user_id", userID),
		BusinessID:       getString(settingsData, "business_id", ""),
		VoiceModel:       getString(settingsData, "voice_model", "aura-athena-en"),
		VoiceName:        getString(settingsData, "voice_name", "aura-athena-en"),
		Language:         getString(settingsData, "language", "en-US"),
		ConversationTone: getString(settingsData, "conversation_tone", "professional"),
	}

	// Handle optional numeric fields
	if sr, ok := settingsData["speaking_rate"].(float64); ok {
		voiceSettings.SpeakingRate = int(sr)
	} else {
		voiceSettings.SpeakingRate = 70 // default
	}

	if vol, ok := settingsData["volume"].(float64); ok {
		voiceSettings.Volume = int(vol)
	} else {
		voiceSettings.Volume = 80 // default
	}

	if pitch, ok := settingsData["pitch"].(float64); ok {
		voiceSettings.Pitch = int(pitch)
	} else {
		voiceSettings.Pitch = 0 // default
	}

	log.Printf("✅ Voice settings loaded: model=%s, language=%s, rate=%d, volume=%d, pitch=%d",
		voiceSettings.VoiceModel,
		voiceSettings.Language,
		voiceSettings.SpeakingRate,
		voiceSettings.Volume,
		voiceSettings.Pitch,
	)

	// Store in cache for 10 minutes
	vs.cache.Store(userID, &cachedVoiceSettings{
		settings:  voiceSettings,
		expiresAt: time.Now().Add(10 * time.Minute),
	})

	return voiceSettings, nil
}

// GetTTSParameters returns TTS parameters formatted for Deepgram API
func (vs *VoiceService) GetTTSParameters(settings *VoiceSettings) map[string]string {
	log.Printf("🎛️ TTS Parameters: voice=%s, language=%s, rate=%d, vol=%d, pitch=%d",
		settings.VoiceName,
		settings.Language,
		settings.SpeakingRate,
		settings.Volume,
		settings.Pitch,
	)

	return map[string]string{
		"model":         settings.VoiceName,
		"encoding":      "mulaw",
		"sample_rate":   "8000",
		"container":     "none",
		"language":      settings.Language,
		"speaking_rate": fmt.Sprintf("%.2f", float64(settings.SpeakingRate)/100.0),
		"volume":        fmt.Sprintf("%.2f", float64(settings.Volume)/100.0),
		"pitch":         fmt.Sprintf("%d", settings.Pitch),
	}
}

// GetGreetingPrompt returns a personalized greeting based on conversation tone
func (vs *VoiceService) GetGreetingPrompt(settings *VoiceSettings, businessName string) string {
	greeting := fmt.Sprintf("Thank you for calling %s. How can I help you today?", businessName)

	switch strings.ToLower(settings.ConversationTone) {
	case "friendly":
		greeting = fmt.Sprintf("Hi! Welcome to %s! How can I brighten your day today?", businessName)
	case "casual":
		greeting = fmt.Sprintf("Hey! Thanks for calling %s. What can I do for you?", businessName)
	case "professional":
		greeting = fmt.Sprintf("Thank you for calling %s. How may I assist you today?", businessName)
	}

	return greeting
}
