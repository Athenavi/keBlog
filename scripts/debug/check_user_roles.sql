-- ============================================
-- 检查当前用户的角色
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

-- 如果没有 admin 角色，执行以下 SQL 分配 admin 角色
-- 1. 先找到 admin 角色的 ID
SELECT id, name
FROM public.roles
WHERE name = 'admin';

-- 2. 如果你的邮箱对应的用户没有 admin 角色，执行：
-- INSERT INTO public.user_roles (user_id, role_id)
-- VALUES ('你的用户 ID', (SELECT id FROM public.roles WHERE name = 'admin'));
