import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {ArrowLeft, Shield} from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
            <div className="w-full max-w-md">
                <Card className="border-slate-200 dark:border-slate-700 shadow-xl">
                    <CardHeader className="text-center">
                        <div
                            className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <Shield className="w-8 h-8 text-red-600 dark:text-red-400"/>
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Access
                            Denied</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                            You don't have permission to access this resource
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                This page requires specific permissions or roles that your account doesn't currently
                                have.
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                If you believe this is an error, please contact your administrator.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                                <Link href="/dashboard">
                                    <ArrowLeft className="w-4 h-4 mr-2"/>
                                    Back to Dashboard
                                </Link>
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
