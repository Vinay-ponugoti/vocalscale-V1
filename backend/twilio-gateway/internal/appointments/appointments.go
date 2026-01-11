package appointments

import (
	"fmt"
	"log"
	"time"
	"twilio-gateway/internal/supabase"
)

type AppointmentSlot struct {
	ID            string `json:"id"`
	BusinessID    string `json:"business_id"`
	AvailableDate string `json:"available_date"`
	AvailableTime string `json:"available_time"`
	Duration      int    `json:"duration"` // in minutes
	IsBooked      bool   `json:"is_booked"`
	CreatedAt     string `json:"created_at"`
	UpdatedAt     string `json:"updated_at"`
}

type Appointment struct {
	ID                string `json:"id"`
	BusinessID        string `json:"business_id"`
	CustomerName      string `json:"customer_name"`
	CustomerPhone     string `json:"customer_phone"`
	CustomerEmail     string `json:"customer_email"`
	AppointmentSlotID string `json:"appointment_slot_id"`
	ScheduledDate     string `json:"scheduled_date"`
	ScheduledTime     string `json:"scheduled_time"`
	Duration          int    `json:"duration"` // in minutes
	Notes             string `json:"notes"`
	Status            string `json:"status"` // pending, confirmed, completed, cancelled
	CreatedAt         string `json:"created_at"`
	UpdatedAt         string `json:"updated_at"`
}

type AppointmentsService struct {
	Supabase *supabase.Client
}

func NewAppointmentsService(sbClient *supabase.Client) *AppointmentsService {
	return &AppointmentsService{
		Supabase: sbClient,
	}
}

// GetAvailableSlots fetches available appointment slots for a business
func (as *AppointmentsService) GetAvailableSlots(businessID string, date string) ([]AppointmentSlot, error) {
	log.Printf("🗓️ Fetching available slots for business %s on %s", businessID, date)

	// Note: appointment_slots table might be missing in some environments.
	// If it fails, we'll return an empty list and let the agent handle it.
	query := fmt.Sprintf(
		"business_id=eq.%s&available_date=eq.%s&is_booked=eq.false&order=available_time.asc",
		businessID,
		date,
	)

	slots, err := as.Supabase.Fetch("appointment_slots", query)
	if err != nil {
		log.Printf("⚠️ appointment_slots table not found or error: %v. Proceeding without slots.", err)
		return []AppointmentSlot{}, nil
	}

	var appointmentSlots []AppointmentSlot
	for _, slot := range slots {
		// Helper for safe type assertions
		getString := func(m map[string]interface{}, k string) string {
			if v, ok := m[k].(string); ok {
				return v
			}
			return ""
		}
		getFloat := func(m map[string]interface{}, k string) float64 {
			if v, ok := m[k].(float64); ok {
				return v
			}
			return 0
		}
		getBool := func(m map[string]interface{}, k string) bool {
			if v, ok := m[k].(bool); ok {
				return v
			}
			return false
		}

		appointmentSlots = append(appointmentSlots, AppointmentSlot{
			ID:            getString(slot, "id"),
			BusinessID:    getString(slot, "business_id"),
			AvailableDate: getString(slot, "available_date"),
			AvailableTime: getString(slot, "available_time"),
			Duration:      int(getFloat(slot, "duration")),
			IsBooked:      getBool(slot, "is_booked"),
			CreatedAt:     getString(slot, "created_at"),
			UpdatedAt:     getString(slot, "updated_at"),
		})
	}

	log.Printf("✅ Found %d available slots", len(appointmentSlots))
	return appointmentSlots, nil
}

// CheckAvailability checks if a specific time slot is available
func (as *AppointmentsService) CheckAvailability(businessID string, date string, timeStr string) (bool, error) {
	log.Printf("🔍 Checking availability for %s at %s %s", businessID, date, timeStr)

	query := fmt.Sprintf(
		"business_id=eq.%s&available_date=eq.%s&available_time=eq.%s&is_booked=eq.false",
		businessID,
		date,
		timeStr,
	)

	slots, err := as.Supabase.Fetch("appointment_slots", query)
	if err != nil {
		log.Printf("❌ Error checking availability: %v", err)
		return false, err
	}

	available := len(slots) > 0
	if available {
		log.Printf("✅ Slot available: %s %s", date, timeStr)
	} else {
		log.Printf("⚠️ Slot NOT available: %s %s", date, timeStr)
	}

	return available, nil
}

// BookAppointment creates a new appointment booking
func (as *AppointmentsService) BookAppointment(businessID string, customerName string, customerPhone string, customerEmail string, slotID string, notes string, date string, timeStr string) (*Appointment, error) {
	log.Printf("📅 Booking appointment for %s (%s) - Slot: %s, Date: %s, Time: %s", customerName, customerPhone, slotID, date, timeStr)

	// Use provided date/time if available, otherwise try to get from slot
	finalDate := date
	finalTime := timeStr
	duration := 30 // Default duration

	if slotID != "" {
		// Try to get slot details first
		slots, err := as.Supabase.Fetch("appointment_slots", fmt.Sprintf("id=eq.%s", slotID))
		if err == nil && len(slots) > 0 {
			slot := slots[0]
			getString := func(m map[string]interface{}, k string) string {
				if v, ok := m[k].(string); ok {
					return v
				}
				return ""
			}
			getFloat := func(m map[string]interface{}, k string) float64 {
				if v, ok := m[k].(float64); ok {
					return v
				}
				return 0
			}

			if finalDate == "" {
				finalDate = getString(slot, "available_date")
			}
			if finalTime == "" {
				finalTime = getString(slot, "available_time")
			}
			duration = int(getFloat(slot, "duration"))
		}
	}

	// Create appointment record
	// Map to actual Supabase schema: id, customer_name, service_type, scheduled_time, status, user_id, duration_minutes, notes
	appointmentData := map[string]interface{}{
		"customer_name":    customerName,
		"customer_phone":   customerPhone,
		"customer_email":   customerEmail,
		"service_type":     "Consultation", // Default service type
		"scheduled_time":   fmt.Sprintf("%sT%s:00Z", finalDate, finalTime),
		"status":           "Scheduled",
		"user_id":          businessID, // Using businessID as user_id based on schema
		"duration_minutes": duration,
		"notes":            notes,
	}

	resp, err := as.Supabase.InsertWithResponse("appointments", appointmentData)
	if err != nil {
		log.Printf("❌ Error creating appointment: %v", err)
		return nil, err
	}

	appointmentID := ""
	if len(resp) > 0 {
		if id, ok := resp[0]["id"].(string); ok {
			appointmentID = id
		}
	}

	// Mark slot as booked if slotID was provided
	if slotID != "" {
		slotUpdateData := map[string]interface{}{
			"is_booked":  true,
			"updated_at": time.Now().UTC().Format(time.RFC3339),
		}
		_ = as.Supabase.Update("appointment_slots", fmt.Sprintf("id=eq.%s", slotID), slotUpdateData)
	}

	log.Printf("✅ Appointment booked successfully - %s at %s %s (ID: %s)", customerName, finalDate, finalTime, appointmentID)

	return &Appointment{
		ID:            appointmentID,
		CustomerName:  customerName,
		ScheduledDate: finalDate,
		ScheduledTime: finalTime,
		Status:        "Scheduled",
	}, nil
}

// FindAppointmentsByPhone searches for appointments by customer phone number
func (as *AppointmentsService) FindAppointmentsByPhone(businessID string, phone string) ([]Appointment, error) {
	log.Printf("🔍 Searching appointments for user %s phone %s", businessID, phone)

	// Use user_id and scheduled_time based on BookAppointment implementation
	query := fmt.Sprintf("user_id=eq.%s&customer_phone=eq.%s&order=scheduled_time.desc", businessID, phone)
	results, err := as.Supabase.Fetch("appointments", query)
	if err != nil {
		return nil, err
	}

	var appts []Appointment
	for _, r := range results {
		getString := func(m map[string]interface{}, k string) string {
			if v, ok := m[k].(string); ok {
				return v
			}
			return ""
		}
		getFloat := func(m map[string]interface{}, k string) float64 {
			if v, ok := m[k].(float64); ok {
				return v
			}
			return 0
		}

		appts = append(appts, Appointment{
			ID:                getString(r, "id"),
			BusinessID:        getString(r, "business_id"),
			CustomerName:      getString(r, "customer_name"),
			CustomerPhone:     getString(r, "customer_phone"),
			CustomerEmail:     getString(r, "customer_email"),
			AppointmentSlotID: getString(r, "appointment_slot_id"),
			ScheduledDate:     getString(r, "scheduled_date"),
			ScheduledTime:     getString(r, "scheduled_time"),
			Duration:          int(getFloat(r, "duration")),
			Notes:             getString(r, "notes"),
			Status:            getString(r, "status"),
			CreatedAt:         getString(r, "created_at"),
			UpdatedAt:         getString(r, "updated_at"),
		})
	}

	return appts, nil
}

// CancelAppointment cancels an existing appointment and frees the slot
func (as *AppointmentsService) CancelAppointment(appointmentID string) error {
	log.Printf("🗑️ Cancelling appointment %s", appointmentID)

	// 1. Get appointment details to find the slot
	results, err := as.Supabase.Fetch("appointments", fmt.Sprintf("id=eq.%s", appointmentID))
	if err != nil || len(results) == 0 {
		return fmt.Errorf("appointment not found")
	}
	slotID := ""
	if sid, ok := results[0]["appointment_slot_id"].(string); ok {
		slotID = sid
	}

	// 2. Update appointment status to cancelled
	err = as.Supabase.Update("appointments", fmt.Sprintf("id=eq.%s", appointmentID), map[string]interface{}{
		"status":     "cancelled",
		"updated_at": time.Now().UTC().Format(time.RFC3339),
	})
	if err != nil {
		return err
	}

	// 3. Free up the slot if it exists
	if slotID != "" {
		err = as.Supabase.Update("appointment_slots", fmt.Sprintf("id=eq.%s", slotID), map[string]interface{}{
			"is_booked":  false,
			"updated_at": time.Now().UTC().Format(time.RFC3339),
		})
		if err != nil {
			log.Printf("⚠️ Error freeing slot %s: %v", slotID, err)
		}
	}

	return nil
}

// GetUpcomingAppointments fetches upcoming appointments for a business
func (as *AppointmentsService) GetUpcomingAppointments(businessID string, limit int) ([]Appointment, error) {
	log.Printf("📋 Fetching upcoming appointments for business %s", businessID)

	query := fmt.Sprintf(
		"business_id=eq.%s&status=neq.cancelled&order=scheduled_date.asc,scheduled_time.asc&limit=%d",
		businessID,
		limit,
	)

	appointments, err := as.Supabase.Fetch("appointments", query)
	if err != nil {
		log.Printf("❌ Error fetching appointments: %v", err)
		return nil, err
	}

	var result []Appointment
	for _, appt := range appointments {
		// Helper for safe type assertions
		getString := func(m map[string]interface{}, k string) string {
			if v, ok := m[k].(string); ok {
				return v
			}
			return ""
		}

		result = append(result, Appointment{
			ID:            getString(appt, "id"),
			BusinessID:    getString(appt, "business_id"),
			CustomerName:  getString(appt, "customer_name"),
			CustomerPhone: getString(appt, "customer_phone"),
			ScheduledDate: getString(appt, "scheduled_date"),
			ScheduledTime: getString(appt, "scheduled_time"),
			Status:        getString(appt, "status"),
		})
	}

	log.Printf("✅ Found %d upcoming appointments", len(result))
	return result, nil
}
