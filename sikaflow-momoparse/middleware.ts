import { type NextRequest, NextResponse } from 'next/server'
import { isSupabaseAuthConfigured } from '@/lib/supabase/auth-env'
import { updateSession } from '@/lib/supabase/proxy'

export async function middleware(request: NextRequest) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.next()
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
