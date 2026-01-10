package supabase

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

type Client struct {
	URL    string
	Key    string
	Client *http.Client
}

func NewClient(url, key string) *Client {
	return &Client{
		URL: url,
		Key: key,
		Client: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (s *Client) Fetch(table string, query string) ([]map[string]interface{}, error) {
	endpoint := fmt.Sprintf("%s/rest/v1/%s?%s", s.URL, table, query)
	log.Printf("🌐 [Supabase] Fetch: %s", endpoint)
	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", s.Key)
	req.Header.Set("Authorization", "Bearer "+s.Key)

	resp, err := s.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("supabase error: %s", string(body))
	}

	var data []map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	return data, nil
}

func (s *Client) Insert(table string, data interface{}) error {
	_, err := s.InsertWithResponse(table, data)
	return err
}

func (s *Client) InsertWithResponse(table string, data interface{}) ([]map[string]interface{}, error) {
	endpoint := fmt.Sprintf("%s/rest/v1/%s", s.URL, table)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", s.Key)
	req.Header.Set("Authorization", "Bearer "+s.Key)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	resp, err := s.Client.Do(req)
	if err != nil {
		log.Printf("❌ Supabase POST request failed: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		log.Printf("❌ Supabase Insert error (Status %d): %s", resp.StatusCode, string(body))
		return nil, fmt.Errorf("supabase insert error: %s", string(body))
	}

	var result []map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	return result, nil
}

func (s *Client) Update(table string, query string, data interface{}) error {
	endpoint := fmt.Sprintf("%s/rest/v1/%s?%s", s.URL, table, query)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("PATCH", endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("apikey", s.Key)
	req.Header.Set("Authorization", "Bearer "+s.Key)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=minimal")

	resp, err := s.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("supabase update error: %s", string(body))
	}

	return nil
}
