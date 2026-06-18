-- Create stores table
CREATE TABLE IF NOT EXISTS public.stores (
  id BIGSERIAL PRIMARY KEY,
  store_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  regional TEXT NOT NULL,
  city TEXT NOT NULL,
  rating NUMERIC(2,1) DEFAULT 0,
  address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create store_keywords table
CREATE TABLE IF NOT EXISTS public.store_keywords (
  id BIGSERIAL PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES public.stores(store_id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  current_rank INTEGER DEFAULT 0,
  current_stars NUMERIC(2,1) DEFAULT 0,
  previous_stars NUMERIC(2,1),
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (store_id, keyword)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_keywords ENABLE ROW LEVEL SECURITY;

-- Allow public access for anonymous key (since app uses anon key)
CREATE POLICY "Enable all for anon" ON public.stores
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all for anon" ON public.store_keywords
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stores_store_id ON public.stores(store_id);
CREATE INDEX IF NOT EXISTS idx_stores_city ON public.stores(city);
CREATE INDEX IF NOT EXISTS idx_store_keywords_store_id ON public.store_keywords(store_id);
CREATE INDEX IF NOT EXISTS idx_store_keywords_keyword ON public.store_keywords(keyword);