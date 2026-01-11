package handlers

import (
	"time"
)

func safeString(m map[string]interface{}, key string) string {
	if m == nil {
		return ""
	}
	if val, ok := m[key]; ok {
		if s, ok := val.(string); ok {
			return s
		}
	}
	return ""
}

func safeFloat64(m map[string]interface{}, key string) float64 {
	if m == nil {
		return 0
	}
	if val, ok := m[key]; ok {
		if f, ok := val.(float64); ok {
			return f
		}
		if i, ok := val.(int64); ok {
			return float64(i)
		}
		if i, ok := val.(int); ok {
			return float64(i)
		}
	}
	return 0
}

func toUnix(val interface{}) int64 {
	if val == nil {
		return 0
	}
	switch v := val.(type) {
	case string:
		t, err := time.Parse(time.RFC3339, v)
		if err != nil {
			return 0
		}
		return t.Unix()
	case float64:
		return int64(v)
	case int64:
		return v
	case int:
		return int64(v)
	}
	return 0
}

func max(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}

// normalizePlan extracts plan details from joined Supabase results
func normalizePlan(rawSub map[string]interface{}) map[string]interface{} {
	if rawSub == nil {
		return nil
	}
	
	if plan, ok := rawSub["plans"].(map[string]interface{}); ok {
		return plan
	}
	
	if plans, ok := rawSub["plans"].([]interface{}); ok && len(plans) > 0 {
		if firstPlan, ok := plans[0].(map[string]interface{}); ok {
			return firstPlan
		}
	}
	
	return nil
}
