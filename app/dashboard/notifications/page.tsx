"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {ArrowLeft, Bell, Check, Trash2, Mail} from "lucide-react";
import Link from "next/link";
import {useNotifications} from "@/hooks/use-notifications";
import {formatDistanceToNow} from "date-fns";
import {zhCN} from "date-fns/locale";

export default function NotificationsPage() {
    const router = useRouter();
    const {
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
    } = useNotifications();

    const [isProcessing, setIsProcessing] = useState(false);

    const handleMarkAsRead = async (id: number) => {
        setIsProcessing(true);
        await markAsRead(id);
        setIsProcessing(false);
    };

    const handleMarkAllAsRead = async () => {
        setIsProcessing(true);
        await markAllAsRead();
        setIsProcessing(false);
    };

    const handleDeleteNotification = async (id: number) => {
        setIsProcessing(true);
        await deleteNotification(id);
        setIsProcessing(false);
    };

    const handleDeleteAll = async () => {
        if (confirm("Are you sure you want to delete all notifications?")) {
            setIsProcessing(true);
            await deleteAllNotifications();
            setIsProcessing(false);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'new_follower':
                return <Bell className="w-4 h-4"/>;
            case 'article_published':
                return <Mail className="w-4 h-4"/>;
            case 'comment':
                return <Mail className="w-4 h-4"/>;
            default:
                return <Bell className="w-4 h-4"/>;
        }
    };

    if (isLoading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button asChild variant="ghost" className="mb-4">
                            <Link href="/dashboard">
                                <ArrowLeft className="w-4 h-4 mr-2"/>
                                Back to Dashboard
                            </Link>
                        </Button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                                    <Bell className="w-7 h-7"/>
                                    Notifications
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {unreadCount > 0 ? `${unreadCount} unread notification(s)` : "No unread notifications"}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <Button
                                        onClick={handleMarkAllAsRead}
                                        variant="outline"
                                        size="sm"
                                        disabled={isProcessing}
                                    >
                                        <Check className="w-4 h-4 mr-2"/>
                                        Mark All Read
                                    </Button>
                                )}
                                {notifications.length > 0 && (
                                    <Button
                                        onClick={handleDeleteAll}
                                        variant="outline"
                                        size="sm"
                                        disabled={isProcessing}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2"/>
                                        Delete All
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 mb-6">
                            <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Notifications List */}
                    <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
                        <CardHeader>
                            <CardTitle>Your Notifications</CardTitle>
                            <CardDescription>Stay updated with your account activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {notifications.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 rounded-lg border transition-colors ${
                                                notification.is_read
                                                    ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {getNotificationIcon(notification.type)}
                                                        <Badge variant={notification.is_read ? "secondary" : "default"}>
                                                            {notification.type}
                                                        </Badge>
                                                        {!notification.is_read && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                New
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-900 dark:text-slate-100 mb-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {formatDistanceToNow(new Date(notification.created_at), {
                                                            addSuffix: true,
                                                            locale: zhCN
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!notification.is_read && (
                                                        <Button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={isProcessing}
                                                        >
                                                            <Check className="w-4 h-4"/>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        onClick={() => handleDeleteNotification(notification.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isProcessing}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}