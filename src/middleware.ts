import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip processing for sign-out route to avoid interference
  if (pathname === '/api/auth/signout' || pathname === '/api/auth/callback/github') {
    return NextResponse.next();
  }

  // Handle session endpoint specially for better error handling
  if (pathname === '/api/auth/session') {
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

  // Handle API requests to check for token validation
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    try {
      // Use next-auth's built-in token verification
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
      });

      if (!token) {
        // Return 401 with JSON error message for API requests
        return NextResponse.json(
          { error: 'Unauthorized', message: 'You must be signed in to access this endpoint' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Error verifying token in middleware:', error);
      return NextResponse.json(
        { error: 'Authentication error', message: 'There was a problem with your session' },
        { status: 401 }
      );
    }
  }

  // Handle signin page - check if we have an existing session to avoid unnecessary signin
  if (pathname === '/auth/signin') {
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
  matcher: [
    '/api/:path*',
    '/auth/signin',
    '/dashboard',
    '/analyze/:path*',
    '/config'
  ],
};
