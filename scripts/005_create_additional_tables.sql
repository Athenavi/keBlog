-- Create additional feature tables (custom fields, reports, urls, events)

-- Custom fields for user profiles
CREATE TABLE IF NOT EXISTS public.custom_fields
(
    id
    SERIAL
    PRIMARY
    KEY,
    user_id
    UUID
    REFERENCES
    public
    .
    users
(
    id
) ON DELETE CASCADE,
    field_name VARCHAR
(
    100
) NOT NULL,
    field_value TEXT NOT NULL
    );

-- Reports table for content moderation
CREATE TABLE IF NOT EXISTS public.reports
(
    id
    SERIAL
    PRIMARY
    KEY,
    reported_by
    UUID
    REFERENCES
    public
    .
    users
(
    id
) ON DELETE CASCADE,
    content_type VARCHAR
(
    20
) NOT NULL CHECK
(
    content_type
    IN
(
    'Article',
    'Comment'
)),
    content_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW()
    );

-- URL shortening table
CREATE TABLE IF NOT EXISTS public.urls
(
    id
    SERIAL
    PRIMARY
    KEY,
    long_url
    VARCHAR
(
    255
) NOT NULL,
    short_url VARCHAR
(
    10
) NOT NULL UNIQUE,
    user_id UUID REFERENCES public.users
(
    id
) ON DELETE CASCADE,
    created_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW()
    );

-- Events table
CREATE TABLE IF NOT EXISTS public.events
(
    id
    SERIAL
    PRIMARY
    KEY,
    title
    VARCHAR
(
    255
) NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

-- Enable RLS on additional tables
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_fields
CREATE
POLICY "custom_fields_owner_all" ON public.custom_fields
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for reports (users can create reports, admins can see all)
CREATE
POLICY "reports_create_own" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reported_by);

CREATE
POLICY "reports_read_own" ON public.reports
  FOR
SELECT USING (auth.uid() = reported_by);

-- RLS policies for urls
CREATE
POLICY "urls_owner_all" ON public.urls
  FOR ALL USING (auth.uid() = user_id);

CREATE
POLICY "urls_public_read" ON public.urls
  FOR
SELECT USING (true);
-- Allow public access for URL resolution

-- RLS policies for events (public read, admin manage)
CREATE
POLICY "events_public_read" ON public.events
  FOR
SELECT USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_fields_user_id ON public.custom_fields(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON public.reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_reports_content ON public.reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON public.urls(user_id);
CREATE INDEX IF NOT EXISTS idx_urls_short_url ON public.urls(short_url);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
