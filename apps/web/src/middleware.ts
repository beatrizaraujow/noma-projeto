import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const error = (req.nextauth.token as any)?.error as string | undefined;

    if (error === 'GoogleTokenExchangeError' || error === 'RefreshTokenError') {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set(
        'error',
        error === 'GoogleTokenExchangeError' ? 'google_failed' : 'session_expired',
      );
      loginUrl.searchParams.delete('callbackUrl');
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/workspaces/:path*',
    '/settings/:path*',
    '/projects/:path*',
    '/onboarding/:path*',
    '/analytics/:path*',
    '/invite/:path*',
  ],
};
