-- Migration to add Google Business Integration columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_account_id TEXT,
ADD COLUMN IF NOT EXISTS google_location_id TEXT,
ADD COLUMN IF NOT EXISTS google_connected_at TIMESTAMPTZ;

-- Documentation comments
COMMENT ON COLUMN public.profiles.google_refresh_token IS 'OAuth2 refresh token for Google Business Profile API access';
COMMENT ON COLUMN public.profiles.google_account_id IS 'The Google account ID that owns the business location';
COMMENT ON COLUMN public.profiles.google_location_id IS 'The specific Google Business Profile location ID';
