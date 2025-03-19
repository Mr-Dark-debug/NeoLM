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
    const url = formData.get('url') as string;

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Create form data to send to backend
    const backendFormData = new FormData();
    backendFormData.append('url', url);
    backendFormData.append('session_id', sessionId);

    // Call the backend API
    const response = await fetch('http://localhost:8000/sessions/upload-url', {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to upload URL to backend: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in URL upload:', error);
    return NextResponse.json(
      { error: `URL upload failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
