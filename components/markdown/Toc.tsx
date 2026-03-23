"use client"

import React from "react"
import {cn} from "@/lib/utils"

export interface TocItem {
    id: string
    text: string
    level: number
}

export interface TocProps {
    items: TocItem[]
    className?: string
}

export default function Toc({items, className}: TocProps) {
    const [activeId, setActiveId] = React.useState<string | null>(null)

    React.useEffect(() => {
        const handler = () => {
            let current: string | null = null
            const headings = items.map((it) => document.getElementById(it.id)).filter(Boolean) as HTMLElement[]
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
            for (const el of headings) {
                if (el.offsetTop - 100 <= scrollTop) current = el.id
            }
            setActiveId(current)
        }
        handler()
        window.addEventListener("scroll", handler, {passive: true})
        return () => window.removeEventListener("scroll", handler)
    }, [items])

    if (!items.length) return null

    return (
        <nav className={cn("text-sm sticky top-24 max-h-[70vh] overflow-auto pr-2", className)}>
            <div className="font-medium mb-2 text-slate-700 dark:text-slate-200">目录</div>
            <ul className="space-y-1">
                {items.map((it) => (
                    <li key={it.id} className={cn("truncate", it.level > 2 && "pl-4", it.level > 3 && "pl-8")}>
                        <a
                            href={`#${it.id}`}
                            className={cn(
                                "block py-1 transition-colors hover:text-slate-900 dark:hover:text-white",
                                activeId === it.id ? "text-sky-600 dark:text-sky-400" : "text-slate-600 dark:text-slate-400"
                            )}
                            title={it.text}
                        >
                            {it.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
} 