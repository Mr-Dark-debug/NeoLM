"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NotebookModal from '../components/notebook/NotebookModal';

interface Notebook {
  id: string;
  title: string;
  icon: string;
  date: string;
  sources: number;
}

interface NotebookCardProps {
  notebook: Notebook;
  onDelete: (id: string) => Promise<void>;
}

function NotebookCard({ notebook, onDelete }: NotebookCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenChat = () => {
    router.push(`/notebook/${notebook.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${notebook.title}"?`)) {
      await onDelete(notebook.id);
    }
    
    setIsMenuOpen(false);
  };

  return (
    <Link href={`/notebook/${notebook.id}`} className="block">
      <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center mr-4 bg-gray-100 rounded-lg">
              <img 
                src={notebook.icon} 
                alt=""
                className="w-6 h-6" 
                onError={(e) => {
                  // Fallback for missing icons
                  const target = e.target as HTMLImageElement;
                  target.src = '/icons/document.svg';
                }}
              />
            </div>
            <div>
              <h3 className="font-medium">{notebook.title}</h3>
              <div className="flex items-center text-gray-500 text-sm">
                <span>{notebook.date}</span>
                <span className="mx-2">•</span>
                <span>{notebook.sources} sources</span>
              </div>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg border z-10">
                <button
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenChat();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Open Chat
                </button>
                <button
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  onClick={handleDelete}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotebooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/notebooks');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notebooks: ${response.status}`);
      }
      
      const data = await response.json();
      setNotebooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notebooks:', error);
      setError('Failed to load notebooks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const handleCreateNotebook = () => {
    // Open the modal
    setIsModalOpen(true);
  };

  const handleModalClose = (refreshList = false) => {
    setIsModalOpen(false);
    if (refreshList) {
      fetchNotebooks();
    }
  };

  const handleDeleteNotebook = async (id: string) => {
    try {
      const response = await fetch(`/api/notebooks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notebook');
      }
      
      // Refresh the notebooks list
      fetchNotebooks();
    } catch (error) {
      console.error('Error deleting notebook:', error);
      alert('Failed to delete notebook. Please try again.');
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-5xl font-bold text-center mb-16">Welcome to NeoLM</h1>

      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={handleCreateNotebook}
          className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-3 flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create new
        </button>

        <div className="flex gap-2 bg-gray-100 rounded-full p-1">
          <button 
            className={`p-2 rounded-full ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <button 
            className={`p-2 rounded-full ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">{error}</p>
          <p className="text-gray-400">Try refreshing the page</p>
        </div>
      ) : notebooks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">No notebooks yet</p>
          <p className="text-gray-400">Create your first notebook to get started</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebooks.map((notebook) => (
            <NotebookCard 
              key={notebook.id} 
              notebook={notebook} 
              onDelete={handleDeleteNotebook} 
            />
          ))}
        </div>
      ) : (
        <div className="divide-y">
          {notebooks.map((notebook) => (
            <Link 
              href={`/notebook/${notebook.id}`} 
              key={notebook.id}
              className="flex items-center justify-between py-4 hover:bg-gray-50 px-4 rounded-lg"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center mr-4">
                  <img 
                    src={notebook.icon} 
                    alt=""
                    className="w-6 h-6" 
                    onError={(e) => {
                      // Fallback for missing icons
                      const target = e.target as HTMLImageElement;
                      target.src = '/icons/document.svg';
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-medium">{notebook.title}</h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <span>{notebook.date}</span>
                    <span className="mx-2">•</span>
                    <span>{notebook.sources} sources</span>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>
            </Link>
          ))}
        </div>
      )}

      {/* Notebook Creation Modal */}
      <NotebookModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSuccess={() => fetchNotebooks()} 
      />
    </div>
  );
}