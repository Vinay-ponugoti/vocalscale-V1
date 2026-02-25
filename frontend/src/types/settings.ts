export interface Voice {
  id: string;
  name: string;
  gender: string;
  accent: string;
  provider: string;
  provider_voice_id: string;
  sample_audio_url?: string;
  is_premium?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface VoiceSettings {
  id?: string;
  voice_id: string;
  model_name?: string;
  speaking_speed: number;
  conversation_tone: string;
  custom_greeting: string;
  after_hours_greeting: string;
  language: string;
  is_active: boolean;
  sync_google_calendar?: boolean;
}

export interface NotificationSettings {
  urgent_call_alerts: boolean;
  booking_confirmations: boolean;
  missed_call_alerts: boolean;
  urgent_transfer_enabled?: boolean;
  transfer_number?: string;
  standard_transfer_enabled?: boolean;
  standard_transfer_number?: string;
}

export interface BookingRequirement {
  id?: string;
  field_name: string;
  required: boolean;
  field_type: string;
  status?: 'optional' | 'recommended' | 'required';
}

export interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  isLast?: boolean;
}

export interface VoiceSettingsProps {
  settings: VoiceSettings;
  availableVoices: Voice[];
  onChange: (updates: Partial<VoiceSettings>) => void;
  onNavigateToAdvanced: () => void;
  plan?: string;
}

export interface NotificationSettingsProps {
  settings: NotificationSettings;
  onChange: (updates: Partial<NotificationSettings>) => void;
}
