// Middleware to handle NextAuth session errors and redirects
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle session endpoint specially
  if (request.nextUrl.pathname === '/api/auth/session') {
    // Check if the request's origin is the same as the host
    const requestOrigin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // If origin doesn't match host, or if it's a fallback request when
    // a previous one failed, add CORS headers and return 200 with empty session
    if (!requestOrigin || !host || !requestOrigin.includes(host)) {
      // Create empty session response
      const response = NextResponse.json({ 
        user: null,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Origin', requestOrigin || '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      
      return response;
    }
  }
  
  // Handle signin page - check if we have an existing session to avoid unnecessary signin
  if (request.nextUrl.pathname === '/auth/signin') {
    // Check for session cookie
    const hasSessionToken = request.cookies.has('next-auth.session-token');
    
    if (hasSessionToken) {
      // If we have a session token, redirect to dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }
  
  // Let the request continue its normal flow for other routes
  return NextResponse.next();
}

// Specify which paths this middleware will run on
export const config = {
  matcher: ['/api/auth/session', '/auth/signin'],
};