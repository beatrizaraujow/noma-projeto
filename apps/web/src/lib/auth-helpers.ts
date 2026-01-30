import { getServerSession } from 'next-auth';

export async function getAccessToken(): Promise<string | null> {
  const session = await getServerSession();
  return (session as any)?.user?.accessToken || null;
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
