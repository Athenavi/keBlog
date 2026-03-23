import type React from "react"
import {UserMenu} from "@/components/user-menu"
import Link from "next/link"

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            {/* Navigation Header */}
            <header
                className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link href="/dashboard" className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                CMS Platform
                            </Link>
                            <nav className="hidden md:flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/dashboard/articles"
                                    className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                >
                                    Articles
                                </Link>
                                <Link
                                    href="/dashboard/media"
                                    className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                >
                                    Media
                                </Link>
                                <Link
                                    href="/dashboard/activity"
                                    className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                >
                                    Activity
                                </Link>
                                <Link
                                    href="/dashboard/profile"
                                    className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                >
                                    Profile
                                </Link>
                            </nav>
                        </div>
                        <UserMenu/>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>{children}</main>
        </div>
    )
}
