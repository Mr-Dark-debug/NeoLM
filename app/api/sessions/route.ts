import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, handleApiError } from '@/app/utils/api';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request (consume it once)
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Forward the request to the backend API
    const backendResponse = await fetch(getBackendUrl('/sessions'), {
      method: 'POST',
      body: formData, // Forward the form data directly
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(`Backend API error: ${backendResponse.status} - ${errorText}`);
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating session:', handleApiError(error));

    // Enhanced fallback response
    const mockSessionResponse = {
      session_id: 'session_' + Date.now().toString(),
      successful_documents: [],
      failed_documents: []
    };

    // Since formData was already consumed, we can't re-read it here.
    // Instead, indicate the failure reason in the response.
    const errorMessage = handleApiError(error);
    mockSessionResponse.failed_documents.push({
      path: 'unknown',
      error: errorMessage
    });

    return NextResponse.json(mockSessionResponse, { status: 200 });
  }
}
