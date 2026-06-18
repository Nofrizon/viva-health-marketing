-- Create campaign_plans table
CREATE TABLE IF NOT EXISTS public.campaign_plans (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  goal TEXT NOT NULL DEFAULT '',
  campaign_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW()),
  campaign_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  selected_keyword TEXT,
  selected_event_name TEXT,
  selected_event_date TEXT,
  generated_ideas JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.campaign_plans ENABLE ROW LEVEL SECURITY;

-- Allow public access for anonymous key
DROP POLICY IF EXISTS "Enable all for anon" ON public.campaign_plans;
CREATE POLICY "Enable all for anon" ON public.campaign_plans
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaign_plans_month_year ON public.campaign_plans(campaign_month, campaign_year);
CREATE INDEX IF NOT EXISTS idx_campaign_plans_created_at ON public.campaign_plans(created_at DESC);