"use client"

import dynamic from "next/dynamic"
import React, {useState} from "react"
import {Image} from "lucide-react"
import MediaLibrarySelector from "./MediaLibrarySelector"
import type {Command} from "@uiw/react-md-editor"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {ssr: false})

export interface MarkdownEditorProps {
    value: string
    onChange: (next: string) => void
    placeholder?: string
    className?: string
}

export default function MarkdownEditor({value, onChange, placeholder, className}: MarkdownEditorProps) {
    const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false)
    const [commands, setCommands] = useState<any>(null)

    // 初始化时获取编辑器命令
    React.useEffect(() => {
        const initCommands = async () => {
            const mdEditor = await import("@uiw/react-md-editor")
            setCommands(mdEditor.commands)
        }
        initCommands()
    }, [])

    // 自定义插入图片命令
    const insertImageCommand: Command = {
        name: 'insert-image',
        keyCommand: 'insertImage',
        shortcuts: '',
        buttonProps: {
            'aria-label': '从媒体库插入图片',
            title: '从媒体库插入图片',
        },
        icon: <Image className="w-4 h-4"/>,
        execute: () => {
            setIsMediaSelectorOpen(true)
        },
    }

    // 处理图片插入
    const handleInsertImages = (imageUrls: string[]) => {
        if (!imageUrls || imageUrls.length === 0) return

        // 为每张图片生成 Markdown 格式
        const markdownImages = imageUrls.map(url => `![image](${url})`).join('\n\n')

        // 在光标位置插入内容
        const textarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement
        if (textarea) {
            const startPos = textarea.selectionStart
            const endPos = textarea.selectionEnd
            const newValue = value.substring(0, startPos) + markdownImages + value.substring(endPos)
            onChange(newValue)

            // 将光标移动到插入内容的末尾
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = startPos + markdownImages.length
                textarea.focus()
            }, 0)
        } else {
            // 如果找不到 textarea，直接追加到末尾
            const newValue = value ? value + '\n\n' + markdownImages : markdownImages
            onChange(newValue)
        }
    }

    // 获取默认命令列表（包含所有原有工具）
    const getDefaultCommands = () => {
        if (!commands) return []
        return [
            insertImageCommand,
            commands.bold,
            commands.italic,
            commands.strikethrough,
            commands.divider,
            commands.title1,
            commands.title2,
            commands.title3,
            commands.title4,
            commands.title5,
            commands.title6,
            commands.divider,
            commands.link,
            commands.image,
            commands.code,
            commands.codeBlock,
            commands.unorderedListCommand,
            commands.orderedListCommand,
            commands.checkedListCommand,
            commands.divider,
            commands.quote,
            commands.table,
            commands.hr,
            commands.divider,
            commands.fullscreen,
        ]
    }

    return (
        <div data-color-mode="light" className={className}>
            {commands ? (
                <>
                    <MDEditor
                        value={value}
                        onChange={(v: string | undefined) => onChange(v ?? "")}
                        height={480}
                        visibleDragbar={false}
                        previewOptions={{}}
                        textareaProps={placeholder ? {placeholder} : undefined}
                        commands={getDefaultCommands()}
                    />
                    <MediaLibrarySelector
                        open={isMediaSelectorOpen}
                        onOpenChange={setIsMediaSelectorOpen}
                        onInsert={handleInsertImages}
                    />
                </>
            ) : (
                <div className="h-[480px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="text-slate-500">Loading editor...</div>
                </div>
            )}
        </div>
    )
}
