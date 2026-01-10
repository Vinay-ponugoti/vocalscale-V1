package llm

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatCompletionRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	Stream      bool      `json:"stream"`
	Temperature float32   `json:"temperature"`
	MaxTokens   int       `json:"max_tokens"`
}

type ChatCompletionChunk struct {
	Choices []struct {
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
	} `json:"choices"`
}

type LLMClient struct {
	APIKey  string
	BaseURL string
	HTTP    *http.Client
}

func NewLLMClient(apiKey, baseURL string) *LLMClient {
	if baseURL == "" {
		baseURL = "https://api.together.xyz/v1"
	}

	// Optimized HTTP client with connection pooling
	transport := &http.Transport{
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 10,
		MaxConnsPerHost:     10,
		IdleConnTimeout:     90 * time.Second,
		DisableKeepAlives:   false,
		DisableCompression:  false,
	}

	return &LLMClient{
		APIKey:  apiKey,
		BaseURL: baseURL,
		HTTP: &http.Client{
			Transport: transport,
			Timeout:   30 * time.Second,
		},
	}
}

func (l *LLMClient) StreamChatCompletion(ctx context.Context, req ChatCompletionRequest, chunkChan chan<- string) error {
	var lastErr error
	maxRetries := 3
	backoff := 500 * time.Millisecond

	for i := 0; i < maxRetries; i++ {
		if i > 0 {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(backoff):
				backoff *= 2
			}
		}

		err := l.doStreamChatCompletion(ctx, req, chunkChan)
		if err == nil {
			return nil
		}
		lastErr = err
		// Only retry on network errors or 5xx
		if !strings.Contains(err.Error(), "network") && !strings.Contains(err.Error(), "500") {
			return err
		}
	}
	return lastErr
}

func (l *LLMClient) doStreamChatCompletion(ctx context.Context, req ChatCompletionRequest, chunkChan chan<- string) error {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/chat/completions", l.BaseURL)
	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	httpReq.Header.Set("Authorization", "Bearer "+l.APIKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := l.HTTP.Do(httpReq)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("llm error (status %d): %s", resp.StatusCode, string(body))
	}

	reader := bufio.NewReader(resp.Body)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				break
			}
			return err
		}

		line = strings.TrimSpace(line)
		if line == "" || line == "data: [DONE]" {
			if line == "data: [DONE]" {
				break
			}
			continue
		}

		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			var chunk ChatCompletionChunk
			if err := json.Unmarshal([]byte(data), &chunk); err != nil {
				continue
			}

			if len(chunk.Choices) > 0 {
				content := chunk.Choices[0].Delta.Content
				if content != "" {
					chunkChan <- content
				}
			}
		}
	}
	return nil
}
