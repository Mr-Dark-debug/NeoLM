import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, handleApiError } from '@/app/utils/api';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request (consume it once)
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const plainText = formData.get('plain_text') as string || '';
    const urlsStr = formData.get('urls') as string || '[]';
    const urls = JSON.parse(urlsStr);
    
    // Create a new FormData object to send to the backend
    const backendFormData = new FormData();
    
    // Add files if present
    if (files && files.length > 0) {
      files.forEach(file => backendFormData.append('files', file));
    }
    
    // Add plain text if present
    if (plainText) {
      backendFormData.append('plain_text', plainText);
    }
    
    // Add URL if present (first URL only for now, as our backend handles one URL at a time)
    if (urls && urls.length > 0) {
      backendFormData.append('url', urls[0]);
    }
    
    // Optional parameters for chunking
    const chunkSize = formData.get('chunk_size') as string;
    const chunkOverlap = formData.get('chunk_overlap') as string;
    
    if (chunkSize) {
      backendFormData.append('chunk_size', chunkSize);
    }
    
    if (chunkOverlap) {
      backendFormData.append('chunk_overlap', chunkOverlap);
    }

    // Forward the request to the backend API
    const backendResponse = await fetch(getBackendUrl('/sessions'), {
      method: 'POST',
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(`Backend API error: ${backendResponse.status} - ${errorText}`);
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating session:', handleApiError(error));

    // Define the types for our mock response
    interface FailedDocument {
      path: string;
      error: string;
    }

    interface SessionResponse {
      session_id: string;
      successful_documents: string[];
      failed_documents: FailedDocument[];
    }

    // Enhanced fallback response with proper typing
    const mockSessionResponse: SessionResponse = {
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
