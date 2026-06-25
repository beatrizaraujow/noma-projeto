import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';
import { cookies } from 'next/headers';
import {
  GOOGLE_SIGNUP_ORIGIN_COOKIE,
  parseSignupOriginCookie,
} from './signup-origin';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || '';
const HAS_GOOGLE_OAUTH = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

function consumeGoogleSignupOrigin() {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get(GOOGLE_SIGNUP_ORIGIN_COOKIE)?.value;

    cookieStore.set({
      name: GOOGLE_SIGNUP_ORIGIN_COOKIE,
      value: '',
      path: '/',
      maxAge: 0,
    });

    return parseSignupOriginCookie(raw);
  } catch {
    return undefined;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    ...(HAS_GOOGLE_OAUTH
      ? [
          GoogleProvider({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                scope: 'openid email profile',
                prompt: 'select_account',
              },
            },
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const response = await axios.post(`${API_URL}/api/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          if (response.data && response.data.access_token) {
            return {
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.name,
              avatar: response.data.user.avatar,
              accessToken: response.data.access_token,
              workspace: response.data.workspace,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Google OAuth sign-in
      if (HAS_GOOGLE_OAUTH && account?.provider === 'google') {
        try {
          const origin = consumeGoogleSignupOrigin();
          const response = await axios.post(`${API_URL}/api/auth/google`, {
            id_token: (account as any).id_token,
            access_token: account.access_token,
            origin,
          });

          token.id = response.data.user.id;
          token.email = response.data.user.email;
          token.name = response.data.user.name;
          token.avatar = response.data.user.avatar;
          token.accessToken = response.data.access_token;
          token.workspace = response.data.workspace;
          (token as any).expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
          (token as any).error = undefined;
          return token;
        } catch {
          return { ...token, error: 'GoogleTokenExchangeError' } as any;
        }
      }

      // Credentials sign-in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.avatar = (user as any).avatar;
        token.accessToken = (user as any).accessToken;
        token.workspace = (user as any).workspace;
        (token as any).expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        return token;
      }

      // Subsequent requests: skip refresh if token still has > 1 day
      const expiresAt = (token as any).expiresAt as number | undefined;
      if (!expiresAt || Date.now() < expiresAt - 24 * 60 * 60 * 1000) {
        return token;
      }

      // Refresh the access token
      try {
        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${token.accessToken}` } },
        );
        return {
          ...token,
          accessToken: response.data.access_token,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          error: undefined,
        } as any;
      } catch {
        return { ...token, error: 'RefreshTokenError' } as any;
      }
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          avatar: token.avatar as string,
        };
        (session as any).accessToken = token.accessToken;
        (session as any).workspace = token.workspace;
        (session as any).error = (token as any).error;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
