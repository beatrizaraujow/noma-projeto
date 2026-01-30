import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthHeaders } from '@/lib/auth-helpers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const entityType = searchParams.get('entityType') || 'all';
    const workspaceId = searchParams.get('workspaceId');
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const params = new URLSearchParams({
      query,
      entityType,
      limit,
      offset,
      ...(workspaceId && { workspaceId }),
    });

    const response = await fetch(`${API_URL}/search?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
