// API service layer for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
interface SessionResponse {
  session_id: string;
  successful_documents: Array<{
    path: string;
    type: string;
    size: number;
  }>;
  failed_documents: Array<{
    path: string;
    error: string;
  }>;
}

interface QueryResponse {
  answer: string;
}

// API functions
export const api = {
  // Create a new session with file uploads
  createSession: async (files: File[], modelName: string = 'llama-3.3-70b-versatile'): Promise<SessionResponse> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${API_BASE_URL}/sessions?model_name=${modelName}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    return response.json();
  },

  // Query documents in a session
  querySession: async (sessionId: string, query: string): Promise<QueryResponse> => {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Failed to query session: ${response.statusText}`);
    }

    return response.json();
  },

  // Get session information
  getSessionInfo: async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/info`);

    if (!response.ok) {
      throw new Error(`Failed to get session info: ${response.statusText}`);
    }

    return response.json();
  },

  // List available models
  listModels: async () => {
    const response = await fetch(`${API_BASE_URL}/models`);

    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.statusText}`);
    }

    return response.json();
  },
};