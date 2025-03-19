"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface NotebookData {
  id: string;
  title: string;
  icon: string;
  date: string;
  sources: number;
  content?: string;
}

export default function NotebookPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [notebook, setNotebook] = useState<NotebookData | null>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNotebookLoading, setIsNotebookLoading] = useState(true);
  const [response, setResponse] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotebook = async () => {
      try {
        setIsNotebookLoading(true);
        
        // First try to get session info from the backend
        const backendResponse = await fetch(`http://localhost:8000/sessions/${id}/info`);
        
        if (backendResponse.ok) {
          const sessionData = await backendResponse.json();
          
          // Create notebook from backend session data
          setNotebook({
            id,
            title: `Notebook ${id.substring(0, 8)}`,
            icon: '/icons/document.svg',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            sources: sessionData.ingested_documents?.length || 0,
            content: `Session contains ${sessionData.ingested_documents?.length || 0} documents.`
          });
        } else {
          // Fallback to frontend API
          const response = await fetch(`/api/notebooks`);
          if (response.ok) {
            const notebooks = await response.json();
            const foundNotebook = notebooks.find((nb: NotebookData) => nb.id === id);
            
            if (foundNotebook) {
              setNotebook({
                ...foundNotebook,
                content: "This is the content of the notebook. In a real application, this would contain the actual notebook content."
              });
            } else {
              // If notebook not found in API, create a placeholder
              setNotebook({
                id,
                title: 'Notebook not found',
                icon: '/icons/document.svg',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                sources: 0,
                content: "Notebook not found. It may have been deleted or you don't have access to it."
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching notebook:', error);
        // Create a placeholder for error state
        setNotebook({
          id,
          title: 'Error loading notebook',
          icon: '/icons/document.svg',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          sources: 0,
          content: "There was an error loading this notebook. Please try again later."
        });
      } finally {
        setIsNotebookLoading(false);
      }
    };

    fetchNotebook();
  }, [id]);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResponse(null);
    
    try {
      // Make API call to query the notebook
      const response = await fetch(`/api/notebooks/${id}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to query notebook');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResponse(data.answer);
    } catch (error) {
      console.error('Error querying the notebook:', error);
      setResponse('Sorry, there was an error processing your query. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isNotebookLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Notebook not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-800 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to notebooks
        </Link>
      </div>

      <div className="flex items-center mb-8">
        <div className="w-12 h-12 flex items-center justify-center mr-4 bg-gray-100 rounded-lg">
          <img 
            src={notebook.icon} 
            alt=""
            className="w-8 h-8" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/icons/document.svg';
            }}
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{notebook.title}</h1>
          <div className="flex items-center text-gray-500 text-sm">
            <span>{notebook.date}</span>
            <span className="mx-2">•</span>
            <span>{notebook.sources} sources</span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ask about this notebook</h2>
        <form onSubmit={handleQuerySubmit}>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-purple-500 text-white rounded-full px-6 py-2 disabled:bg-purple-300 hover:bg-purple-600 transition-colors"
            >
              {isLoading ? 'Processing...' : 'Ask'}
            </button>
          </div>
        </form>
      </div>

      {response && (
        <div className="bg-white shadow-sm border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Response</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p>{response}</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm border rounded-lg p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Notebook Content</h2>
        <div className="bg-gray-50 rounded-lg p-4 min-h-40">
          <p>{notebook.content}</p>
        </div>
      </div>
    </div>
  );
}