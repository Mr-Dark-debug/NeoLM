"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface NotebookData {
  id: string;
  title: string;
  icon: string;
  date: string;
  sources: number;
  content?: string;
  documents?: DocumentInfo[];
}

interface DocumentInfo {
  name: string;
  path: string;
  type?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface AddDocumentSectionProps {
  sessionId: string;
  onSuccess: (newDocument: DocumentInfo) => void;
  onCancel: () => void;
}

const AddDocumentSection: React.FC<AddDocumentSectionProps> = ({
  sessionId,
  onSuccess,
  onCancel
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleUpload = async () => {
    if (!sessionId) return;

    setIsUploading(true);

    try {
      if (selectedFile) {
        // Upload file to backend
        const formData = new FormData();
        formData.append('files', selectedFile);
        
        const response = await fetch(`/api/sessions/${sessionId}/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload file: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.successful_documents && data.successful_documents.length > 0) {
          const newDocument: DocumentInfo = {
            name: data.successful_documents[0].filename || selectedFile.name,
            path: data.successful_documents[0].path || `/uploads/${sessionId}/${selectedFile.name}`,
            type: data.successful_documents[0].mime_type || selectedFile.type
          };

          onSuccess(newDocument);
        } else {
          throw new Error("Failed to process document");
        }
      } else if (text) {
        // Upload text to backend
        const formData = new FormData();
        formData.append('text', text);
        formData.append('session_id', sessionId);
        
        const response = await fetch(`/api/sessions/${sessionId}/upload-text`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload text: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.successful_documents && data.successful_documents.length > 0) {
          const newDocument: DocumentInfo = {
            name: data.successful_documents[0].filename || `Text document ${new Date().toLocaleString()}`,
            path: data.successful_documents[0].path || `/uploads/${sessionId}/text_document.txt`,
            type: data.successful_documents[0].mime_type || 'text/plain'
          };

          onSuccess(newDocument);
        } else {
          throw new Error("Failed to process text document");
        }
      } else if (url) {
        // Upload URL to backend
        const formData = new FormData();
        formData.append('url', url);
        formData.append('session_id', sessionId);
        
        const response = await fetch(`/api/sessions/${sessionId}/upload-url`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload URL: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.successful_documents && data.successful_documents.length > 0) {
          const newDocument: DocumentInfo = {
            name: data.successful_documents[0].filename || new URL(url).hostname,
            path: data.successful_documents[0].path || url,
            type: data.successful_documents[0].mime_type || 'url'
          };

          onSuccess(newDocument);
        } else {
          throw new Error("Failed to process URL");
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <div className="border border-dashed rounded-lg p-8 mb-4 text-center">
          <div className="flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mb-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p className="text-gray-700 font-medium">Upload document</p>
            <p className="text-gray-500 text-sm mt-1">Drag & drop or choose file</p>
            <input type="file" onChange={handleFileChange} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <textarea value={text} onChange={handleTextChange} placeholder="Paste text" className="w-full p-2 border rounded-lg" />
          </button>
          <button className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <input type="url" value={url} onChange={handleUrlChange} placeholder="Enter URL" className="w-full p-2 border rounded-lg" />
          </button>
        </div>
      </div>
      <div className="flex justify-end">
        <button 
          onClick={onCancel}
          className="mr-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          onClick={handleUpload}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isUploading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            'Upload'
          )}
        </button>
      </div>
    </div>
  );
};

export default function NotebookPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [notebook, setNotebook] = useState<NotebookData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNotebookLoading, setIsNotebookLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'sources'>('chat');
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const fetchNotebook = async () => {
      try {
        setIsNotebookLoading(true);
        
        // First try to get session info from the backend
        const backendResponse = await fetch(`http://localhost:8000/sessions/${id}/info`);
        
        if (backendResponse.ok) {
          const sessionData = await backendResponse.json();
          
          // Process document info
          const documentsList = sessionData.ingested_documents?.map((doc: any) => {
            // Extract filename from path
            const pathParts = doc.path?.split('/') || [];
            const fileName = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'Document';
            
            return {
              name: fileName,
              path: doc.path || '',
              type: doc.type || 'document'
            };
          }) || [];
          
          // Now fetch the session list to get the title
          const sessionsResponse = await fetch(`http://localhost:8000/sessions`);
          let notebookTitle = `Notebook ${id.substring(0, 8)}`;
          
          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            const session = sessionsData.sessions?.find((s: any) => s.id === id);
            if (session && session.title) {
              notebookTitle = session.title;
            }
          }
          
          // Create notebook from backend session data
          setNotebook({
            id,
            title: notebookTitle,
            icon: '/icons/document.svg',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            sources: sessionData.ingested_documents?.length || 0,
            content: `Session contains ${sessionData.ingested_documents?.length || 0} documents.`,
            documents: documentsList
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
                content: "This is the content of the notebook. In a real application, this would contain the actual notebook content.",
                documents: Array.from({ length: foundNotebook.sources || 0 }).map((_, i) => ({
                  name: `Document ${i+1}`,
                  path: `/path/to/document${i+1}`,
                  type: 'document'
                }))
              });
            } else {
              // If notebook not found in API, create a placeholder
              setNotebook({
                id,
                title: 'Notebook not found',
                icon: '/icons/document.svg',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                sources: 0,
                content: "Notebook not found. It may have been deleted or you don't have access to it.",
                documents: []
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
          content: "There was an error loading this notebook. Please try again later.",
          documents: []
        });
      } finally {
        setIsNotebookLoading(false);
      }
    };

    fetchNotebook();
  }, [id]);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || isLoading || !notebook) return;
    
    setIsLoading(true);
    setError(null);
    
    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    
    // Add a loading message placeholder
    const loadingMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setQuery('');
    
    try {
      // Send query to backend
      const response = await fetch(`http://localhost:8000/sessions/${id}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: userMessage.content,
          session_id: id
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to query notebook: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Extract answer from response
      const answer = data.answer || 'No response received from the system.';
      
      // Replace loading message with actual response
      setMessages(prev => {
        const newMessages = [...prev];
        // Remove the loading message
        newMessages.pop();
        // Add the real assistant message
        newMessages.push({
          role: 'assistant',
          content: answer,
          timestamp: new Date()
        });
        return newMessages;
      });
    } catch (error) {
      console.error('Error querying the notebook:', error);
      
      // Set a more user-friendly error message
      const errorMessage = (error as Error).message || 'An error occurred while processing your query';
      setError(errorMessage);
      
      // Replace loading message with error message
      setMessages(prev => {
        const newMessages = [...prev];
        // Remove the loading message
        newMessages.pop();
        // Add the error message
        newMessages.push({
          role: 'assistant',
          content: `Sorry, there was an error: ${errorMessage}. Please try again.`,
          timestamp: new Date()
        });
        return newMessages;
      });
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b py-4">
        <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-800 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </Link>
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center mr-3 bg-gray-100 rounded-lg">
                <img 
                  src={notebook.icon} 
                  alt=""
                  className="w-5 h-5" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/icons/document.svg';
                  }}
                />
              </div>
              <h1 className="text-xl font-bold">{notebook.title}</h1>
            </div>
          </div>
          <div className="flex items-center">
            <button className="text-gray-500 hover:text-gray-800 px-3 py-1 rounded-md text-sm">
              Share
            </button>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-800 px-3 py-1 rounded-md text-sm">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Left sidebar */}
        <div className="w-64 bg-gray-50 border-r p-4 hidden md:block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500">Sources</h2>
            <button 
              onClick={() => setIsAddDocumentModalOpen(true)}
              className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          
          <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {notebook.documents && notebook.documents.length > 0 ? (
              <div className="space-y-2">
                {notebook.documents.map((doc, i) => (
                  <div key={i} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                    <div className="w-6 h-6 flex items-center justify-center mr-2 bg-gray-200 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <span className="text-sm truncate">{doc.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No sources available</div>
            )}
          </div>

          <button 
            onClick={() => setIsAddDocumentModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md py-2 mt-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add source
          </button>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col">
          {/* Chat area */}
          <div className="flex-1 flex flex-col p-4 overflow-y-auto" ref={chatContainerRef}>
            {error && (
              <div className="bg-red-50 text-red-700 p-4 mb-4 rounded-lg">
                {error}
                <button 
                  className="ml-2 text-red-700 hover:text-red-900"
                  onClick={() => setError(null)}
                >
                  ✕
                </button>
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Start a conversation</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Ask questions about the documents in this notebook to get insights and answers.
                </p>
                <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                  <button 
                    className="text-left p-3 border rounded-lg hover:bg-gray-50"
                    onClick={() => {
                      setQuery("What are the main topics in these documents?");
                      document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }}
                  >
                    What are the main topics in these documents?
                  </button>
                  <button 
                    className="text-left p-3 border rounded-lg hover:bg-gray-50"
                    onClick={() => {
                      setQuery("Summarize the key points from all documents.");
                      document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }}
                  >
                    Summarize the key points from all documents.
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-3xl rounded-lg p-4 ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      ) : (
                        <div>
                          {message.content}
                          <div className="text-xs mt-2 opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t p-4">
            <form onSubmit={handleQuerySubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:bg-blue-300 hover:bg-blue-600 transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </form>
            <div className="text-xs text-center text-gray-400 mt-2">
              NotebookLM can be inaccurate; please double-check its responses.
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-80 bg-gray-50 border-l p-4 hidden lg:block">
          <h2 className="text-sm font-medium text-gray-500 mb-4">Studio</h2>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Audio Overview</h3>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Deep Dive conversation</div>
                  <div className="text-xs text-gray-500">Two hosts (English only)</div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 text-sm py-1.5 border rounded-md hover:bg-gray-50">
                  Customize
                </button>
                <button className="flex-1 text-sm py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-700">
                  Generate
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Notes</h3>
              <button className="text-sm text-blue-500 hover:text-blue-700">
                Add note
              </button>
            </div>
            <div className="bg-white border rounded-lg p-4 h-60 overflow-y-auto">
              <div className="text-center h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No notes yet</p>
                <button className="mt-4 text-sm text-blue-500 hover:text-blue-700 border border-blue-500 px-3 py-1 rounded-md">
                  Create your first note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Document Modal */}
      {isAddDocumentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add Document to Notebook</h3>
              <button 
                onClick={() => setIsAddDocumentModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <AddDocumentSection 
              sessionId={id} 
              onSuccess={(newDocument) => {
                // Update the notebook with new document
                if (notebook) {
                  setNotebook({
                    ...notebook,
                    sources: (notebook.sources || 0) + 1,
                    documents: [
                      ...(notebook.documents || []),
                      newDocument
                    ]
                  });
                }
                setIsAddDocumentModalOpen(false);
              }}
              onCancel={() => setIsAddDocumentModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}