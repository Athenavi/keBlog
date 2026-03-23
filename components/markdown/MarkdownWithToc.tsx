"use client"

import React from "react"
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer"
import Toc from "@/components/markdown/Toc"

export default function MarkdownWithToc({content}: { content: string }) {
    const [headings, setHeadings] = React.useState<{ id: string; text: string; level: number }[]>([])
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9">
                <MarkdownRenderer content={content} onHeadingsExtracted={setHeadings}/>
            </div>
            <div className="lg:col-span-3">
                <Toc items={headings}/>
            </div>
        </div>
    )
} 