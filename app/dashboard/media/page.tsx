"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {ArrowLeft, Download, Eye, File, FileText, ImageIcon, Plus, Search, Trash2, Video} from "lucide-react"
import Link from "next/link"

interface MediaFile {
    id: string
    filename: string
    original_filename: string
    file_path: string
    file_size: number
    mime_type: string
    alt_text: string | null
    created_at: string
    updated_at: string
    user: {
        username: string
    }
}

export default function MediaPage() {
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<string>("all")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        fetchMedia()
    }, [])

    const fetchMedia = async () => {
        try {
            const response = await fetch("/api/media")
            if (!response.ok) {
                if (response.status === 401) {
                    router.push("/auth/login")
                    return
                }
                throw new Error("Failed to fetch media files")
            }

            const data = await response.json()
            setMediaFiles(data.media)
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to load media files")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (mediaId: string) => {
        if (!confirm("Are you sure you want to delete this file?")) return

        try {
            const response = await fetch(`/api/media/${mediaId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete media file")
            }

            setMediaFiles(mediaFiles.filter((file) => file.id !== mediaId))
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to delete media file")
        }
    }

    const getFileIcon = (mimeType: string | undefined) => {
        const mt = mimeType ?? ""
        if (mt.startsWith("image/")) return <ImageIcon className="w-5 h-5"/>
        if (mt.startsWith("video/")) return <Video className="w-5 h-5"/>
        return <File className="w-5 h-5"/>
    }

    const getFileTypeColor = (mimeType: string | undefined) => {
        const mt = mimeType ?? ""
        if (mt.startsWith("image/")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
        if (mt.startsWith("video/")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const filteredMedia = mediaFiles.filter((file) => {
        const matchesSearch =
            file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())

        const mt = file.mime_type ?? ""
        const matchesType =
            filterType === "all" ||
            (filterType === "images" && mt.startsWith("image/")) ||
            (filterType === "videos" && mt.startsWith("video/")) ||
            (filterType === "documents" && !mt.startsWith("image/") && !mt.startsWith("video/"))

        return matchesSearch && matchesType
    })

    if (isLoading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading media files...</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button asChild variant="ghost" className="mb-4">
                            <Link href="/dashboard">
                                <ArrowLeft className="w-4 h-4 mr-2"/>
                                Back to Dashboard
                            </Link>
                        </Button>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Media
                                    Library</h1>
                                <p className="text-slate-600 dark:text-slate-400">Upload and manage your files</p>
                            </div>
                            <Button asChild className="bg-orange-600 hover:bg-orange-700">
                                <Link href="/dashboard/media/upload">
                                    <Plus className="w-4 h-4 mr-2"/>
                                    Upload Files
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <Card className="border-slate-200 dark:border-slate-700 mb-6">
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"/>
                                    <Input
                                        placeholder="Search files..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 border-slate-300 dark:border-slate-600"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={filterType === "all" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFilterType("all")}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant={filterType === "images" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFilterType("images")}
                                    >
                                        Images
                                    </Button>
                                    <Button
                                        variant={filterType === "videos" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFilterType("videos")}
                                    >
                                        Videos
                                    </Button>
                                    <Button
                                        variant={filterType === "documents" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFilterType("documents")}
                                    >
                                        Documents
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Message */}
                    {error && (
                        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 mb-6">
                            <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Media Grid */}
                    {filteredMedia.length === 0 ? (
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardContent className="text-center py-12">
                                <div className="text-slate-400 mb-4">
                                    <FileText className="w-12 h-12 mx-auto mb-4"/>
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                                    {searchTerm ? "No files found" : "No media files yet"}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    {searchTerm
                                        ? "Try adjusting your search terms or filters"
                                        : "Start by uploading your first media file"}
                                </p>
                                {!searchTerm && (
                                    <Button asChild className="bg-orange-600 hover:bg-orange-700">
                                        <Link href="/dashboard/media/upload">
                                            <Plus className="w-4 h-4 mr-2"/>
                                            Upload Your First File
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMedia.map((file) => (
                                <Card
                                    key={file.id}
                                    className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                {getFileIcon(file.mime_type)}
                                                <Badge
                                                    className={getFileTypeColor(file.mime_type)}>{(file.mime_type?.split("/")[0]) ?? "file"}</Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* File Preview */}
                                        <div className="mb-4">
                                            {file.mime_type?.startsWith("image/") ? (
                                                <div
                                                    className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                                                    <img
                                                        src={file.file_path || "/placeholder.svg"}
                                                        alt={file.alt_text || file.original_filename}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                                    {getFileIcon(file.mime_type)}
                                                </div>
                                            )}
                                        </div>

                                        {/* File Info */}
                                        <div className="space-y-2">
                                            <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                                {file.original_filename}
                                            </h3>
                                            <div
                                                className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                                                <span>{formatFileSize(file.file_size)}</span>
                                                <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                            </div>
                                            {file.alt_text && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{file.alt_text}</p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-4">
                                            <Button asChild size="sm" variant="outline"
                                                    className="flex-1 bg-transparent">
                                                <a href={file.file_path} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="w-4 h-4 mr-1"/>
                                                    View
                                                </a>
                                            </Button>
                                            <Button asChild size="sm" variant="outline">
                                                <a href={file.file_path} download={file.original_filename}>
                                                    <Download className="w-4 h-4"/>
                                                </a>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(file.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
