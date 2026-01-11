package twilio

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"twilio-gateway/internal/agent"
	"twilio-gateway/internal/appointments"
	"twilio-gateway/internal/business"
	"twilio-gateway/internal/deepgram"
	"twilio-gateway/internal/llm"
	"twilio-gateway/internal/redis"
	"twilio-gateway/internal/supabase"
	"twilio-gateway/internal/types"
	"twilio-gateway/internal/voice"

	"github.com/gorilla/websocket"
)

type CallConnection struct {
	CallID         string
	UserID         string
	StreamSid      string
	Conn           *websocket.Conn
	ConnMu         sync.Mutex
	Redis          *redis.RedisClient
	Deepgram       *deepgram.DeepgramClient
	DeepgramAPIKey string
	Supabase       *supabase.Client
	LLM            *llm.LLMClient
	BizService     *business.BusinessService
	ApptsService   *appointments.AppointmentsService
	VoiceService   *voice.VoiceService
	Agent          *agent.ConversationManager
	Ctx            context.Context
	Cancel         context.CancelFunc
	OutgoingCh     chan string
	Wg             sync.WaitGroup
	MsgCount       int64
	StartTime      time.Time
	SpeakCancel    context.CancelFunc
	SpeakMu        sync.Mutex
	PendingMedia   [][]byte
	PendingMu      sync.Mutex
}

func NewCallConnection(ctx context.Context, callID string, userID string, conn *websocket.Conn, rdb *redis.RedisClient, sb *supabase.Client, llmClient *llm.LLMClient, biz *business.BusinessService, appts *appointments.AppointmentsService, vs *voice.VoiceService, apiKey string) *CallConnection {
	cCtx, cancel := context.WithCancel(ctx)
	return &CallConnection{
		CallID:         callID,
		UserID:         userID,
		Conn:           conn,
		Redis:          rdb,
		Supabase:       sb,
		LLM:            llmClient,
		BizService:     biz,
		ApptsService:   appts,
		VoiceService:   vs,
		DeepgramAPIKey: apiKey,
		Ctx:            cCtx,
		Cancel:         cancel,
		OutgoingCh:     make(chan string, 1000),
		StartTime:      time.Now(),
	}
}

func (cc *CallConnection) Interrupt() {
	log.Printf("🔇 [%s] INTERRUPT: Clearing audio buffers and stopping TTS", cc.CallID)

	// 1. Cancel ongoing TTS
	cc.SpeakMu.Lock()
	if cc.SpeakCancel != nil {
		cc.SpeakCancel()
		cc.SpeakCancel = nil
	}
	cc.SpeakMu.Unlock()

	// 2. Clear OutgoingCh buffer
	// We drain the channel to remove any pending audio packets
drainLoop:
	for {
		select {
		case <-cc.OutgoingCh:
			// Just discard
		default:
			break drainLoop
		}
	}

	// 3. Notify Twilio to stop playback immediately
	cc.OutgoingCh <- `{"event": "clear"}`

	// 4. Notify Python side that an interruption occurred (optional but helpful)
	interruptionEvent := map[string]any{
		"event":     "interruption",
		"call_id":   cc.CallID,
		"timestamp": time.Now().Unix(),
	}
	data, _ := json.Marshal(interruptionEvent)
	cc.Redis.Publish("incoming_audio:"+cc.CallID, string(data))
}

func (cc *CallConnection) Start() {
	log.Printf("📞 [%s] Call session started", cc.CallID)
	defer cc.Cleanup()

	cc.readIncomingTwilio()
}

func (cc *CallConnection) Cleanup() {
	log.Printf("🧹 [%s] Starting cleanup for call session", cc.CallID)
	cc.Cancel()

	// Shutdown agent to persist state (transcript, booking info)
	if cc.Agent != nil {
		log.Printf("🛑 [%s] Shutting down agent to persist state...", cc.CallID)
		// Use a separate context with timeout for shutdown to ensure it completes
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := cc.Agent.Shutdown(shutdownCtx); err != nil {
			log.Printf("❌ [%s] Agent shutdown error: %v", cc.CallID, err)
		} else {
			log.Printf("✅ [%s] Agent shutdown successfully", cc.CallID)
		}
	} else {
		log.Printf("⚠️ [%s] No agent found to shutdown during cleanup", cc.CallID)
	}

	if cc.Deepgram != nil {
		cc.Deepgram.Close()
	}
	cc.ConnMu.Lock()
	if cc.Conn != nil {
		cc.Conn.Close()
	}
	cc.ConnMu.Unlock()
	cc.Wg.Wait()
	log.Printf("🔌 [%s] Call session ended - Duration: %v", cc.CallID, time.Since(cc.StartTime))
}

func (cc *CallConnection) Speak(text string, ttsParams map[string]string) {
	if text == "" {
		return
	}
	log.Printf("🗣️ [%s] Speaking: %s", cc.CallID, text)

	if cc.Deepgram == nil {
		log.Printf("⚠️ [%s] Cannot speak - Deepgram client not initialized", cc.CallID)
		return
	}

	// Use agent's TTS params if not provided
	if ttsParams == nil && cc.Agent != nil && cc.Agent.TTSParams != nil {
		ttsParams = cc.Agent.TTSParams
	}

	err := cc.Deepgram.Speak(cc.Ctx, text, ttsParams, cc.OutgoingCh)
	if err != nil {
		log.Printf("❌ [%s] Speak error: %v", cc.CallID, err)
	}
}

func (cc *CallConnection) readIncomingTwilio() {
	var transcriptCh chan string
	var tasksStarted bool

	defer func() {
		log.Printf("🧹 [%s] Cleaning up call connection", cc.CallID)
		cc.Cancel()
	}()

	for {
		_, message, err := cc.Conn.ReadMessage()
		if err != nil {
			return
		}

		var msg types.TwilioMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}

		switch msg.Event {
		case "connected":
			log.Printf("🤝 [%s] Twilio connected - StreamSid: %s", cc.CallID, msg.StreamSid)
			if msg.StreamSid != "" {
				cc.StreamSid = msg.StreamSid
			}
			if cc.CallID != "" {
				event := types.CallEvent{
					Event:     "stream.connected",
					CallID:    cc.CallID,
					UserID:    cc.UserID,
					StreamSid: cc.StreamSid,
					Timestamp: time.Now().Unix(),
				}
				data, _ := json.Marshal(event)
				log.Printf("📡 [%s] Publishing stream.connected event to Redis: %s", cc.CallID, string(data))
				cc.Redis.Publish("call_events", string(data))

				// Also keep the internal channel for backward compatibility if needed
				cc.Redis.Publish("incoming_audio:"+cc.CallID, string(data))
			}
			continue

		case "start":
			if msg.Start.StreamSid != "" {
				cc.StreamSid = msg.Start.StreamSid
			}

			if cc.CallID == "" {
				cc.CallID = msg.Start.CustomParameters["call_id"]
			}
			if cc.UserID == "" {
				cc.UserID = msg.Start.CustomParameters["user_id"]
			}

			// FAST CONTEXT: Get pre-fetched data from Python
			businessName := msg.Start.CustomParameters["business_name"]
			callerName := msg.Start.CustomParameters["caller_name"]
			callerPhone := msg.Start.CustomParameters["caller_phone"]

			log.Printf("🚀 [%s] Stream started: %s (user: %s, biz: %s, caller: %s, phone: %s)",
				cc.CallID, cc.StreamSid, cc.UserID, businessName, callerName, callerPhone)

			if !tasksStarted && cc.CallID != "" {
				initStart := time.Now()
				transcriptCh = make(chan string, 100)
				ttsChan := make(chan string, 100)

				// 1. Initialize SKELETON agent immediately with fast context
				fastCallerData := map[string]any{
					"caller_name":   callerName,
					"caller_phone":  callerPhone,
					"business_name": businessName,
				}
				var err error
				cc.Agent, err = agent.NewConversationManager(cc.LLM, cc.BizService, cc.ApptsService, cc.VoiceService, cc.Redis, cc.UserID, cc.CallID, fastCallerData)
				if err != nil {
					log.Printf("❌ [%s] Failed to initialize agent: %v", cc.CallID, err)
					return
				}

				// Load existing history if any (e.g. from a previous connection or initiated state)
				if err := cc.Agent.LoadHistory(cc.Ctx); err != nil {
					log.Printf("⚠️ [%s] Failed to load history: %v", cc.CallID, err)
				}

				// 2. Start outgoing audio pipelines (FAST)
				cc.Wg.Add(1)
				go cc.sendOutgoingAudio()

				cc.Wg.Add(1)
				go cc.listenOutgoingRedis()

				// 3. Setup TTS and Transcript handlers
				go func() {
					for text := range ttsChan {
						if len(text) < 2 {
							continue
						}
						cc.Speak(text, nil)
					}
				}()

				go func() {
					for transcript := range transcriptCh {
						if transcript == "[SPEECH_STARTED]" {
							cc.Interrupt()
							continue
						}
						// Restore Redis logging of transcript
						log.Printf("📝 [%s] Processing transcript: %s", cc.CallID, transcript)
						cc.Redis.Publish("incoming_audio:"+cc.CallID, transcript)

						if cc.Agent != nil {
							cc.Agent.HandleTranscript(cc.Ctx, transcript, ttsChan)
						}
					}
				}()

				// 4. PARALLEL FULL INITIALIZATION
				// ASYNC 1: Deepgram
				go func() {
					dgService := deepgram.NewDeepgramService(cc.DeepgramAPIKey)
					client, err := dgService.Connect(cc.Ctx, cc.CallID, transcriptCh)
					if err == nil {
						cc.Deepgram = client
						log.Printf("✅ [%s] Deepgram connected in %v", cc.CallID, time.Since(initStart))

						// SPEAK GREETING AS SOON AS DEEPGRAM IS READY
						// We can do this because we have the skeleton agent!
						greeting := cc.Agent.GetInitialGreeting()
						cc.Speak(greeting, nil)
					}
				}()

				// ASYNC 2: Full DB Context (Business + Voice Settings)
				go func() {
					if cc.UserID != "" {
						// Parallel fetch business and voice
						ctx, _ := cc.BizService.GetBusinessContext(cc.UserID)
						vSettings, _ := cc.VoiceService.GetVoiceSettings(cc.UserID)

						if ctx != nil {
							formattedCtx := cc.BizService.FormatContextForPrompt(ctx)
							log.Printf("📝 [%s] Formatted Business Context: %s", cc.CallID, formattedCtx)
							cc.Agent.UpdateContext(formattedCtx)
						}
						if vSettings != nil {
							cc.Agent.UpdateVoiceSettings(vSettings)
						}
						log.Printf("✅ [%s] Full DB context loaded in %v", cc.CallID, time.Since(initStart))
					}
				}()

				tasksStarted = true
			}
			continue

		case "media":
			cc.MsgCount++
			if cc.MsgCount == 1 {
				log.Printf("🎵 [%s] First media packet received", cc.CallID)
			}

			if cc.Deepgram != nil {
				cc.Deepgram.SendAudio(msg.Media.Payload)
			} else {
				cc.PendingMu.Lock()
				if cc.PendingMedia == nil {
					cc.PendingMedia = make([][]byte, 0, 100)
				}
				cc.PendingMedia = append(cc.PendingMedia, []byte(msg.Media.Payload))
				if len(cc.PendingMedia) == 1 {
					log.Printf("⚠️ [%s] Deepgram not ready, buffering media (buffered: %d)", cc.CallID, len(cc.PendingMedia))
				} else if len(cc.PendingMedia)%10 == 0 {
					log.Printf("⚠️ [%s] Still buffering media packets (count: %d)", cc.CallID, len(cc.PendingMedia))
				}
				cc.PendingMu.Unlock()
			}

			if cc.MsgCount%100 == 0 && cc.CallID != "" {
				heartbeat, _ := json.Marshal(map[string]string{"event": "heartbeat"})
				cc.Redis.Publish("incoming_audio:"+cc.CallID, string(heartbeat))
			}

		case "stop":
			log.Printf("🛑 [%s] Stream stopped", cc.CallID)
			if cc.CallID != "" {
				event := types.CallEvent{
					Event:     "stop",
					CallID:    cc.CallID,
					Timestamp: time.Now().Unix(),
				}
				data, _ := json.Marshal(event)
				cc.Redis.Publish("incoming_audio:"+cc.CallID, string(data))
			}
			return
		}
	}
}

func (cc *CallConnection) listenOutgoingRedis() {
	defer cc.Wg.Done()
	pubsub := cc.Redis.Subscribe("outgoing_audio:" + cc.CallID)
	defer pubsub.Close()

	ch := pubsub.Channel()
	for {
		select {
		case <-cc.Ctx.Done():
			return
		case msg, ok := <-ch:
			if !ok {
				return
			}

			log.Printf("📥 [%s] Received outgoing data from Redis (len: %d)", cc.CallID, len(msg.Payload))

			if len(msg.Payload) > 0 && msg.Payload[0] == '{' {
				var data map[string]any
				if err := json.Unmarshal([]byte(msg.Payload), &data); err == nil {
					if event, ok := data["event"].(string); ok {
						switch event {
						case "speak":
							text, _ := data["text"].(string)
							if text != "" {
								log.Printf("🗣️ [%s] Deepgram TTS Request: %s", cc.CallID, text)

								cc.SpeakMu.Lock()
								if cc.SpeakCancel != nil {
									cc.SpeakCancel()
								}
								speakCtx, speakCancel := context.WithCancel(cc.Ctx)
								cc.SpeakCancel = speakCancel
								cc.SpeakMu.Unlock()

								go func() {
									ttsParams := cc.Agent.TTSParams
									if ttsParams == nil {
										ttsParams = map[string]string{"model": "aura-athena-en"}
									}
									if err := cc.Deepgram.Speak(speakCtx, text, ttsParams, cc.OutgoingCh); err != nil {
										if speakCtx.Err() == nil {
											log.Printf("❌ [%s] Deepgram TTS Error: %v", cc.CallID, err)
										}
									}
								}()
								continue
							}
						case "clear":
							log.Printf("🔇 [%s] Clear Request received from Redis", cc.CallID)
							cc.SpeakMu.Lock()
							if cc.SpeakCancel != nil {
								cc.SpeakCancel()
								cc.SpeakCancel = nil
							}
							cc.SpeakMu.Unlock()
						case "eos":
							log.Printf("🔚 [%s] End of Stream (eos) received from Redis", cc.CallID)
							if cc.Deepgram != nil {
								cc.Deepgram.Close()
								log.Printf("✅ [%s] Deepgram connection closed via eos", cc.CallID)
							}
							return // Exit the Redis listener
						}
					}
				}
			}

			select {
			case cc.OutgoingCh <- msg.Payload:
			default:
				log.Printf("⚠️ [%s] Outgoing audio buffer full, dropping packet", cc.CallID)
			}
		}
	}
}

func (cc *CallConnection) sendOutgoingAudio() {
	defer cc.Wg.Done()
	for {
		select {
		case <-cc.Ctx.Done():
			return
		case payload, ok := <-cc.OutgoingCh:
			if !ok {
				return
			}

			if cc.StreamSid == "" {
				log.Printf("⚠️ [%s] Dropping outgoing audio packet - StreamSid is empty", cc.CallID)
				continue
			}

			var response map[string]any
			isMedia := true

			if len(payload) > 0 && payload[0] == '{' {
				var event map[string]any
				if err := json.Unmarshal([]byte(payload), &event); err == nil {
					if event["event"] == "clear" {
						isMedia = false
						log.Printf("🔇 [%s] Sending clear event to Twilio", cc.CallID)
						response = map[string]any{
							"event":     "clear",
							"streamSid": cc.StreamSid,
						}
					}
				}
			}

			if isMedia {
				// Log every 100th media packet to avoid spam
				if cc.MsgCount%100 == 0 {
					log.Printf("📤 [%s] Sending media packet to Twilio (StreamSid: %s)", cc.CallID, cc.StreamSid)
				}
				response = map[string]any{
					"event":     "media",
					"streamSid": cc.StreamSid,
					"media": map[string]string{
						"payload": payload,
					},
				}
			}

			cc.Conn.SetWriteDeadline(time.Now().Add(2 * time.Second))
			cc.ConnMu.Lock()
			err := cc.Conn.WriteJSON(response)
			cc.ConnMu.Unlock()
			if err != nil {
				log.Printf("❌ [%s] Failed to send to Twilio: %v", cc.CallID, err)
				return
			}
		}
	}
}
