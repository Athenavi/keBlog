# 权限和角色管理系统

## 概述

本系统实现了完整的基于角色的访问控制（RBAC），包括角色管理、权限管理和用户角色分配功能。

## 数据库表结构

### 核心表

1. **roles** - 角色表
    - `id`: 角色 ID
    - `name`: 角色名称（如：admin, editor, author）
    - `description`: 角色描述

2. **permissions** - 权限表
    - `id`: 权限 ID
    - `code`: 权限代码（如：articles.create）
    - `description`: 权限描述

3. **role_permissions** - 角色权限关联表
    - `role_id`: 角色 ID
    - `permission_id`: 权限 ID

4. **user_roles** - 用户角色关联表
    - `user_id`: 用户 ID
    - `role_id`: 角色 ID

## 默认角色

系统预定义了 5 个角色：

1. **admin**（系统管理员）
    - 拥有所有权限
    - 可以执行任何操作

2. **editor**（编辑）
    - 可以管理和发布所有内容
    - 可以查看所有文章和评论
    - 可以管理媒体库
    - 可以查看活动日志

3. **author**（作者）
    - 可以创建和编辑自己的文章
    - 可以发布自己的内容
    - 可以上传媒体文件
    - 可以访问管理后台

4. **contributor**（贡献者）
    - 可以创建内容但不能发布
    - 可以上传媒体文件
    - 可以创建评论

5. **subscriber**（订阅者）
    - 只能查看内容
    - 可以访问管理后台（只读）

## 权限代码说明

### 文章权限

- `articles.create` - 创建新文章
- `articles.edit` - 编辑已有文章
- `articles.delete` - 删除文章
- `articles.publish` - 发布文章
- `articles.view_all` - 查看所有文章（包括草稿）

### 评论权限

- `comments.create` - 创建评论
- `comments.edit` - 编辑评论
- `comments.delete` - 删除评论
- `comments.view_all` - 查看所有评论

### 媒体权限

- `media.upload` - 上传媒体文件
- `media.delete` - 删除媒体文件
- `media.view_all` - 查看所有媒体文件

### 分类权限

- `categories.create` - 创建分类
- `categories.edit` - 编辑分类
- `categories.delete` - 删除分类
- `categories.manage` - 管理分类

### 用户管理权限

- `users.view` - 查看用户列表
- `users.edit` - 编辑用户信息
- `users.delete` - 删除用户
- `users.assign_roles` - 分配用户角色

### 角色和权限管理

- `roles.view` - 查看角色列表
- `roles.create` - 创建角色
- `roles.edit` - 编辑角色
- `roles.delete` - 删除角色
- `roles.assign_permissions` - 为角色分配权限

- `permissions.view` - 查看权限列表
- `permissions.create` - 创建权限
- `permissions.edit` - 编辑权限
- `permissions.delete` - 删除权限

### 系统权限

- `admin.dashboard` - 访问管理后台
- `admin.settings` - 管理系统设置
- `admin.activity_logs` - 查看活动日志

## 初始化数据

运行以下 SQL 脚本来初始化默认的权限和角色数据：

```bash
psql -U your_username -d your_database -f scripts/009_seed_permissions_and_roles.sql
```

或在 Supabase Dashboard 的 SQL Editor 中执行脚本内容。

## 管理页面

### 访问路径

1. **角色管理**: `/dashboard/roles`
    - 创建、编辑、删除角色
    - 为角色分配权限
    - 查看角色权限列表

2. **权限管理**: `/dashboard/permissions`
    - 创建、编辑、删除权限
    - 定义权限代码和描述

3. **用户角色分配**: `/dashboard/user-roles`
    - 查看所有用户及其角色
    - 为用户分配角色
    - 管理用户权限

### 访问控制

所有管理页面都需要 `admin` 角色才能访问。非 admin 用户尝试访问会被重定向到未授权页面。

## 使用方法

### 在代码中检查权限

#### Server Component 中

```typescript
import {hasPermission, hasRole} from "@/lib/auth"

export default async function SomeComponent() {
    const canEdit = await hasPermission("articles.edit")
    const isAdmin = await hasRole("admin")

    if (!canEdit) {
        return <div>No
        permission < /div>
    }

    // ...
}
```

#### Client Component 中

```typescript
"use client"

import {useAuth} from "@/hooks/use-auth"

export default function SomeComponent() {
    const {hasPermission, hasRole, isAdmin} = useAuth()

    if (!hasPermission("articles.edit")) {
        return <div>No
        permission < /div>
    }

    if (isAdmin) {
        // Show admin features
    }

    // ...
}
```

#### 使用 RoleGuard 组件

```typescript
import {RoleGuard} from "@/components/auth/role-guard"

// 检查角色
<RoleGuard requiredRole = "admin" >
    <AdminPanel / >
    </RoleGuard>

    // 检查权限
    < RoleGuard
requiredPermission = "articles.delete" >
    <DeleteButton / >
    </RoleGuard>

    // 检查多个条件（满足任一即可）
    < RoleGuard
requiredRole = "admin"
requiredPermission = "articles.delete"
    >
    <DeleteButton / >
    </RoleGuard>

    // 检查多个条件（必须全部满足）
    < RoleGuard
requiredRole = "admin"
requiredPermission = "articles.delete"
requireAll = {true}
    >
    <DeleteButton / >
    </RoleGuard>

    // 自定义回退内容
    < RoleGuard
requiredRole = "admin"
fallback = { < div > Need
admin
access < /div>}
>
<AdminPanel / >
</RoleGuard>
```

### API 路由中的权限检查

```typescript
import {createClient} from "@/lib/supabase/server"
import {hasPermission} from "@/lib/auth"
import {NextResponse} from "next/server"

export async function POST(request: Request) {
    const supabase = await createClient()

    // Check authentication
    const {data: {user}} = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    // Check permission
    const canCreate = await hasPermission("articles.create")
    if (!canCreate) {
        return NextResponse.json({error: "Forbidden"}, {status: 403})
    }

    // ... proceed with operation
}
```

## 添加新权限

1. 在数据库中插入新权限：

```sql
INSERT INTO public.permissions (code, description)
VALUES ('your.module.action', '权限描述');
```

2. 在需要的地方进行权限检查（使用 `hasPermission` 或 `RoleGuard`）

3. 将权限分配给相应的角色：

```sql
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r,
     public.permissions p
WHERE r.name = 'role_name'
  AND p.code = 'your.module.action';
```

## 添加新角色

1. 创建角色：

```sql
INSERT INTO public.roles (name, description)
VALUES ('role_name', '角色描述');
```

2. 为角色分配权限：

```sql
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r,
     public.permissions p
WHERE r.name = 'role_name'
  AND p.code IN ('permission1', 'permission2', . . .);
```

3. 为用户分配角色：

```sql
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM public.users u,
     public.roles r
WHERE u.username = 'username'
  AND r.name = 'role_name';
```

## 安全建议

1. **最小权限原则**: 只授予用户完成工作所需的最小权限
2. **定期审计**: 定期检查用户角色和权限分配
3. **角色分离**: 关键操作应该需要多个角色共同完成
4. **权限审查**: 定期审查权限定义，移除不再需要的权限
5. **敏感操作日志**: 所有权限相关操作都应该记录在活动日志中

## 故障排除

### 用户无法访问某个页面

1. 检查用户是否有所需的角色
2. 检查角色是否有所需的权限
3. 检查页面中的权限检查逻辑是否正确

### 权限更改后不生效

1. 清除浏览器缓存
2. 重新登录以刷新会话
3. 检查数据库中的权限分配是否正确

### 无法删除角色

- `admin` 角色不能被删除
- 确保该角色没有被用户使用

## 扩展

### 自定义权限检查逻辑

可以根据业务需求创建更复杂的权限检查逻辑：

```typescript
// 检查用户是否可以编辑某篇文章
async function canEditArticle(articleId: number): Promise<boolean> {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()

    if (!user) return false

    // Admin can edit any article
    if (await hasRole("admin")) return true

    // Check if user is the author
    const {data: article} = await supabase
        .from("articles")
        .select("user_id")
        .eq("id", articleId)
        .single()

    return article?.user_id === user.id
}
```

### 动态权限

可以基于时间、状态等条件实现动态权限：

```typescript
async function canPublishArticle(articleId: number): Promise<boolean> {
    const hasBasicPermission = await hasPermission("articles.publish")
    if (!hasBasicPermission) return false

    // Additional checks
    // - Check if user has reached publishing limit
    // - Check if article meets quality standards
    // - Check if it's within allowed time window

    return true
}
```

## 注意事项

1. 修改权限系统后，建议清除缓存并重新登录
2. 生产环境中应该限制谁可以创建和分配角色
3. 重要的权限变更应该记录审计日志
4. 定期备份角色和权限配置数据
