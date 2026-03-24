"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {Check, ImageIcon, Search, X} from "lucide-react"

interface MediaFile {
    id: string
    filename: string
    original_filename: string
    file_path: string
    file_size: number
    mime_type: string
    alt_text: string | null
    created_at: string
}

interface MediaLibrarySelectorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onInsert: (imageUrls: string[]) => void
}

export default function MediaLibrarySelector({
                                                 open,
                                                 onOpenChange,
                                                 onInsert
                                             }: MediaLibrarySelectorProps) {
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
    const [selectedImages, setSelectedImages] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            fetchMedia()
            setSelectedImages([])
        }
    }, [open])

    const fetchMedia = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch("/api/media")
            if (!response.ok) {
                throw new Error("Failed to fetch media files")
            }

            const data = await response.json()
            // 只保留图片类型的文件
            const images = data.media.filter((file: any) =>
                file.mime_type?.startsWith("image/")
            )
            setMediaFiles(images)
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to load media files")
        } finally {
            setIsLoading(false)
        }
    }

    const toggleImageSelection = (imageId: string, imagePath: string) => {
        setSelectedImages(prev => {
            if (prev.includes(imageId)) {
                return prev.filter(id => id !== imageId)
            } else {
                return [...prev, imageId]
            }
        })
    }

    const handleInsert = () => {
        // 按照选择顺序获取图片路径
        const selectedPaths = selectedImages.map(id => {
            const media = mediaFiles.find(m => m.id === id)
            return media?.file_path || ""
        }).filter(path => path !== "")

        onInsert(selectedPaths)
        onOpenChange(false)
        setSelectedImages([])
    }

    const filteredMedia = mediaFiles.filter((file) => {
        return file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
    })

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>从媒体库选择图片</DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"/>
                    <Input
                        placeholder="搜索图片..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Selected count */}
                {selectedImages.length > 0 && (
                    <div
                        className="mb-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                            已选择 {selectedImages.length} 张图片
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedImages([])}
                            className="h-6 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        >
                            <X className="w-3 h-3 mr-1"/>
                            清空
                        </Button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 mb-4">
                        <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                    </Alert>
                )}

                {/* Media Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredMedia.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                        <p>{searchTerm ? "未找到匹配的图片" : "暂无图片"}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto flex-1 max-h-[60vh] pr-2">
                        {filteredMedia.map((file) => (
                            <Card
                                key={file.id}
                                className={`cursor-pointer transition-all hover:shadow-lg ${
                                    selectedImages.includes(file.id)
                                        ? "ring-2 ring-blue-500 border-blue-500"
                                        : "border-slate-200 dark:border-slate-700"
                                }`}
                                onClick={() => toggleImageSelection(file.id, file.file_path)}
                            >
                                <CardContent className="p-3">
                                    {/* Image Preview */}
                                    <div
                                        className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden mb-2 relative">
                                        {file.file_path ? (
                                            <img
                                                src={file.file_path}
                                                alt={file.alt_text || file.original_filename}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center text-slate-400">
                                                <ImageIcon className="w-8 h-8"/>
                                            </div>
                                        )}
                                        {selectedImages.includes(file.id) && (
                                            <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                                <Check className="w-4 h-4 text-white"/>
                                            </div>
                                        )}
                                    </div>

                                    {/* File Info */}
                                    <div className="space-y-1">
                                        <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                                            {file.original_filename}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {formatFileSize(file.file_size)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Footer Actions */}
                <DialogFooter className="mt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        取消
                    </Button>
                    <Button
                        onClick={handleInsert}
                        disabled={selectedImages.length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        插入 {selectedImages.length > 0 && `(${selectedImages.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
