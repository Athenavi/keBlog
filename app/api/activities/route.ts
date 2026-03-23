import {NextRequest, NextResponse} from 'next/server'
import {createClient} from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const {data: {user}, error: authError} = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401})
        }

        // Get query parameters
        const {searchParams} = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '50', 10)
        const offset = parseInt(searchParams.get('offset') || '0', 10)
        const activityType = searchParams.get('type') || null
        const entityType = searchParams.get('entity_type') || null
        const userId = searchParams.get('user_id') || null

        if (Number.isNaN(limit) || Number.isNaN(offset)) {
            return NextResponse.json({error: 'Invalid query parameters'}, {status: 400})
        }

        // Call the database function to get activities
        const {data: activities, error} = await supabase.rpc('get_user_activities', {
            p_limit: limit,
            p_offset: offset,
            p_user_id: userId ? userId : null,
            p_activity_type: activityType,
            p_entity_type: entityType
        })

        if (error) {
            console.error('Error fetching activities:', error)
            return NextResponse.json({error: 'Failed to fetch activities'}, {status: 500})
        }

        // Get total count for pagination
        let totalCount = 0
        if (offset === 0) {
            const {count} = await supabase
                .from('activity_logs')
                .select('id', {count: 'exact', head: true})
                .eq('user_id', user.id)

            totalCount = count || 0
        }

        return NextResponse.json({
            activities: activities || [],
            pagination: {
                limit,
                offset,
                total: totalCount,
                hasMore: activities && activities.length === limit
            }
        })

    } catch (error) {
        console.error('Error in activities API:', error)
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const {data: {user}, error: authError} = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401})
        }

        const body = await request.json()
        const {
            activity_code,
            entity_type,
            entity_id,
            title,
            description,
            metadata,
            ip_address,
            user_agent
        } = body

        // Validate required fields
        if (!activity_code || !entity_type || !title) {
            return NextResponse.json({
                error: 'Missing required fields: activity_code, entity_type, title'
            }, {status: 400})
        }

        // Get client IP and user agent if not provided
        const clientIP = ip_address || request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') || 'unknown'
        const clientUserAgent = user_agent || request.headers.get('user-agent') || 'unknown'

        // Call the database function to log activity
        const {data: logId, error} = await supabase.rpc('log_activity', {
            p_user_id: user.id,
            p_activity_code: activity_code,
            p_entity_type: entity_type,
            p_entity_id: entity_id || null,
            p_title: title,
            p_description: description || null,
            p_metadata: metadata || null,
            p_ip_address: clientIP,
            p_user_agent: clientUserAgent
        })

        if (error) {
            console.error('Error logging activity:', error)
            return NextResponse.json({error: 'Failed to log activity'}, {status: 500})
        }

        return NextResponse.json({
            success: true,
            log_id: logId,
            message: 'Activity logged successfully'
        })

    } catch (error) {
        console.error('Error in activity logging API:', error)
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}
