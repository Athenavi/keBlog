-- Function to upsert email subscription
CREATE
OR REPLACE FUNCTION public.upsert_email_subscription(
    p_user_id UUID,
    p_subscribed BOOLEAN
) RETURNS VOID AS $$
BEGIN
INSERT INTO public.email_subscriptions (user_id, subscribed)
VALUES (p_user_id, p_subscribed) ON CONFLICT (user_id) DO
UPDATE SET
    subscribed = EXCLUDED.subscribed;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;
