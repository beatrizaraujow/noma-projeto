import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/auth-helpers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/workspaces`, {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { message: text || 'Falha ao obter workspaces' },
        { status: response.status },
      );
    }

    return NextResponse.json({ message: text }, { status: response.status });
  } catch (error) {
    console.error('Workspace list proxy error:', error);
    return NextResponse.json(
      { message: 'Nao foi possivel conectar ao servidor. Tente novamente.' },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const response = await fetch(`${API_URL}/api/workspaces`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { message: text || 'Falha ao criar workspace' },
        { status: response.status },
      );
    }

    return NextResponse.json({ message: text }, { status: response.status });
  } catch (error) {
    console.error('Workspace proxy error:', error);
    return NextResponse.json(
      { message: 'Nao foi possivel conectar ao servidor. Tente novamente.' },
      { status: 503 },
    );
  }
}
