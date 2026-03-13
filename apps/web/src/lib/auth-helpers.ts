import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function getAccessToken(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session as any)?.accessToken || (session as any)?.user?.accessToken || null;
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  
  if (!token) {
    return {
      'Content-Type': 'application/json',
    };
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
