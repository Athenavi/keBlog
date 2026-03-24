import {createClient as createSupabaseClient} from "@supabase/supabase-js"
import {Database} from "./database.types"

export function createClient() {
    // Use service role key to bypass RLS
    return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}
