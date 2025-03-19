// Backend API configuration
export const BACKEND_API_URL = 'http://localhost:8000';

// Helper function to build backend API URLs
export const getBackendUrl = (path: string): string => {
  return `${BACKEND_API_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

// Helper function to handle API errors
export const handleApiError = (error: any, fallbackMessage: string = 'An error occurred'): string => {
  console.error('API Error:', error);
  
  if (error instanceof Response) {
    return `API Error: ${error.status} ${error.statusText}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return fallbackMessage;
};
