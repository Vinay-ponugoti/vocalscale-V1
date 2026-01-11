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
		log.Printf("SUPABASE ERROR [%d] URL: %s Body: %s", resp.StatusCode, endpoint, string(body))
		return nil, fmt.Errorf("supabase error: %s", string(body))
	}

	var data []map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	return data, nil
}

func (s *Client) Upsert(table string, data interface{}) ([]map[string]interface{}, error) {
	return s.UpsertWithConflict(table, data, "user_id")
}

func (s *Client) UpsertWithConflict(table string, data interface{}, conflictKey string) ([]map[string]interface{}, error) {
	endpoint := fmt.Sprintf("%s/rest/v1/%s?on_conflict=%s", s.URL, table, conflictKey)
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
	req.Header.Set("Prefer", "return=representation,resolution=merge-duplicates")

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
		log.Printf("SUPABASE ERROR [%d] URL: %s Body: %s", resp.StatusCode, endpoint, string(body))
		return nil, fmt.Errorf("supabase upsert error: %s", string(body))
	}

	var result []map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	return result, nil
}

func (s *Client) Update(table string, query string, data interface{}) ([]map[string]interface{}, error) {
	endpoint := fmt.Sprintf("%s/rest/v1/%s?%s", s.URL, table, query)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("PATCH", endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", s.Key)
	req.Header.Set("Authorization", "Bearer "+s.Key)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

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
		log.Printf("SUPABASE ERROR [%d] URL: %s Body: %s", resp.StatusCode, endpoint, string(body))
		return nil, fmt.Errorf("supabase update error: %s", string(body))
	}

	var result []map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	return result, nil
}
