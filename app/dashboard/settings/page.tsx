"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {createClient} from "@/lib/supabase/client"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Switch} from "@/components/ui/switch"
import {Label} from "@/components/ui/label"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {ArrowLeft, Bell, Settings, Shield, Trash2} from "lucide-react"
import Link from "next/link"

interface UserSettings {
    email_subscriptions: boolean
    notifications_enabled: boolean
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<UserSettings>({
        email_subscriptions: true,
        notifications_enabled: true,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const {
                data: {user},
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
                throw new Error("Authentication failed");
            }

            // Fetch email subscription status from database
            const {data: emailSubData, error: emailSubError} = await supabase
                .from('email_subscriptions')
                .select('subscribed')
                .eq('user_id', user.id)
                .single();

            if (emailSubError && emailSubError.code !== 'PGRST116') { // Record not found
                throw emailSubError;
            }
            
            setSettings({
                email_subscriptions: emailSubData?.subscribed ?? true,
                notifications_enabled: true,
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            setError("Failed to load settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            router.push("/auth/login")
            router.refresh()
        } catch (error) {
            setError("Failed to sign out")
        }
    }

    const handleSaveSettings = async () => {
        setIsSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const {
                data: {user},
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
                throw new Error("Authentication failed");
            }

            // Update email subscription status in database
            const {error: updateError} = await supabase.rpc('upsert_email_subscription', {
                p_user_id: user.id,
                p_subscribed: settings.email_subscriptions
            });

            if (updateError) {
                throw updateError;
            }
            
            setSuccess("Settings saved successfully!")
        } catch (error) {
            console.error('Error saving settings:', error);
            setError("Failed to save settings")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button asChild variant="ghost" className="mb-4">
                            <Link href="/dashboard">
                                <ArrowLeft className="w-4 h-4 mr-2"/>
                                Back to Dashboard
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Settings</h1>
                        <p className="text-slate-600 dark:text-slate-400">Manage your account preferences and
                            security</p>
                    </div>

                    <div className="space-y-6">
                        {/* Notifications Settings */}
                        <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5"/>
                                    Notifications
                                </CardTitle>
                                <CardDescription>Configure how you receive notifications</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="email-notifications" className="text-base">
                                            Email Notifications
                                        </Label>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Receive notifications about your account via email
                                        </p>
                                    </div>
                                    <Switch
                                        id="email-notifications"
                                        checked={settings.email_subscriptions}
                                        onCheckedChange={(checked) => setSettings((prev) => ({
                                            ...prev,
                                            email_subscriptions: checked
                                        }))}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="push-notifications" className="text-base">
                                            Push Notifications
                                        </Label>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Receive push notifications in your browser
                                        </p>
                                    </div>
                                    <Switch
                                        id="push-notifications"
                                        checked={settings.notifications_enabled}
                                        onCheckedChange={(checked) => setSettings((prev) => ({
                                            ...prev,
                                            notifications_enabled: checked
                                        }))}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Privacy Settings */}
                        <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5"/>
                                    Privacy & Security
                                </CardTitle>
                                <CardDescription>Manage your privacy and security preferences</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                                    <Link href="/dashboard/change-password">
                                        <Shield className="w-4 h-4 mr-2"/>
                                        Change Password
                                    </Link>
                                </Button>

                                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                                    <Link href="/dashboard/privacy">
                                        <Shield className="w-4 h-4 mr-2"/>
                                        Privacy Settings
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Account Management */}
                        <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5"/>
                                    Account Management
                                </CardTitle>
                                <CardDescription>Manage your account and data</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button onClick={handleLogout} variant="outline"
                                        className="w-full justify-start bg-transparent">
                                    <ArrowLeft className="w-4 h-4 mr-2"/>
                                    Sign Out
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                                >
                                    <Trash2 className="w-4 h-4 mr-2"/>
                                    Delete Account
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Messages */}
                        {error && (
                            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                                <AlertDescription
                                    className="text-green-700 dark:text-green-400">{success}</AlertDescription>
                            </Alert>
                        )}

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700"
                                    disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Settings"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
