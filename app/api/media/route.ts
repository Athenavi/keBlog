import {type NextRequest, NextResponse} from "next/server"
import {createClient} from "@/lib/supabase/server"
import {getCurrentUser} from "@/lib/auth"
import {logMediaUploaded} from "@/lib/activity-logger"
import fs from "fs"
import path from "path"

export async function GET() {
    try {
        const supabase = await createClient()
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const {data: mediaFiles, error: mediaError} = await supabase
            .from("media")
            .select(`
        id,
        original_filename,
        hash,
        created_at,
        updated_at,
        user_id,
        file_hashes!inner(
          filename,
          file_size,
          mime_type,
          storage_path
        )
      `)
            .order("created_at", {ascending: false})

        if (mediaError) {
            console.error("Database error:", mediaError)
            return NextResponse.json({error: "Failed to fetch media files"}, {status: 500})
        }

        // Get user information for each media file
        const mediaWithUsers = await Promise.all(
            mediaFiles.map(async (media) => {
                const {data: userData} = await supabase.from("users").select("username").eq("id", media.user_id).single()

                return {
                    ...media,
                    user: userData || {username: "Unknown"},
                }
            }),
        )

        // Map to local URL for preview & download
        const mapped = mediaWithUsers.map((m: any) => {
            const fh = Array.isArray(m.file_hashes) ? m.file_hashes[0] : m.file_hashes
            const storagePath: string | undefined = fh?.storage_path
            const fileUrl = storagePath ? `/${storagePath.replace(/\\/g, "/")}` : null

            return {
                id: m.id,
                original_filename: m.original_filename,
                created_at: m.created_at,
                updated_at: m.updated_at,
                user: m.user,
                file_size: fh?.file_size ?? null,
                mime_type: fh?.mime_type ?? null,
                filename: fh?.filename ?? null,
                file_path: fileUrl,
                alt_text: null,
            }
        })

        return NextResponse.json({media: mapped})
    } catch (error) {
        console.error("Media fetch error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const formData = await request.formData()
        const file = formData.get("file") as File
        const altText = (formData.get("altText") as string) || null

        if (!file) {
            return NextResponse.json({error: "No file provided"}, {status: 400})
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            return NextResponse.json({error: "File size too large. Maximum 10MB allowed."}, {status: 400})
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = file.name.includes(".") ? file.name.split(".").pop() : undefined
        const filename = fileExtension ? `${timestamp}_${randomString}.${fileExtension}` : `${timestamp}_${randomString}`

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Write to local filesystem under public/Storage/media/{userId}
        const baseDir = path.join(process.cwd(), "public", "Storage", "media", user.id)
        await fs.promises.mkdir(baseDir, {recursive: true})
        const absFilePath = path.join(baseDir, filename)
        await fs.promises.writeFile(absFilePath, buffer)

        // Relative path used for URL and DB (POSIX style for URLs)
        const storagePath = path.posix.join("Storage", "media", user.id, filename)

        // Calculate file hash for deduplication
        const crypto = require("crypto")
        const hash = crypto.createHash("md5").update(buffer).digest("hex")

        const {data: existingHash} = await supabase.from("file_hashes").select("*").eq("hash", hash).single()

        let fileHashData
        if (existingHash) {
            // Increment reference count
            const {data: updatedHash, error: updateError} = await supabase
                .from("file_hashes")
                .update({reference_count: existingHash.reference_count + 1, storage_path: storagePath})
                .eq("hash", hash)
                .select()
                .single()

            if (updateError) {
                console.error("Failed to update reference count:", updateError)
                return NextResponse.json({error: "Failed to process file"}, {status: 500})
            }
            fileHashData = updatedHash
        } else {
            const {data: newHash, error: hashError} = await supabase
                .from("file_hashes")
                .insert({
                    hash,
                    filename,
                    file_size: file.size,
                    mime_type: file.type,
                    storage_path: storagePath,
                    reference_count: 1,
                })
                .select()
                .single()

            if (hashError) {
                console.error("Database error:", hashError)
                return NextResponse.json({error: "Failed to save file hash"}, {status: 500})
            }
            fileHashData = newHash
        }

        const {data: mediaData, error: mediaError} = await supabase
            .from("media")
            .insert({
                original_filename: file.name,
                hash: hash,
                user_id: user.id,
            })
            .select()
            .single()

        if (mediaError) {
            console.error("Database error:", mediaError)
            return NextResponse.json({error: "Failed to save media file"}, {status: 500})
        }

        // Log activity
        try {
            await logMediaUploaded(mediaData.id.toString(), file.name, file.size, user.id, request)
        } catch (logError) {
            console.error("Failed to log activity:", logError)
            // Don't fail the request if logging fails
        }

        // Build local preview URL
        const fileUrl = `/${storagePath}`

        return NextResponse.json({
            message: "File uploaded successfully",
            media: {
                ...mediaData,
                file_info: fileHashData,
                file_path: fileUrl,
                alt_text: altText,
            },
        })
    } catch (error) {
        console.error("Media upload error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}
