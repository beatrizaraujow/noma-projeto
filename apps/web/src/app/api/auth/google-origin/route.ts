import { NextRequest, NextResponse } from 'next/server';
import {
  GOOGLE_SIGNUP_ORIGIN_COOKIE,
  hasSignupOrigin,
  normalizeSignupOrigin,
  serializeSignupOriginCookie,
} from '@/lib/signup-origin';

const COOKIE_TTL_SECONDS = 10 * 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const origin = normalizeSignupOrigin(body?.origin);

    const response = NextResponse.json({ success: true });

    if (!hasSignupOrigin(origin)) {
      response.cookies.set({
        name: GOOGLE_SIGNUP_ORIGIN_COOKIE,
        value: '',
        path: '/',
        maxAge: 0,
      });

      return response;
    }

    response.cookies.set({
      name: GOOGLE_SIGNUP_ORIGIN_COOKIE,
      value: serializeSignupOriginCookie(origin),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: COOKIE_TTL_SECONDS,
    });

    return response;
  } catch {
    return NextResponse.json({ success: true });
  }
}
