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
  }

  interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    accessToken?: string;
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
    workspace?: any;
  }
}
