-- NUCLEAR RESET: FIXING UUID VS TEXT ERROR AND STRIPE IDS
-- Run this ENTIRE script at once in the Supabase SQL Editor

-- 1. DROP EXISTING TABLES TO START FRESH
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;

-- 2. CREATE THE PLANS TABLE WITH THE CORRECT SCHEMA
CREATE TABLE public.plans (
    id TEXT PRIMARY KEY, -- 'starter', 'pro', 'elite'
    name TEXT NOT NULL,
    description TEXT,
    stripe_price_id TEXT UNIQUE NOT NULL, -- MUST be price_..., NOT prod_...
    price_amount INTEGER NOT NULL, -- in cents
    currency TEXT DEFAULT 'usd',
    interval TEXT DEFAULT 'month',
    limits JSONB DEFAULT '{}'::jsonb,
    features TEXT[] DEFAULT '{}',
    is_trial_allowed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE THE SUBSCRIPTIONS TABLE
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    plan_id TEXT REFERENCES public.plans(id),
    status TEXT NOT NULL,
    current_period_end BIGINT,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. SET UP RLS POLICIES
CREATE POLICY "Plans are viewable by everyone" ON public.plans
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- 6. INSERT INITIAL DATA
-- IMPORTANT: Go to Stripe Dashboard -> Product Catalog -> Click on your Product -> Find "Price ID" (starts with price_...)
-- DO NOT use the Product ID (starts with prod_...)

INSERT INTO public.plans (id, name, description, stripe_price_id, price_amount, limits, features)
VALUES 
    (
        'starter', 
        'Starter', 
        '300 AI minutes included. Ideal for solo practitioners.', 
        'price_REPLACE_WITH_YOUR_STARTER_PRICE_ID', -- DO NOT USE prod_TlLJPruuAOcroI. Look for 'price_...' under the Pricing section!
        4900, 
        '{"ai_minutes": 300}',
        '{"300 AI Minutes", "Basic Voice Support", "Email Support"}'
    ),
    (
        'pro', 
        'Professional', 
        'Advanced features for growing teams.', 
        'price_REPLACE_WITH_YOUR_PRO_PRICE_ID', -- e.g., price_1QfL...
        12900, 
        '{"ai_minutes": 1000}',
        '{"1000 AI Minutes", "Premium Voices", "Priority Support", "Analytics"}'
    ),
    (
        'elite', 
        'Elite', 
        'Full scale solution for high-volume operations.', 
        'price_REPLACE_WITH_YOUR_ELITE_PRICE_ID', -- e.g., price_1QfM...
        29900, 
        '{"ai_minutes": 3000}',
        '{"3000 AI Minutes", "Custom Voice Training", "Dedicated Account Manager", "API Access"}'
    );
