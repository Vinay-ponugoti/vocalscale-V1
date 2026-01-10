-- Migration to add subscription and plan columns to the businesses table
-- This allows the Twilio Gateway to check for active premium status directly on the business record

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- Index for faster lookups during call routing
CREATE INDEX IF NOT EXISTS idx_businesses_subscription_status ON public.businesses(subscription_status);
CREATE INDEX IF NOT EXISTS idx_businesses_plan ON public.businesses(plan);

-- Comment for documentation
COMMENT ON COLUMN public.businesses.subscription_status IS 'Current status of the business subscription (active, trialing, inactive, etc.)';
COMMENT ON COLUMN public.businesses.plan IS 'The subscription plan ID (starter, pro, elite, or free)';
