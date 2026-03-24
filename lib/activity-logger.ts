// Activity logging utility functions

import {createClient} from "@/lib/supabase/server";
import {NextRequest} from "next/server";

export interface ActivityLogData {
    activity_code: string;
    entity_type: string;
    entity_id?: string;
    title: string;
    description?: string;
    metadata?: Record<string, any>;
}

export interface ActivityLogResponse {
    success: boolean;
    log_id?: number;
    message?: string;
    error?: string;
}

/**
 * Log an activity to the database
 */
export async function logActivity(data: ActivityLogData, request?: NextRequest): Promise<ActivityLogResponse> {
    try {
        const supabase = await createClient();

        // Get client IP and user agent if not provided
        const ipAddress = request?.headers.get('x-forwarded-for')?.split(',')[0] ||
            request?.headers.get('x-real-ip') || undefined;
        const userAgent = request?.headers.get('user-agent') || undefined;

        // Call the database function to log activity
        const {data: logId, error} = await supabase.rpc('log_activity', {
            p_user_id: (await supabase.auth.getUser()).data.user?.id,
            p_activity_code: data.activity_code,
            p_entity_type: data.entity_type,
            p_entity_id: data.entity_id || null,
            p_title: data.title,
            p_description: data.description || null,
            p_metadata: data.metadata || null,
            p_ip_address: ipAddress || null,
            p_user_agent: userAgent || null
        });

        if (error) {
            console.error('Error logging activity:', error);
            return {success: false, error: error.message};
        }

        return {success: true, log_id: logId as number, message: 'Activity logged successfully'};
    } catch (error) {
        console.error('Error logging activity:', error);
        return {success: false, error: 'Failed to log activity'};
    }
}

/**
 * Predefined activity logging functions for common actions
 */

export async function logArticleCreated(articleId: string, articleTitle: string, userId?: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'article_created',
        entity_type: 'article',
        entity_id: articleId,
        title: '创建了新文章',
        description: `文章标题：'${articleTitle}'`,
        metadata: {article_title: articleTitle, user_id: userId}
    }, request);
}

export async function logArticleUpdated(articleId: string, articleTitle: string, userId?: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'article_updated',
        entity_type: 'article',
        entity_id: articleId,
        title: '更新了文章',
        description: `文章标题：'${articleTitle}'`,
        metadata: {article_title: articleTitle, user_id: userId}
    }, request);
}

export async function logArticleDeleted(articleId: string, articleTitle: string, userId?: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'article_deleted',
        entity_type: 'article',
        entity_id: articleId,
        title: '删除了文章',
        description: `文章标题：'${articleTitle}'`,
        metadata: {article_title: articleTitle, user_id: userId}
    }, request);
}

export async function logArticlePublished(articleId: string, articleTitle: string, userId?: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'article_published',
        entity_type: 'article',
        entity_id: articleId,
        title: '发布了文章',
        description: `文章标题：'${articleTitle}'`,
        metadata: {article_title: articleTitle, user_id: userId}
    }, request);
}

export async function logMediaUploaded(mediaId: string, filename: string, fileSize: number, userId?: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'media_uploaded',
        entity_type: 'media',
        entity_id: mediaId,
        title: '上传了新媒体文件',
        description: `文件：'${filename}'`,
        metadata: {filename, file_size: fileSize, user_id: userId}
    }, request);
}

export async function logMediaDeleted(mediaId: string, filename: string, userId?: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'media_deleted',
        entity_type: 'media',
        entity_id: mediaId,
        title: '删除了媒体文件',
        description: `文件：'${filename}'`,
        metadata: {filename, user_id: userId}
    }, request);
}

export async function logUserRegistered(userId: string, username: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'user_registered',
        entity_type: 'user',
        entity_id: userId,
        title: '新用户注册',
        description: `用户：'${username}' 加入了系统`,
        metadata: {username, user_id: userId}
    }, request);
}

export async function logUserLogin(userId: string, username: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'user_login',
        entity_type: 'user',
        entity_id: userId,
        title: '用户登录',
        description: `用户：'${username}' 登录了系统`,
        metadata: {username, user_id: userId}
    }, request);
}

export async function logUserLogout(userId: string, username: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'user_logout',
        entity_type: 'user',
        entity_id: userId,
        title: '用户登出',
        description: `用户：'${username}' 登出了系统`,
        metadata: {username, user_id: userId}
    }, request);
}

export async function logCommentCreated(commentId: string, articleTitle: string, userId?: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'comment_created',
        entity_type: 'comment',
        entity_id: commentId,
        title: '创建了评论',
        description: `在文章：'${articleTitle}' 下创建了评论`,
        metadata: {article_title: articleTitle, user_id: userId}
    }, request);
}

export async function logCommentDeleted(commentId: string, articleTitle: string, userId?: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'comment_deleted',
        entity_type: 'comment',
        entity_id: commentId,
        title: '删除了评论',
        description: `在文章：'${articleTitle}' 下删除了评论`,
        metadata: {article_title: articleTitle, user_id: userId}
    }, request);
}

export async function logProfileUpdated(userId: string, username: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'profile_updated',
        entity_type: 'user',
        entity_id: userId,
        title: '更新了个人资料',
        description: `用户：'${username}' 更新了个人资料`,
        metadata: {username, user_id: userId}
    }, request);
}

export async function logPasswordChanged(userId: string, username: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'password_changed',
        entity_type: 'user',
        entity_id: userId,
        title: '修改了密码',
        description: `用户：'${username}' 修改了密码`,
        metadata: {username, user_id: userId}
    }, request);
}

export async function logRoleAssigned(userId: string, username: string, roleName: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'role_assigned',
        entity_type: 'user',
        entity_id: userId,
        title: '分配了角色',
        description: `为用户：'${username}' 分配了角色：${roleName}`,
        metadata: {username, role_name: roleName, user_id: userId}
    }, request);
}

export async function logPermissionGranted(userId: string, username: string, permissionName: string, request?: NextRequest) {
    return logActivity({
        activity_code: 'permission_granted',
        entity_type: 'user',
        entity_id: userId,
        title: '授予了权限',
        description: `为用户：'${username}' 授予了权限：${permissionName}`,
        metadata: {username, permission_name: permissionName, user_id: userId}
    }, request);
}
