package deepgram

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type DeepgramService struct {
	apiKey string
}

type DeepgramClient struct {
	conn       *websocket.Conn
	mu         sync.Mutex // Added mutex for concurrent writes
	callID     string
	transcript chan string
	ctx        context.Context
	cancel     context.CancelFunc
	wg         sync.WaitGroup
	apiKey     string
}

func NewDeepgramService(apiKey string) *DeepgramService {
	return &DeepgramService{apiKey: apiKey}
}

func (s *DeepgramService) Connect(ctx context.Context, callID string, transcriptCh chan string) (*DeepgramClient, error) {
	// Added smart_format=true and tuned endpointing/vad
	url := "wss://api.deepgram.com/v1/listen?encoding=mulaw&sample_rate=8000&punctuate=true&interim_results=true&endpointing=250&vad_events=true&filler_words=true&smart_format=true&no_delay=true"

	header := http.Header{}
	header.Set("Authorization", "Token "+s.apiKey)

	dialer := websocket.Dialer{
		HandshakeTimeout: 30 * time.Second,
	}

	conn, _, err := dialer.Dial(url, header)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Deepgram: %v", err)
	}

	dCtx, cancel := context.WithCancel(ctx)

	client := &DeepgramClient{
		conn:       conn,
		callID:     callID,
		transcript: transcriptCh,
		ctx:        dCtx,
		cancel:     cancel,
		apiKey:     s.apiKey,
	}

	conn.SetPingHandler(func(appData string) error {
		client.mu.Lock()
		defer client.mu.Unlock()
		return conn.WriteMessage(websocket.PongMessage, []byte(appData))
	})

	conn.SetPongHandler(func(appData string) error {
		return nil
	})

	client.wg.Add(1)
	go client.receiveLoop()
	client.wg.Add(1)
	go client.keepalive()

	return client, nil
}

// Global HTTP client for TTS (reused across calls)
var ttsHTTPClient = &http.Client{
	Transport: &http.Transport{
		MaxIdleConns:        50,
		MaxIdleConnsPerHost: 5,
		MaxConnsPerHost:     5,
		IdleConnTimeout:     90 * time.Second,
		DisableKeepAlives:   false,
		DisableCompression:  false,
	},
	Timeout: 30 * time.Second,
}

func (c *DeepgramClient) Speak(ctx context.Context, text string, params map[string]string, outgoingCh chan<- string) error {
	voice := "aura-2-thalia-en"
	if params != nil {
		if v, ok := params["model"]; ok && v != "" {
			voice = v
		}
	}

	// Build URL with parameters
	baseURL := fmt.Sprintf("https://api.deepgram.com/v1/speak?model=%s&encoding=mulaw&sample_rate=8000&container=none", voice)

	// Add optional TTS parameters
	if params != nil {
		if lang, ok := params["language"]; ok && lang != "" {
			baseURL += fmt.Sprintf("&language=%s", lang)
		}
		if rate, ok := params["speaking_rate"]; ok && rate != "" {
			baseURL += fmt.Sprintf("&speaking_rate=%s", rate)
		}
		if vol, ok := params["volume"]; ok && vol != "" {
			baseURL += fmt.Sprintf("&volume=%s", vol)
		}
		if pitch, ok := params["pitch"]; ok && pitch != "" {
			baseURL += fmt.Sprintf("&pitch=%s", pitch)
		}
	}

	body, _ := json.Marshal(map[string]string{"text": text})
	req, err := http.NewRequestWithContext(ctx, "POST", baseURL, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Token "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := ttsHTTPClient.Do(req)
	if err != nil {
		log.Printf("❌ [%s] Deepgram TTS Request failed: %v", c.callID, err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		log.Printf("❌ [%s] Deepgram TTS Error (Status %d): %s", c.callID, resp.StatusCode, string(respBody))
		return fmt.Errorf("deepgram tts failed with status %d: %s", resp.StatusCode, string(respBody))
	}

	log.Printf("📥 [%s] Deepgram TTS Streaming started (Status %d)", c.callID, resp.StatusCode)

	totalBytes := 0
	buffer := make([]byte, 1024)
	for {
		n, err := resp.Body.Read(buffer)
		if n > 0 {
			totalBytes += n
			payload := base64.StdEncoding.EncodeToString(buffer[:n])
			select {
			case outgoingCh <- payload:
			case <-ctx.Done():
				log.Printf("⏹️ [%s] Deepgram TTS Context Cancelled after %d bytes", c.callID, totalBytes)
				return ctx.Err()
			}
		}
		if err == io.EOF {
			log.Printf("✅ [%s] Deepgram TTS Streaming complete - Total bytes: %d", c.callID, totalBytes)
			break
		}
		if err != nil {
			log.Printf("❌ [%s] Deepgram TTS Read Error: %v", c.callID, err)
			return err
		}
	}

	return nil
}

func (c *DeepgramClient) SendAudio(payloadBase64 string) error {
	data, err := base64.StdEncoding.DecodeString(payloadBase64)
	if err != nil {
		return err
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.conn.WriteMessage(websocket.BinaryMessage, data)
}

func (c *DeepgramClient) Close() {
	c.cancel()
	c.mu.Lock()
	c.conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "CloseStream"}`))
	c.conn.Close()
	c.mu.Unlock()
	c.wg.Wait()
}

type DeepgramResponse struct {
	Type        string `json:"type"`
	IsFinal     bool   `json:"is_final"`
	SpeechFinal bool   `json:"speech_final"`
	Channel     struct {
		Alternatives []struct {
			Transcript string `json:"transcript"`
		} `json:"alternatives"`
	} `json:"channel"`
	// VAD events
	Metadata struct {
		RequestId string `json:"request_id"`
	} `json:"metadata"`
}

func (c *DeepgramClient) receiveLoop() {
	defer c.wg.Done()
	for {
		select {
		case <-c.ctx.Done():
			return
		default:
			_, message, err := c.conn.ReadMessage()
			if err != nil {
				log.Printf("⚠️ [%s] Deepgram read error: %v", c.callID, err)
				return
			}

			var raw map[string]interface{}
			if err := json.Unmarshal(message, &raw); err != nil {
				continue
			}

			msgType, _ := raw["type"].(string)

			// Handle SpeechStarted for immediate interruption
			if msgType == "SpeechStarted" {
				log.Printf("🎙️ [%s] User started speaking (VAD)", c.callID)
				c.transcript <- "[SPEECH_STARTED]"
				continue
			}

			var resp DeepgramResponse
			if err := json.Unmarshal(message, &resp); err != nil {
				continue
			}

			if resp.Type == "Results" {
				transcript := ""
				if len(resp.Channel.Alternatives) > 0 {
					transcript = resp.Channel.Alternatives[0].Transcript
				}

				if transcript != "" {
					if resp.IsFinal {
						log.Printf("🎤 [%s] Deepgram Final: %s (SpeechFinal: %v)", c.callID, transcript, resp.SpeechFinal)
						c.transcript <- transcript
					} else {
						// Optionally handle interim results if needed for faster response
					}
				}
			}
		}
	}
}

func (c *DeepgramClient) keepalive() {
	defer c.wg.Done()
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-c.ctx.Done():
			return
		case <-ticker.C:
			c.mu.Lock()
			err := c.conn.WriteMessage(websocket.PingMessage, []byte{})
			c.mu.Unlock()
			if err != nil {
				log.Printf("⚠️ [%s] Deepgram keepalive failed: %v", c.callID, err)
				return
			}
		}
	}
}
