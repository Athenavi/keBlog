"use client"

import dynamic from "next/dynamic"
import React from "react"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {ssr: false})

export interface MarkdownEditorProps {
    value: string
    onChange: (next: string) => void
    placeholder?: string
    className?: string
}

export default function MarkdownEditor({value, onChange, placeholder, className}: MarkdownEditorProps) {
    return (
        <div data-color-mode="light" className={className}>
            <MDEditor
                value={value}
                onChange={(v: string | undefined) => onChange(v ?? "")}
                height={480}
                visibleDragbar={false}
                previewOptions={{}}
                textareaProps={placeholder ? {placeholder} : undefined}
            />
        </div>
    )
} 