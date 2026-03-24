-- ============================================
-- 权限系统问题诊断和修复脚本
-- ============================================
-- 用于解决分配 admin 角色后仍无法访问管理页面的问题

-- ============================================
-- 步骤 1: 检查当前用户的角色
-- ============================================
-- 替换为你的邮箱地址
SELECT u.id          as user_id,
       u.username,
       u.email,
       r.id          as role_id,
       r.name        as role_name,
       r.description,
       ur.created_at as assigned_at
FROM public.users u
         LEFT JOIN public.user_roles ur ON u.id = ur.user_id
         LEFT JOIN public.roles r ON ur.role_id = r.id
WHERE u.email = 'YOUR_EMAIL@example.com' -- ⚠️ 修改为你的邮箱
ORDER BY r.name;

-- ============================================
-- 步骤 2: 检查是否存在 admin 角色
-- ============================================
SELECT id, name, description
FROM public.roles
WHERE name = 'admin';

-- 如果没有返回结果，说明需要运行初始化脚本
-- ============================================

-- ============================================
-- 步骤 3: 为用户分配 admin 角色（如果不存在）
-- ============================================
-- 替换为你的邮箱地址
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM public.users u,
     public.roles r
WHERE u.email = 'YOUR_EMAIL@example.com' -- ⚠️ 修改为你的邮箱
  AND r.name = 'admin' ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================
-- 步骤 4: 验证分配是否成功
-- ============================================
SELECT u.username,
       u.email,
       r.name                  as role_name,
       '✓ Admin role assigned' as status
FROM public.users u
         JOIN public.user_roles ur ON u.id = ur.user_id
         JOIN public.roles r ON ur.role_id = r.id
WHERE u.email = 'YOUR_EMAIL@example.com' -- ⚠️ 修改为你的邮箱
  AND r.name = 'admin';

-- 如果返回了结果，说明 admin 角色已成功分配

-- ============================================
-- 步骤 5: 检查所有用户的角色分配情况
-- ============================================
SELECT u.username,
       u.email,
       STRING_AGG(r.name, ', ') as roles,
       COUNT(r.id)              as role_count
FROM public.users u
         LEFT JOIN public.user_roles ur ON u.id = ur.user_id
         LEFT JOIN public.roles r ON ur.role_id = r.id
GROUP BY u.id, u.username, u.email
ORDER BY role_count DESC, u.username;

-- ============================================
-- 步骤 6: 检查权限和角色的关联
-- ============================================
SELECT r.name        as role_name,
       p.code        as permission_code,
       p.description as permission_description
FROM public.roles r
         LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
         LEFT JOIN public.permissions p ON rp.permission_id = p.id
WHERE r.name = 'admin'
ORDER BY p.code;

-- ============================================
-- 步骤 7: 清除可能的缓存（可选）
-- ============================================
-- Supabase 可能有查询缓存，重新执行以下查询可以刷新缓存
SELECT COUNT(*)
FROM public.user_roles;
SELECT COUNT(*)
FROM public.roles
WHERE name = 'admin';

-- ============================================
-- 快速修复：一键为第一个用户分配 admin 角色
-- ============================================
-- 如果你想让注册的第一个用户自动成为 admin
INSERT INTO public.user_roles (user_id, role_id)
SELECT (SELECT id FROM public.users ORDER BY created_at ASC LIMIT 1),
    (SELECT id FROM public.roles WHERE name = 'admin')
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = (SELECT id FROM public.users ORDER BY created_at ASC LIMIT 1)
  AND r.name = 'admin'
    );
