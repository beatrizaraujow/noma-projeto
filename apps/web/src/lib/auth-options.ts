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

async function refreshAccessToken(token: any) {
  try {
    const response = await axios.post(`${API_URL}/api/auth/refresh`, {
      refresh_token: token.refreshToken,
    });

    return {
      ...token,
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      accessTokenExpires: Date.now() + response.data.access_token_expires_in * 1000,
      refreshTokenExpires: Date.now() + response.data.refresh_token_expires_in * 1000,
      error: undefined,
    };
  } catch {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
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
              refreshToken: response.data.refresh_token,
              accessTokenExpiresIn: response.data.access_token_expires_in,
              refreshTokenExpiresIn: response.data.refresh_token_expires_in,
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
      if (HAS_GOOGLE_OAUTH && account?.provider === 'google' && account.id_token) {
        try {
          const origin = consumeGoogleSignupOrigin();
          const response = await axios.post(`${API_URL}/api/auth/google`, {
            id_token: account.id_token,
            access_token: account.access_token,
            origin,
          });

          token.id = response.data.user.id;
          token.email = response.data.user.email;
          token.name = response.data.user.name;
          token.avatar = response.data.user.avatar;
          token.accessToken = response.data.access_token;
          token.refreshToken = response.data.refresh_token;
          token.accessTokenExpires = Date.now() + (response.data.access_token_expires_in || 0) * 1000;
          token.refreshTokenExpires = Date.now() + (response.data.refresh_token_expires_in || 0) * 1000;
          token.workspace = response.data.workspace;
          token.error = undefined;
          return token;
        } catch {
          return {
            ...token,
            error: 'GoogleTokenExchangeError',
          };
        }
      }

      if (HAS_GOOGLE_OAUTH && account?.provider === 'google' && account.access_token) {
        try {
          const origin = consumeGoogleSignupOrigin();
          const response = await axios.post(`${API_URL}/api/auth/google`, {
            access_token: account.access_token,
            origin,
          });

          token.id = response.data.user.id;
          token.email = response.data.user.email;
          token.name = response.data.user.name;
          token.avatar = response.data.user.avatar;
          token.accessToken = response.data.access_token;
          token.refreshToken = response.data.refresh_token;
          token.accessTokenExpires = Date.now() + (response.data.access_token_expires_in || 0) * 1000;
          token.refreshTokenExpires = Date.now() + (response.data.refresh_token_expires_in || 0) * 1000;
          token.workspace = response.data.workspace;
          token.error = undefined;
          return token;
        } catch {
          return {
            ...token,
            error: 'GoogleTokenExchangeError',
          };
        }
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.avatar = (user as any).avatar;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.accessTokenExpires = Date.now() + (((user as any).accessTokenExpiresIn || 0) * 1000);
        token.refreshTokenExpires = Date.now() + (((user as any).refreshTokenExpiresIn || 0) * 1000);
        token.workspace = (user as any).workspace;
        token.error = undefined;
        return token;
      }

      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number) - 5000) {
        return token;
      }

      if (!token.refreshToken || (token.refreshTokenExpires && Date.now() >= token.refreshTokenExpires)) {
        return {
          ...token,
          error: 'RefreshTokenExpired',
        };
      }

      return refreshAccessToken(token);
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
        (session as any).refreshToken = token.refreshToken;
        (session as any).error = token.error;
        (session as any).workspace = token.workspace;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (!token?.accessToken) {
        return;
      }

      try {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {
            refresh_token: token.refreshToken,
          },
          {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          }
        );
      } catch {
        // Keep sign-out resilient even if backend logout endpoint fails.
      }
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
