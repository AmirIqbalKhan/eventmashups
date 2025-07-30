import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // For now, just check if token exists (auth verification will be done in API routes)
  // This avoids Edge Runtime issues with bcryptjs and jsonwebtoken

  // Role-based access control will be handled in individual API routes
  // where we can use Node.js runtime

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
}; 