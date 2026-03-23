-- Create media and file management tables

-- File hashes table for deduplication
CREATE TABLE IF NOT EXISTS public.file_hashes
(
    id
    BIGSERIAL
    PRIMARY
    KEY,
    hash
    VARCHAR
(
    64
) NOT NULL UNIQUE,
    filename VARCHAR
(
    255
) NOT NULL,
    reference_count INTEGER DEFAULT 1,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR
(
    100
) NOT NULL,
    storage_path VARCHAR
(
    512
) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

-- Media table
CREATE TABLE IF NOT EXISTS public.media
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
    hash VARCHAR
(
    64
) REFERENCES public.file_hashes
(
    hash
)
  ON DELETE CASCADE,
    original_filename VARCHAR
(
    255
) NOT NULL,
    created_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW()
    );

-- Enable RLS on media tables
ALTER TABLE public.file_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- RLS policies for media (users can only access their own media)
CREATE
POLICY "media_owner_all" ON public.media
  FOR ALL USING (auth.uid() = user_id);

-- File hashes can be read by anyone who has access to media referencing them
CREATE
POLICY "file_hashes_referenced_read" ON public.file_hashes
  FOR
SELECT USING (
    EXISTS (
    SELECT 1 FROM public.media m
    WHERE m.hash = file_hashes.hash AND m.user_id = auth.uid()
    )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_media_user_id ON public.media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_hash ON public.media(hash);
CREATE INDEX IF NOT EXISTS idx_file_hashes_hash ON public.file_hashes(hash);

CREATE
POLICY "file_hashes_select_authenticated" ON public.file_hashes
  FOR
SELECT TO authenticated
    USING (true);

CREATE
POLICY "file_hashes_insert_authenticated" ON public.file_hashes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE
POLICY "file_hashes_update_authenticated" ON public.file_hashes
  FOR
UPDATE TO authenticated
    USING (true)
WITH CHECK (true);

CREATE
POLICY "media_owner_insert" ON public.media
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);


