import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import Link from "next/link"
import {CheckCircle} from "lucide-react"

export default function RegisterSuccessPage() {
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
            <div className="w-full max-w-md">
                <Card className="border-slate-200 dark:border-slate-700 shadow-xl">
                    <CardHeader className="text-center">
                        <div
                            className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400"/>
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Check Your
                            Email</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                            We've sent you a confirmation link to complete your registration
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Please check your email and click the confirmation link to activate your account.
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Don't see the email? Check your spam folder or try registering again.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                                <Link href="/auth/login">Back to Sign In</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full bg-transparent">
                                <Link href="/">Return Home</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
