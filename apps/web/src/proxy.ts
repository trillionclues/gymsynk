import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken    = request.cookies.get('refresh_token')?.value;
  const isAuthenticated = Boolean(refreshToken);

  // Root → best surface for the user
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(isAuthenticated ? '/dashboard' : '/login', request.url),
    );
  }

  // Staff login — redirect already-authenticated staff away
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Member login — redirect already-authenticated members away
  if (pathname === '/member/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/member', request.url));
  }

  // Dashboard routes — staff only, must be authenticated
  if (pathname.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Member routes (except /member/login) — must be authenticated
  if (
    pathname.startsWith('/member') &&
    pathname !== '/member/login' &&
    !isAuthenticated
  ) {
    return NextResponse.redirect(new URL('/member/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/member/login',
    '/dashboard/:path*',
    '/member/:path*',
  ],
};
