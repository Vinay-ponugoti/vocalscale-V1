package types

import "time"

// TwilioMessage represents messages from Twilio Media Stream
type TwilioMessage struct {
	Event     string `json:"event"`
	StreamSid string `json:"streamSid"`
	Start     struct {
		StreamSid        string            `json:"streamSid"`
		CallSid          string            `json:"callSid"`
		CustomParameters map[string]string `json:"customParameters"`
	} `json:"start"`
	Media struct {
		Payload string `json:"payload"`
	} `json:"media"`
}

// BookingState holds the structured state for the appointment flow.
type BookingState struct {
	IsBooking          bool      `json:"is_booking"`
	Confirmed          bool      `json:"confirmed"`
	CustomerName       string    `json:"customer_name"`
	CustomerPhone      string    `json:"customer_phone"`
	CustomerEmail      string    `json:"customer_email"`
	PreferredDate      string    `json:"preferred_date"`
	PreferredTime      string    `json:"preferred_time"`
	LastUpdated        time.Time `json:"last_updated"`
	MessagesInBooking  int64     `json:"messages_in_booking"`
	ConfirmationNumber string    `json:"confirmation_number,omitempty"`
}

// Copy returns a deep copy of BookingState
func (bs BookingState) Copy() BookingState {
	return BookingState{
		IsBooking:          bs.IsBooking,
		Confirmed:          bs.Confirmed,
		CustomerName:       bs.CustomerName,
		CustomerPhone:      bs.CustomerPhone,
		CustomerEmail:      bs.CustomerEmail,
		PreferredDate:      bs.PreferredDate,
		PreferredTime:      bs.PreferredTime,
		LastUpdated:        bs.LastUpdated,
		MessagesInBooking:  bs.MessagesInBooking,
		ConfirmationNumber: bs.ConfirmationNumber,
	}
}

// DeepgramTranscript represents the transcript from Deepgram
type DeepgramTranscript struct {
	IsFinal bool `json:"is_final"`
	Channel struct {
		Alternatives []struct {
			Transcript string  `json:"transcript"`
			Confidence float64 `json:"confidence"`
		} `json:"alternatives"`
	} `json:"channel"`
	Metadata struct {
		RequestId string `json:"request_id"`
	} `json:"metadata"`
}

// NewCallEvent represents a notification to the Python worker about a new call
type NewCallEvent struct {
	CallID string `json:"call_id"`
	UserID string `json:"user_id"`
}

// CallEvent represents internal events shared between Go and Python
type CallEvent struct {
	Event      string  `json:"event"`
	CallID     string  `json:"call_id"`
	UserID     string  `json:"user_id,omitempty"`
	StreamSid  string  `json:"stream_sid,omitempty"`
	CallSid    string  `json:"call_sid,omitempty"`
	Timestamp  int64   `json:"timestamp"`
	Data       string  `json:"data,omitempty"`
	Duration   int     `json:"duration,omitempty"`
	Text       string  `json:"text,omitempty"`
	Confidence float64 `json:"confidence,omitempty"`
	Tokens     int     `json:"tokens,omitempty"`
}
