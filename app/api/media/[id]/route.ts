import {type NextRequest, NextResponse} from "next/server"
import {createClient} from "@/lib/supabase/server"
import {getCurrentUser} from "@/lib/auth"
import fs from "fs"
import path from "path"

export async function DELETE(request: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params
        const supabase = await createClient()
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        // Fetch media with hash and owner
        const {data: mediaFile, error: fetchError} = await supabase
            .from("media")
            .select("id, user_id, hash, original_filename")
            .eq("id", id)
            .single()

        if (fetchError || !mediaFile) {
            return NextResponse.json({error: "Media file not found"}, {status: 404})
        }

        if (mediaFile.user_id !== user.id) {
            return NextResponse.json({error: "Forbidden"}, {status: 403})
        }

        // Get file hash record to adjust reference count and possibly delete physical file
        const {data: fileHash, error: hashFetchError} = await supabase
            .from("file_hashes")
            .select("id, hash, reference_count, storage_path")
            .eq("hash", mediaFile.hash)
            .single()

        if (hashFetchError || !fileHash) {
            // Even if hash missing, proceed to delete media record
            const {error: mediaDeleteError} = await supabase.from("media").delete().eq("id", id)
            if (mediaDeleteError) {
                console.error("Database error while deleting media:", mediaDeleteError)
                return NextResponse.json({error: "Failed to delete media file"}, {status: 500})
            }
            return NextResponse.json({message: "Media file deleted successfully"})
        }

        const newRefCount = Math.max(0, (fileHash.reference_count as number) - 1)

        if (newRefCount === 0) {
            // Delete physical file from local storage
            const relPath = typeof fileHash.storage_path === "string" ? fileHash.storage_path : ""
            if (relPath) {
                const absPath = path.join(process.cwd(), "public", relPath.replace(/\\/g, "/"))
                try {
                    await fs.promises.unlink(absPath)
                } catch (e) {
                    // ignore if file already removed
                }
            }
            // Remove file_hashes row
            const {error: deleteHashError} = await supabase.from("file_hashes").delete().eq("hash", fileHash.hash)
            if (deleteHashError) {
                console.error("Database error while deleting file hash:", deleteHashError)
                return NextResponse.json({error: "Failed to delete file metadata"}, {status: 500})
            }
        } else {
            // Decrement reference count
            const {error: updateRefError} = await supabase
                .from("file_hashes")
                .update({reference_count: newRefCount})
                .eq("hash", fileHash.hash)
            if (updateRefError) {
                console.error("Database error while updating reference count:", updateRefError)
                return NextResponse.json({error: "Failed to update file metadata"}, {status: 500})
            }
        }

        // Delete media record
        const {error: deleteError} = await supabase.from("media").delete().eq("id", id)

        if (deleteError) {
            console.error("Database error:", deleteError)
            return NextResponse.json({error: "Failed to delete media file"}, {status: 500})
        }

        // Note: Activity logging is handled by database trigger (media_before_delete)

        return NextResponse.json({message: "Media file deleted successfully"})
    } catch (error) {
        console.error("Media delete error:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}
