-- Create content management tables (articles, comments, categories)

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories
(
    id
    SERIAL
    PRIMARY
    KEY,
    name
    VARCHAR
(
    255
) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP
                         WITH TIME ZONE DEFAULT NOW()
    );

-- Articles table
CREATE TABLE IF NOT EXISTS public.articles
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
    slug VARCHAR
(
    255
) NOT NULL UNIQUE,
    user_id UUID REFERENCES public.users
(
    id
) ON DELETE SET NULL,
    hidden BOOLEAN DEFAULT FALSE NOT NULL,
    views BIGINT DEFAULT 0 NOT NULL,
    likes BIGINT DEFAULT 0 NOT NULL,
    status VARCHAR
(
    20
) DEFAULT 'Draft' CHECK
(
    status
    IN
(
    'Draft',
    'Published',
    'Deleted'
)),
    cover_image VARCHAR
(
    255
),
    article_type VARCHAR
(
    50
),
    excerpt TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    tags VARCHAR
(
    255
) NOT NULL DEFAULT '',
    created_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW()
    );

-- Article content table (separate for performance)
CREATE TABLE IF NOT EXISTS public.article_content
(
    article_id
    INTEGER
    PRIMARY
    KEY
    REFERENCES
    public
    .
    articles
(
    id
) ON DELETE CASCADE,
    password VARCHAR
(
    128
),
    content TEXT,
    language_code VARCHAR
(
    10
) DEFAULT 'zh-CN' NOT NULL,
    updated_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW()
    );

-- Article i18n table for multilingual support
CREATE TABLE IF NOT EXISTS public.article_i18n
(
    id
    SERIAL
    PRIMARY
    KEY,
    article_id
    INTEGER
    REFERENCES
    public
    .
    articles
(
    id
) ON DELETE CASCADE,
    language_code VARCHAR
(
    10
) NOT NULL,
    title VARCHAR
(
    255
) NOT NULL,
    slug VARCHAR
(
    255
) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    created_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW(),
    UNIQUE
(
    article_id,
    language_code
),
    UNIQUE
(
    article_id,
    language_code,
    slug
)
    );

-- Comments table with hierarchical structure
CREATE TABLE IF NOT EXISTS public.comments
(
    id
    SERIAL
    PRIMARY
    KEY,
    article_id
    INTEGER
    REFERENCES
    public
    .
    articles
(
    id
) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users
(
    id
)
  ON DELETE CASCADE,
    parent_id INTEGER REFERENCES public.comments
(
    id
)
  ON DELETE CASCADE,
    content TEXT NOT NULL,
    ip VARCHAR
(
    50
),
    user_agent VARCHAR
(
    255
),
    created_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW()
    );

-- Enable RLS on content tables
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_i18n ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for articles
CREATE
POLICY "articles_public_read_published" ON public.articles
  FOR
SELECT USING (status = 'Published' AND hidden = FALSE);

CREATE
POLICY "articles_author_all" ON public.articles
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for article_content
CREATE
POLICY "article_content_public_read" ON public.article_content
  FOR
SELECT USING (
    EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.id = article_id AND a.status = 'Published' AND a.hidden = FALSE
    )
    );

CREATE
POLICY "article_content_author_all" ON public.article_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.articles a 
      WHERE a.id = article_id AND a.user_id = auth.uid()
    )
  );

-- RLS policies for comments
CREATE
POLICY "comments_public_read" ON public.comments
  FOR
SELECT USING (
    EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.id = article_id AND a.status = 'Published' AND a.hidden = FALSE
    )
    );

CREATE
POLICY "comments_authenticated_insert" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE
POLICY "comments_author_update_delete" ON public.comments
  FOR
UPDATE USING (auth.uid() = user_id);

CREATE
POLICY "comments_author_delete" ON public.comments
  FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON public.articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_views ON public.articles(views);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);
