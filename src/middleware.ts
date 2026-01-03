import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Routes that should never be cached
  const dynamicRoutes = ['/dashboard', '/payments', '/donors', '/expenses'];

  const pathname = request.nextUrl.pathname;

  // Set no-cache headers for dynamic routes
  if (dynamicRoutes.some((route) => pathname.startsWith(route))) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/payments/:path*',
    '/donors/:path*',
    '/expenses/:path*',
  ],
};
