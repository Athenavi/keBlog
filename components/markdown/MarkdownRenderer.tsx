"use client"

import React, {useMemo} from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

export interface HeadingItem {
    id: string
    text: string
    level: number
}

export interface MarkdownRendererProps {
    content: string
    className?: string
    onHeadingsExtracted?: (items: HeadingItem[]) => void
}

export default function MarkdownRenderer({content, className, onHeadingsExtracted}: MarkdownRendererProps) {
    const {components} = useHeadingExtraction(onHeadingsExtracted)

    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, {behavior: "wrap"}]]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}

function extractText(node: React.ReactNode): string {
    if (node == null) return ""
    if (typeof node === "string" || typeof node === "number") return String(node)
    if (Array.isArray(node)) return node.map(extractText).join("")
    if (React.isValidElement(node)) return extractText((node.props as { children?: React.ReactNode }).children)
    return ""
}

function useHeadingExtraction(onHeadingsExtracted?: (items: HeadingItem[]) => void) {
    const headingsRef = React.useRef<HeadingItem[]>([])

    const components = useMemo(() => {
        const create = (level: number) =>
            function H(props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) {
                const id = (props.id as string) || ""
                const text = extractText(props.children)
                React.useEffect(() => {
                    if (!id) return
                    headingsRef.current = [...headingsRef.current.filter((h) => h.id !== id), {id, text, level}]
                    onHeadingsExtracted?.(headingsRef.current)
                }, [id, text, level])
                return React.createElement(`h${level}`, props)
            }

        return {
            h1: create(1),
            h2: create(2),
            h3: create(3),
            h4: create(4),
            h5: create(5),
            h6: create(6),
        }
    }, [onHeadingsExtracted])

    return {components}
} 