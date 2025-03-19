import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, handleApiError } from '@/app/utils/api';

// Fallback mock data for notebooks in case the backend is unavailable
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
    // Fetch sessions from the backend
    const response = await fetch(getBackendUrl('/sessions'));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sessions: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform sessions into notebooks format
    const notebooks = data.sessions.map((session: any) => {
      // Get a random icon
      const icons = ['/icons/robot.svg', '/icons/brain.svg', '/icons/document.svg', '/icons/chat.svg'];
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      
      // Format the date
      let dateStr = 'Unknown date';
      if (session.created_at && session.created_at !== 'unknown') {
        try {
          const date = new Date(session.created_at);
          dateStr = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          });
        } catch (e) {
          console.error('Error formatting date:', e);
        }
      }
      
      return {
        id: session.id,
        title: session.title || `Notebook ${session.id.substring(0, 8)}`,
        icon: randomIcon,
        date: dateStr,
        sources: session.document_count || 0
      };
    });
    
    return NextResponse.json(notebooks);
  } catch (error) {
    console.error('Error fetching notebooks:', handleApiError(error));
    // Return empty array instead of mock data
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Create a new notebook
    const newNotebook = {
      id: data.sessionId || Date.now().toString(), // Use the session ID if available
      title: data.title || 'New Notebook',
      icon: data.icon || '/icons/document.svg',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sources: data.sources || 0
    };
    
    // Try to get session info from the backend
    try {
      const sessionResponse = await fetch(getBackendUrl(`/sessions/${newNotebook.id}/info`));
      if (sessionResponse.ok) {
        const sessionInfo = await sessionResponse.json();
        newNotebook.sources = sessionInfo.ingested_documents?.length || newNotebook.sources;
      }
    } catch (error) {
      console.error('Error fetching session info:', handleApiError(error));
    }
    
    return NextResponse.json(newNotebook);
  } catch (error) {
    console.error('Error creating notebook:', handleApiError(error));
    return NextResponse.json(
      { error: 'Failed to create notebook' },
      { status: 500 }
    );
  }
}
