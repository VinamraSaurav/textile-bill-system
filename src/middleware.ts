import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionUser } from './lib/auth/session';

// Define path patterns for different auth requirements
const PUBLIC_PATHS = ['/login', '/'];
const PROTECTED_PATHS = ['/dashboard', '/api/dashboard', '/api/user'];
const ADMIN_PATHS = ['/admin', '/api/admin', '/api/register', '/register'];
const API_PATHS = ['/api'];
const SESSION_COOKIE = 'bill_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths without authentication
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check if session cookie exists
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  
  // If no session cookie, redirect to login for UI routes or return 401 for API routes
  if (!sessionId) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  const user = await getSessionUser();
  
  // For admin routes, check role from server
  if (ADMIN_PATHS.some(path => pathname.startsWith(path))) {
    // We can't check the full user object in middleware, so we'll let API routes handle role-based checks
    // For UI routes, we'll rely on the client-side ProtectedRoute component as a backup
    if (pathname.startsWith('/api') && user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }
  
  // User has a session, proceed to the route handler
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all routes except public assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};