-- Create core user management tables with RLS policies
-- Based on Flask SQLAlchemy models for comprehensive user system

-- Users table (references auth.users)
CREATE TABLE IF NOT EXISTS public.users
(
    id
    UUID
    PRIMARY
    KEY
    REFERENCES
    auth
    .
    users
(
    id
) ON DELETE CASCADE,
    username VARCHAR
(
    255
) NOT NULL UNIQUE,
    email VARCHAR
(
    255
) NOT NULL UNIQUE,
    profile_picture VARCHAR
(
    255
),
    bio TEXT,
    register_ip VARCHAR
(
    45
) NOT NULL,
    created_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW()
    );

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policies for users
CREATE
POLICY "users_select_own" ON public.users
  FOR
SELECT USING (auth.uid() = id);

CREATE
POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE
POLICY "users_update_own" ON public.users
  FOR
UPDATE USING (auth.uid() = id);

CREATE
POLICY "users_delete_own" ON public.users
  FOR DELETE
USING (auth.uid() = id);

-- Allow public read access to basic user info (for profiles, comments, etc.)
CREATE
POLICY "users_public_read" ON public.users
  FOR
SELECT USING (true);

-- Roles table
CREATE TABLE IF NOT EXISTS public.roles
(
    id
    SERIAL
    PRIMARY
    KEY,
    name
    VARCHAR
(
    50
) NOT NULL UNIQUE,
    description VARCHAR
(
    255
) NOT NULL
    );

-- Permissions table
CREATE TABLE IF NOT EXISTS public.permissions
(
    id
    SERIAL
    PRIMARY
    KEY,
    code
    VARCHAR
(
    50
) NOT NULL UNIQUE,
    description VARCHAR
(
    255
) NOT NULL
    );

-- User roles junction table
CREATE TABLE IF NOT EXISTS public.user_roles
(
    user_id
    UUID
    REFERENCES
    public
    .
    users
(
    id
) ON DELETE CASCADE,
    role_id INTEGER REFERENCES public.roles
(
    id
)
  ON DELETE CASCADE,
    PRIMARY KEY
(
    user_id,
    role_id
)
    );

-- Role permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions
(
    role_id
    INTEGER
    REFERENCES
    public
    .
    roles
(
    id
) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES public.permissions
(
    id
)
  ON DELETE CASCADE,
    PRIMARY KEY
(
    role_id,
    permission_id
)
    );

-- Enable RLS on role-related tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles (users can see their own roles)
CREATE
POLICY "user_roles_select_own" ON public.user_roles
  FOR
SELECT USING (auth.uid() = user_id);

-- Admin can manage all roles (will be refined later)
CREATE
POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
