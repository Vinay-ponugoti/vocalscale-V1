export interface BusinessDetails {
  id?: string;
  user_id?: string;
  business_name: string;
  category?: string;
  phone?: string;
  address?: string;
  description?: string;
  email?: string;
  website?: string;
  timezone?: string;
  place_id?: string;
  rating?: number;
  auto_setup?: boolean;
  image_url?: string;
  user_ratings_total?: number;
}

export interface BusinessHour {
  id?: string;
  day_of_week: string;
  open_time?: string;
  close_time?: string;
  enabled: boolean;
}

export interface Service {
  id?: string;
  name: string;
  price?: number;
  description?: string;
}

export interface UrgentCallRule {
  id?: string;
  condition_text: string;
  action: string;
  contact?: string;
}

export interface BusinessBookingRequirement {
  id?: string;
  field_name: string;
  required: boolean;
  field_type: string;
}

export interface BusinessSetupData {
  business: BusinessDetails;
  business_hours?: BusinessHour[];
  services?: Service[];
  urgent_call_rules?: UrgentCallRule[];
  booking_requirements?: BusinessBookingRequirement[];
}