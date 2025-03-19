import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, handleApiError } from '@/app/utils/api';

// Mock data for notebooks since the backend doesn't support GET /sessions
const mockNotebooks = [
  {
    id: '1',
    title: 'MML-maths',
    icon: '/icons/robot.svg',
    date: 'Feb 2, 2025',
    sources: 2
  },
  {
    id: '2',
    title: 'Machine and Deep Learning',
    icon: '/icons/brain.svg',
    date: 'Jan 2, 2025',
    sources: 9
  }
];

export async function GET() {
  try {
    // Since the backend doesn't support GET /sessions, we'll use mock data
    // In a real app, you would implement a GET endpoint in the backend
    return NextResponse.json(mockNotebooks);
  } catch (error) {
    console.error('Error fetching notebooks:', handleApiError(error));
    return NextResponse.json(mockNotebooks);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Create a new notebook
    const newNotebook = {
      id: Date.now().toString(),
      title: data.title || 'New Notebook',
      icon: data.icon || '/icons/document.svg',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sources: data.sources || 0
    };
    
    return NextResponse.json(newNotebook);
  } catch (error) {
    console.error('Error creating notebook:', handleApiError(error));
    return NextResponse.json(
      { error: 'Failed to create notebook' },
      { status: 500 }
    );
  }
}
