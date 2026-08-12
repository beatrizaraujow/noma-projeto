import { NextRequest, NextResponse } from 'next/server';
import { serverApiUrl } from '@/lib/server-api-url';

// Route handler roda no servidor: usa a origem interna quando existir, para nao
// depender da URL publica de dentro do container. Ver server-api-url.ts.
const API_URL = serverApiUrl;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
        { message: text || 'Falha ao criar conta' },
        { status: response.status },
      );
    }

    return NextResponse.json({ message: text }, { status: response.status });
  } catch (error) {
    console.error('Register proxy error:', error);
    return NextResponse.json(
      { message: 'Nao foi possivel conectar ao servidor. Tente novamente.' },
      { status: 503 },
    );
  }
}
