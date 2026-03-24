-- Seed initial permissions and roles data
-- This script should be run after the tables are created

-- Insert default permissions
INSERT INTO public.permissions (code, description)
VALUES
    -- Article permissions
    ('articles.create', '创建新文章'),
    ('articles.edit', '编辑已有文章'),
    ('articles.delete', '删除文章'),
    ('articles.publish', '发布文章'),
    ('articles.view_all', '查看所有文章（包括草稿）'),

    -- Comment permissions
    ('comments.create', '创建评论'),
    ('comments.edit', '编辑评论'),
    ('comments.delete', '删除评论'),
    ('comments.view_all', '查看所有评论'),

    -- Media permissions
    ('media.upload', '上传媒体文件'),
    ('media.delete', '删除媒体文件'),
    ('media.view_all', '查看所有媒体文件'),

    -- Category permissions
    ('categories.create', '创建分类'),
    ('categories.edit', '编辑分类'),
    ('categories.delete', '删除分类'),
    ('categories.manage', '管理分类'),

    -- User management permissions
    ('users.view', '查看用户列表'),
    ('users.edit', '编辑用户信息'),
    ('users.delete', '删除用户'),
    ('users.assign_roles', '分配用户角色'),

    -- Role and permission management
    ('roles.view', '查看角色列表'),
    ('roles.create', '创建角色'),
    ('roles.edit', '编辑角色'),
    ('roles.delete', '删除角色'),
    ('roles.assign_permissions', '为角色分配权限'),

    ('permissions.view', '查看权限列表'),
    ('permissions.create', '创建权限'),
    ('permissions.edit', '编辑权限'),
    ('permissions.delete', '删除权限'),

    -- System permissions
    ('admin.dashboard', '访问管理后台'),
    ('admin.settings', '管理系统设置'),
    ('admin.activity_logs', '查看活动日志') ON CONFLICT (code) DO NOTHING;

-- Insert default roles
INSERT INTO public.roles (name, description)
VALUES ('admin', '系统管理员 - 拥有所有权限'),
       ('editor', '编辑 - 可以管理和发布内容'),
       ('author', '作者 - 可以创建和编辑自己的内容'),
       ('contributor', '贡献者 - 可以创建内容但不能发布'),
       ('subscriber', '订阅者 - 只能查看内容') ON CONFLICT (name) DO NOTHING;

-- Assign all permissions to admin role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
         CROSS JOIN public.permissions p
WHERE r.name = 'admin' ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign content management permissions to editor role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
         CROSS JOIN public.permissions p
WHERE r.name = 'editor'
  AND p.code IN (
                 'articles.create', 'articles.edit', 'articles.delete', 'articles.publish', 'articles.view_all',
                 'comments.create', 'comments.edit', 'comments.delete', 'comments.view_all',
                 'media.upload', 'media.delete', 'media.view_all',
                 'categories.manage', 'admin.activity_logs'
    )
    ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign basic content creation permissions to author role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
         CROSS JOIN public.permissions p
WHERE r.name = 'author'
  AND p.code IN (
                 'articles.create', 'articles.edit', 'articles.publish',
                 'comments.create', 'comments.edit',
                 'media.upload',
                 'admin.dashboard'
    )
    ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign limited permissions to contributor role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
         CROSS JOIN public.permissions p
WHERE r.name = 'contributor'
  AND p.code IN (
                 'articles.create',
                 'comments.create',
                 'media.upload'
    )
    ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign read-only permissions to subscriber role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
         CROSS JOIN public.permissions p
WHERE r.name = 'subscriber'
  AND p.code IN (
    'admin.dashboard'
    )
    ON CONFLICT (role_id, permission_id) DO NOTHING;
