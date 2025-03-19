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

    // Handle file upload
    const formData = await req.formData();
    const file = formData.get('files') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Convert the file to appropriate format for the backend
    const fileBytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileBytes);

    // Create a form data object to send to the backend
    const backendFormData = new FormData();
    const backendFile = new File([fileBuffer], file.name, { type: file.type });
    backendFormData.append('files', backendFile);
    backendFormData.append('session_id', sessionId);

    // Call the backend API
    const response = await fetch(`http://localhost:8000/sessions/${sessionId}/upload`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to upload file to backend: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in file upload:', error);
    return NextResponse.json(
      { error: `File upload failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
