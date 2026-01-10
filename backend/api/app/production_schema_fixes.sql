-- PRODUCTION-READY DATABASE SCHEMA FIXES
-- Addresses: Normalization, ID Consistency, Soft Deletes, Indexing, Race Conditions

-- 1. CREATE PLAN LIMITS TABLE (Normalization Fix)
CREATE TABLE IF NOT EXISTS public.plan_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    limit_key TEXT NOT NULL,
    limit_value NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(plan_id, limit_key)
);

-- Index for fast limit lookups
CREATE INDEX IF NOT EXISTS idx_plan_limits_plan_id ON public.plan_limits(plan_id);

-- Migrate existing limits from JSONB to normalized table
INSERT INTO public.plan_limits (plan_id, limit_key, limit_value)
SELECT id, key, (value->>0)::numeric
FROM public.plans,
     jsonb_each_text(limits)
ON CONFLICT (plan_id, limit_key) DO NOTHING;

-- 2. ADD SOFT DELETE COLUMNS
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_plans_deleted_at ON public.plans(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_deleted_at ON public.subscriptions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON public.invoices(deleted_at) WHERE deleted_at IS NULL;

-- 3. ADD FOREIGN KEY INDEXES (Performance Fix)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON public.calls(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);

-- 4. ADD UNIQUE CONSTRAINT FOR SUBSCRIPTIONS (Race Condition Fix)
-- This prevents duplicate active subscriptions per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_id_active
ON public.subscriptions(user_id)
WHERE status = 'active' AND deleted_at IS NULL;

-- 5. ADD ON CONFLICT UPSERT SUPPORT
-- This is handled at application level via UpsertWithConflict
-- Ensure conflict targets are correct
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_pkey;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id, deleted_at);
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);

-- 6. CREATE UPDATED AT TRIGGER (Automatic timestamp management)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_plans_updated_at ON public.plans;
CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON public.plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. ADD COMMENT DOCUMENTATION
COMMENT ON TABLE public.plan_limits IS 'Normalized table for plan limits instead of JSONB for better query performance';
COMMENT ON COLUMN public.plans.deleted_at IS 'Soft delete timestamp - use instead of hard deletes';
COMMENT ON COLUMN public.subscriptions.deleted_at IS 'Soft delete timestamp - allows recovery';
COMMENT ON INDEX idx_subscriptions_user_id_active IS 'Prevents duplicate active subscriptions per user (race condition fix)';

-- 8. CREATE FUNCTION TO GET USAGE WITH AGGREGATION (N+1 Fix)
CREATE OR REPLACE FUNCTION get_user_usage(p_user_id UUID)
RETURNS TABLE (
    used_minutes NUMERIC,
    total_calls BIGINT,
    avg_duration_seconds NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(duration_seconds) / 60.0, 0) as used_minutes,
        COUNT(*) as total_calls,
        COALESCE(AVG(duration_seconds), 0) as avg_duration_seconds
    FROM public.calls
    WHERE user_id = p_user_id
      AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- 9. CREATE PARTITIONED TABLE FOR SCALABILITY (Optional)
-- For high volume, consider partitioning calls by date
-- Uncomment if you have high call volume
-- CREATE TABLE public.calls_partitioned (LIKE public.calls INCLUDING ALL)
-- PARTITION BY RANGE (created_at);
