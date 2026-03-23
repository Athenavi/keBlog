"use client"

import type React from "react"
import {useState} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {ArrowLeft, File, ImageIcon, Upload, Video, X} from "lucide-react"
import Link from "next/link"

interface UploadFile {
    file: File
    preview?: string
    altText: string
}

export default function MediaUploadPage() {
    const [files, setFiles] = useState<UploadFile[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || [])

        const newFiles: UploadFile[] = selectedFiles.map((file) => {
            const uploadFile: UploadFile = {
                file,
                altText: "",
            }

            // Create preview for images
            if (file.type.startsWith("image/")) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    uploadFile.preview = e.target?.result as string
                    setFiles((prev) => [...prev])
                }
                reader.readAsDataURL(file)
            }

            return uploadFile
        })

        setFiles((prev) => [...prev, ...newFiles])
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const updateAltText = (index: number, altText: string) => {
        setFiles((prev) => prev.map((file, i) => (i === index ? {...file, altText} : file)))
    }

    const handleUpload = async () => {
        if (files.length === 0) {
            setError("Please select at least one file to upload")
            return
        }

        setIsUploading(true)
        setError(null)
        setSuccess(null)

        try {
            const uploadPromises = files.map(async (uploadFile) => {
                const formData = new FormData()
                formData.append("file", uploadFile.file)
                formData.append("altText", uploadFile.altText)

                const response = await fetch("/api/media", {
                    method: "POST",
                    body: formData,
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Failed to upload file")
                }

                return response.json()
            })

            await Promise.all(uploadPromises)

            setSuccess(`Successfully uploaded ${files.length} file(s)`)
            setFiles([])

            // Redirect to media library after a short delay
            setTimeout(() => {
                router.push("/dashboard/media")
            }, 2000)
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to upload files")
        } finally {
            setIsUploading(false)
        }
    }

    const getFileIcon = (type: string) => {
        if (type.startsWith("image/")) return <ImageIcon className="w-8 h-8"/>
        if (type.startsWith("video/")) return <Video className="w-8 h-8"/>
        return <File className="w-8 h-8"/>
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button asChild variant="ghost" className="mb-4">
                            <Link href="/dashboard/media">
                                <ArrowLeft className="w-4 h-4 mr-2"/>
                                Back to Media Library
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Upload Media</h1>
                            <p className="text-slate-600 dark:text-slate-400">Add new files to your media library</p>
                        </div>
                    </div>

                    {/* Upload Form */}
                    <Card className="border-slate-200 dark:border-slate-700 mb-6">
                        <CardHeader>
                            <CardTitle>Select Files</CardTitle>
                            <CardDescription>Choose images, videos, or documents to upload</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* File Input */}
                                <div>
                                    <Label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                                        Choose Files
                                    </Label>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                                        onChange={handleFileSelect}
                                        className="border-slate-300 dark:border-slate-600"
                                    />
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        Supported formats: Images, Videos, PDF, Word documents, Text files
                                    </p>
                                </div>

                                {/* File List */}
                                {files.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                            Selected Files ({files.length})
                                        </h3>
                                        <div className="space-y-4">
                                            {files.map((uploadFile, index) => (
                                                <Card key={index} className="border-slate-200 dark:border-slate-700">
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-start gap-4">
                                                            {/* File Preview/Icon */}
                                                            <div className="flex-shrink-0">
                                                                {uploadFile.preview ? (
                                                                    <img
                                                                        src={uploadFile.preview || "/placeholder.svg"}
                                                                        alt="Preview"
                                                                        className="w-16 h-16 object-cover rounded-lg"
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                                                        {getFileIcon(uploadFile.file.type)}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* File Info */}
                                                            <div className="flex-1 space-y-3">
                                                                <div>
                                                                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                                                        {uploadFile.file.name}
                                                                    </h4>
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                        {formatFileSize(uploadFile.file.size)} • {uploadFile.file.type}
                                                                    </p>
                                                                </div>

                                                                {/* Alt Text Input */}
                                                                <div>
                                                                    <Label htmlFor={`alt-text-${index}`}
                                                                           className="text-sm">
                                                                        Alt Text (optional)
                                                                    </Label>
                                                                    <Textarea
                                                                        id={`alt-text-${index}`}
                                                                        placeholder="Describe this file for accessibility..."
                                                                        value={uploadFile.altText}
                                                                        onChange={(e) => updateAltText(index, e.target.value)}
                                                                        className="mt-1 border-slate-300 dark:border-slate-600"
                                                                        rows={2}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Remove Button */}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeFile(index)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                            >
                                                                <X className="w-4 h-4"/>
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Messages */}
                                {error && (
                                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                        <AlertDescription
                                            className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                                    </Alert>
                                )}

                                {success && (
                                    <Alert
                                        className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                                        <AlertDescription
                                            className="text-green-700 dark:text-green-400">{success}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Upload Button */}
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleUpload}
                                        disabled={files.length === 0 || isUploading}
                                        className="bg-orange-600 hover:bg-orange-700"
                                    >
                                        {isUploading ? (
                                            <>
                                                <div
                                                    className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2"/>
                                                Upload {files.length} File{files.length !== 1 ? "s" : ""}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
