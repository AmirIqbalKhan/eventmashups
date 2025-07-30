import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Define route access patterns
const publicRoutes = ['/', '/events', '/auth/login', '/auth/signup'];
const adminRoutes = ['/admin', '/api/admin'];
const organizerRoutes = ['/events/create', '/organizer'];
const userRoutes = ['/dashboard', '/profile', '/tickets'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    // Redirect to login for protected routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Verify token and get user info
  const payload = verifyToken(token);
  if (!payload) {
    // Invalid token, redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-based access control
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!payload.isAdmin) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (organizerRoutes.some(route => pathname.startsWith(route))) {
    if (!payload.isOrganizer && !payload.isAdmin) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Organizer access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // For user routes, any authenticated user can access
  if (userRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For API routes that don't match specific patterns, allow if authenticated
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  return NextResponse.next();
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
  runtime: 'nodejs',
}; 