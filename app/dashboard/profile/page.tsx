"use client"

import type React from "react"
import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {ArrowLeft, Upload, User} from "lucide-react"
import Link from "next/link"

interface UserProfile {
    id: string
    username: string
    email: string
    bio: string | null
    profile_picture: string | null
    created_at: string
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [username, setUsername] = useState("")
    const [bio, setBio] = useState("")
    const [profilePicture, setProfilePicture] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const response = await fetch("/api/auth/user")
            if (!response.ok) {
                if (response.status === 401) {
                    router.push("/auth/login")
                    return
                }
                throw new Error("Failed to fetch profile")
            }

            const data = await response.json()
            setProfile(data.user)
            setUsername(data.user.username || "")
            setBio(data.user.bio || "")
            setProfilePicture(data.user.profile_picture || "")
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to load profile")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await fetch("/api/auth/user", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    bio,
                    profile_picture: profilePicture,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Failed to update profile")
            }

            const data = await response.json()
            setProfile(data.user)
            setSuccess("Profile updated successfully!")
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to update profile")
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
                    <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Edit Profile</h1>
                        <p className="text-slate-600 dark:text-slate-400">Update your personal information and
                            preferences</p>
                    </div>

                    <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5"/>
                                Profile Information
                            </CardTitle>
                            <CardDescription>Manage your public profile and account details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-6">
                                {/* Profile Picture Section */}
                                <div className="flex items-center gap-6">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={profilePicture || "/placeholder.svg"} alt={username}/>
                                        <AvatarFallback
                                            className="text-lg">{username.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <Label htmlFor="profilePicture" className="text-slate-700 dark:text-slate-300">
                                            Profile Picture URL
                                        </Label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                id="profilePicture"
                                                type="url"
                                                placeholder="https://example.com/avatar.jpg"
                                                value={profilePicture}
                                                onChange={(e) => setProfilePicture(e.target.value)}
                                                className="border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                                            />
                                            <Button type="button" variant="outline" size="icon">
                                                <Upload className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Enter a URL to your profile picture
                                        </p>
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">
                                        Username
                                    </Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        This is your public display name. It can be your real name or a pseudonym.
                                    </p>
                                </div>

                                {/* Email (read-only) */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile?.email || ""}
                                        disabled
                                        className="border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Email cannot be changed from this page. Contact support if needed.
                                    </p>
                                </div>

                                {/* Bio */}
                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300">
                                        Bio
                                    </Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us a little about yourself..."
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        className="border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Brief description for your profile. Maximum 500 characters.
                                    </p>
                                </div>

                                {/* Account Info */}
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Account
                                        Information</h3>
                                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                        <p>
                                            <span className="font-medium">Member since:</span>{" "}
                                            {profile ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}
                                        </p>
                                        <p>
                                            <span className="font-medium">User ID:</span> {profile?.id || "Unknown"}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                {error && (
                                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                        <AlertDescription
                                            className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                                    </Alert>
                                )}

                                {success && (
                                    <Alert
                                        className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                                        <AlertDescription
                                            className="text-green-700 dark:text-green-400">{success}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button asChild type="button" variant="outline">
                                        <Link href="/dashboard">Cancel</Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
