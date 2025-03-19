import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, handleApiError } from '@/app/utils/api';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { query } = await request.json();

    // Call the backend API
    const backendResponse = await fetch(getBackendUrl(`/sessions/${id}/query`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.status}`);
    }
    
    const data = await backendResponse.json();
    
    return NextResponse.json({
      answer: data.answer
    });
  } catch (error) {
    console.error('Error processing query:', handleApiError(error));
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
