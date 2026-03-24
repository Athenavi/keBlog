import {NextRequest, NextResponse} from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const {createServerClient} = await import('@supabase/ssr')
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({name, value, options}) => supabaseResponse.cookies.set(name, value, options))
                },
            },
        },
    )

    // IMPORTANT: If you remove getUser() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const {data: {user}} = await supabase.auth.getUser()

    const {pathname} = request.nextUrl

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/admin', '/profile']
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    // Admin routes that require admin role
    const adminRoutes = ['/admin']
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/register-success', '/unauthorized']
    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/auth/')

    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from auth pages
    if (user && pathname.startsWith('/auth/') && pathname !== '/auth/logout') {
        const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard'
        const url = request.nextUrl.clone()
        url.pathname = redirectTo
        url.searchParams.delete('redirectTo')
        return NextResponse.redirect(url)
    }

    // For admin routes, we'll let the page-level protection handle role checking
    // since we can't easily check roles in middleware without additional API calls

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
