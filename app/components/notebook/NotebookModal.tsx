import { useState, useRef, useEffect } from 'react';
import UploadSourcesModal from './UploadSourcesModal';
import PasteTextModal from './PasteTextModal';
import WebsiteUrlModal from './WebsiteUrlModal';
import YoutubeUrlModal from './YoutubeUrlModal';
import ProgressBar from './ProgressBar';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: (refreshList?: boolean) => void;
  onSuccess?: () => void;
}

export default function NotebookModal({ isOpen, onClose, onSuccess }: NotebookModalProps) {
  const [currentModal, setCurrentModal] = useState<string>('main');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadedTexts, setUploadedTexts] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [notebookTitle, setNotebookTitle] = useState<string>('New Notebook');
  const [processingError, setProcessingError] = useState<string>('');
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Cleanup function for intervals and state
  const cleanup = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setCurrentModal('main');
    setIsProcessing(false);
    setProgress(0);
    setSuccessMessage('');
    setUploadedFiles([]);
    setUploadedUrls([]);
    setUploadedTexts([]);
    setNotebookTitle('New Notebook');
    setProcessingError('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, []);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    setCurrentModal('main');
  };

  const handleUrlUpload = (url: string) => {
    setUploadedUrls(prev => [...prev, url]);
    setCurrentModal('main');
  };

  const handleTextUpload = (text: string) => {
    setUploadedTexts(prev => [...prev, text]);
    setCurrentModal('main');
  };

  const startProgressSimulation = () => {
    setProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 90) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          return 90;
        }
        return newProgress;
      });
    }, 300);
  };

  const handleProcessDocuments = async () => {
    if (uploadedFiles.length === 0 && uploadedUrls.length === 0 && uploadedTexts.length === 0) {
      return;
    }
    
    setIsProcessing(true);
    setProcessingError('');
    startProgressSimulation();
    
    try {
      const formData = new FormData();
      
      // Add files
      uploadedFiles.forEach(file => formData.append('files', file));
      
      // Add URLs
      formData.append('urls', JSON.stringify(uploadedUrls));
      
      // Add plain text (combine all texts into one if multiple)
      if (uploadedTexts.length > 0) {
        formData.append('plain_text', uploadedTexts.join('\n\n---\n\n'));
      }
      
      // Create session
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        body: formData,
      });
      
      if (!sessionResponse.ok) {
        throw new Error('Failed to process documents');
      }
      
      const sessionData = await sessionResponse.json();
      
      if (sessionData.error) {
        throw new Error(sessionData.error);
      }
      
      // Complete progress
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgress(100);
      
      // Create notebook
      const notebookResponse = await fetch('/api/notebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: notebookTitle,
          sessionId: sessionData.session_id,
          sources: sessionData.successful_documents?.length || 0
        }),
      });
      
      if (!notebookResponse.ok) {
        throw new Error('Failed to create notebook');
      }
      
      const notebookData = await notebookResponse.json();
      
      if (notebookData.error) {
        throw new Error(notebookData.error);
      }
      
      setSuccessMessage('Notebook created successfully!');
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal after success
      setTimeout(() => {
        onClose(true);
      }, 1500);
    } catch (error) {
      console.error('Error processing documents:', error);
      setProcessingError((error as Error).message || 'An error occurred while processing documents');
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setIsProcessing(false);
    }
  };

  const renderModalContent = () => {
    if (currentModal === 'uploadSources') {
      return (
        <UploadSourcesModal 
          onUpload={handleFileUpload}
          onBack={() => setCurrentModal('main')}
        />
      );
    }
    
    if (currentModal === 'pasteText') {
      return (
        <PasteTextModal 
          onUpload={handleTextUpload}
          onBack={() => setCurrentModal('main')}
        />
      );
    }
    
    if (currentModal === 'websiteUrl') {
      return (
        <WebsiteUrlModal 
          onUpload={handleUrlUpload}
          onBack={() => setCurrentModal('main')}
        />
      );
    }
    
    if (currentModal === 'youtubeUrl') {
      return (
        <YoutubeUrlModal 
          onUpload={handleUrlUpload}
          onBack={() => setCurrentModal('main')}
        />
      );
    }
    
    return (
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Add sources to your notebook</h3>
          <p className="text-gray-500 mb-4">
            Choose files, websites, or text to add to your notebook.
          </p>
          
          {/* Notebook title input */}
          <div className="mb-6">
            <label htmlFor="notebookTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Notebook Title
            </label>
            <input
              type="text"
              id="notebookTitle"
              value={notebookTitle}
              onChange={(e) => setNotebookTitle(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter notebook title"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setCurrentModal('uploadSources')}
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Upload files</span>
            </button>
            
            <button 
              onClick={() => setCurrentModal('pasteText')}
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Paste text</span>
            </button>
            
            <button 
              onClick={() => setCurrentModal('websiteUrl')}
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>Website URL</span>
            </button>
            
            <button 
              onClick={() => setCurrentModal('youtubeUrl')}
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
              <span>YouTube URL</span>
            </button>
          </div>
        </div>
        
        {/* Selected sources */}
        {(uploadedFiles.length > 0 || uploadedUrls.length > 0 || uploadedTexts.length > 0) && (
          <div className="mt-6 mb-4">
            <h4 className="text-sm font-medium mb-2">Selected sources</h4>
            
            <div className="space-y-2">
              {uploadedFiles.map((file, i) => (
                <div key={`file-${i}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    </div>
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                  <button 
                    onClick={() => setUploadedFiles(prev => prev.filter((_, index) => index !== i))}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
              
              {uploadedUrls.map((url, i) => (
                <div key={`url-${i}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </div>
                    <span className="text-sm truncate">{url}</span>
                  </div>
                  <button 
                    onClick={() => setUploadedUrls(prev => prev.filter((_, index) => index !== i))}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
              
              {uploadedTexts.map((text, i) => (
                <div key={`text-${i}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <span className="text-sm truncate">{text.slice(0, 50)}{text.length > 50 ? '...' : ''}</span>
                  </div>
                  <button 
                    onClick={() => setUploadedTexts(prev => prev.filter((_, index) => index !== i))}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {processingError && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
            {processingError}
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onClose()}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 mr-2"
          >
            Cancel
          </button>
          
          <button
            onClick={handleProcessDocuments}
            disabled={uploadedFiles.length === 0 && uploadedUrls.length === 0 && uploadedTexts.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            Create notebook
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Modal header */}
        {currentModal === 'main' && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Create a new notebook</h2>
            <button 
              onClick={() => onClose()}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
        
        {/* Processing state */}
        {isProcessing ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 mb-4">
              {successMessage ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
              ) : (
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              )}
            </div>
            
            <h3 className="text-xl font-bold mb-4">
              {successMessage || 'Processing your documents...'}
            </h3>
            
            {!successMessage && <ProgressBar progress={progress} />}
            
            <p className="text-gray-500 text-sm mt-2">
              {successMessage ? 'Redirecting to your notebook...' : 'This may take a few moments'}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {renderModalContent()}
          </div>
        )}
      </div>
    </div>
  );
}
