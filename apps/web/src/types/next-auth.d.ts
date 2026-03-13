import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
    };
    workspace?: {
      id: string;
      name: string;
      slug: string;
    };
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    accessTokenExpires?: number;
    refreshTokenExpires?: number;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresIn?: number;
    refreshTokenExpiresIn?: number;
    workspace?: any;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    refreshTokenExpires?: number;
    error?: string;
    workspace?: any;
  }
}
