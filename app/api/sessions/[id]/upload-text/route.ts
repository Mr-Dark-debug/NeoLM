import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get form data
    const formData = await req.formData();
    const text = formData.get('text') as string;
    
    if (!text) {
      return NextResponse.json(
        { error: 'No text content provided' },
        { status: 400 }
      );
    }

    // Create a form data to send to backend
    const backendFormData = new FormData();
    backendFormData.append('text', text);
    backendFormData.append('session_id', sessionId);

    // Call the backend API
    const response = await fetch('http://localhost:8000/sessions/upload-text', {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to upload text to backend: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in text upload:', error);
    return NextResponse.json(
      { error: `Text upload failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
