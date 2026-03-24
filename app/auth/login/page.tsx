"use client"

import type React from "react"
import {useState} from "react"

import {createClient} from "@/lib/supabase/client"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Alert, AlertDescription} from "@/components/ui/alert"
import Link from "next/link"
import {useRouter} from "next/navigation"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        try {
            console.log("Attempting login with email:", email)
            const {data, error} = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error("Login error:", error)
                throw error
            }

            console.log("Login successful, user:", data.user)
            // Force hard refresh to reload auth state
            window.location.href = "/dashboard"
        } catch (error: unknown) {
            console.error("Login exception:", error)
            setError(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
            <div className="w-full max-w-md">
                <Card className="border-slate-200 dark:border-slate-700 shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome
                            Back</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                            Sign in to your account to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                                />
                            </div>

                            {error && (
                                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                    <AlertDescription
                                        className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Don't have an account?{" "}
                                <Link
                                    href="/auth/register"
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
