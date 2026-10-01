export interface CallLog {
  id: string;
  caller_name: string;
  phone_number: string;
  created_at: string; // ISO string
  duration_seconds: number; // in seconds
  category: 'Booking' | 'Inquiry' | 'Urgent' | 'General' | string;
  summary: string;
  transcript?: string;
  status: 'Completed' | 'Missed' | 'pending' | 'Handled' | string;
  is_urgent: boolean;
  recording_url?: string;
  lead_score?: number;
  tags?: string[];
  notes?: string;
  follow_up_required?: boolean;
  handled_by?: string;
  direction?: 'inbound' | 'outbound' | string;
  objective?: string;
}

export interface CallLogFilters {
  search: string;
  status: string;
  type: string;
  dateRange: string;
  direction: string;
}

// Display names for raw API values, so every screen says the same thing.
const STATUS_LABELS: Record<string, string> = {
  completed: 'Answered',
  handled: 'Answered',
  'action req': 'Needs attention',
  'action required': 'Needs attention',
  'in progress': 'In progress',
  pending: 'Pending',
  missed: 'Missed',
};

const CATEGORY_LABELS: Record<string, string> = {
  booking: 'Appointment',
};

export const callStatusLabel = (status?: string, fallback = 'Open') =>
  status ? STATUS_LABELS[status.toLowerCase()] ?? status : fallback;

export const callCategoryLabel = (category?: string) =>
  category ? CATEGORY_LABELS[category.toLowerCase()] ?? category : 'General';
