-- Create social features tables (subscriptions, notifications)

-- User subscriptions (follow system)
CREATE TABLE IF NOT EXISTS public.user_subscriptions
(
    id
    SERIAL
    PRIMARY
    KEY,
    subscriber_id
    UUID
    REFERENCES
    public
    .
    users
(
    id
) ON DELETE CASCADE,
    subscribed_user_id UUID REFERENCES public.users
(
    id
)
  ON DELETE CASCADE,
    created_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW(),
    UNIQUE
(
    subscriber_id,
    subscribed_user_id
)
    );

-- Category subscriptions
CREATE TABLE IF NOT EXISTS public.category_subscriptions
(
    id
    SERIAL
    PRIMARY
    KEY,
    subscriber_id
    UUID
    REFERENCES
    public
    .
    users
(
    id
) ON DELETE CASCADE,
    category_id INTEGER REFERENCES public.categories
(
    id
)
  ON DELETE CASCADE,
    created_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW(),
    UNIQUE
(
    subscriber_id,
    category_id
)
    );

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications
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
    type VARCHAR
(
    100
) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW()
    );

-- Email subscriptions
CREATE TABLE IF NOT EXISTS public.email_subscriptions
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
) ON DELETE CASCADE UNIQUE,
    subscribed BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW()
    );

-- Enable RLS on social tables
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_subscriptions
CREATE
POLICY "user_subscriptions_owner_all" ON public.user_subscriptions
  FOR ALL USING (auth.uid() = subscriber_id);

CREATE
POLICY "user_subscriptions_public_read" ON public.user_subscriptions
  FOR
SELECT USING (true);
-- Allow reading who follows whom

-- RLS policies for category_subscriptions
CREATE
POLICY "category_subscriptions_owner_all" ON public.category_subscriptions
  FOR ALL USING (auth.uid() = subscriber_id);

-- RLS policies for notifications
CREATE
POLICY "notifications_owner_all" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for email_subscriptions
CREATE
POLICY "email_subscriptions_owner_all" ON public.email_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_subscriber ON public.user_subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_subscribed ON public.user_subscriptions(subscribed_user_id);
CREATE INDEX IF NOT EXISTS idx_category_subscriptions_subscriber ON public.category_subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_category_subscriptions_category ON public.category_subscriptions(category_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
