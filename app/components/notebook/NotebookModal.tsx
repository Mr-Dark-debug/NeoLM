"use client";

import { useState, useRef } from 'react';
import UploadSourcesModal from './UploadSourcesModal';
import PasteTextModal from './PasteTextModal';
import WebsiteUrlModal from './WebsiteUrlModal';
import YoutubeUrlModal from './YoutubeUrlModal';
import ProgressBar from './ProgressBar';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotebookModal({ isOpen, onClose }: NotebookModalProps) {
  const [currentModal, setCurrentModal] = useState<string>('main');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadedTexts, setUploadedTexts] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [notebookTitle, setNotebookTitle] = useState<string>('New Notebook');
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    setProgress(0);
    
    // Simulate progress
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        // Increase progress, but stop at 90% to wait for actual completion
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 90) {
          clearInterval(progressIntervalRef.current!);
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
    startProgressSimulation();
    
    try {
      // Create FormData to send files
      const formData = new FormData();
      
      // Add files
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Add URLs and texts as JSON
      formData.append('urls', JSON.stringify(uploadedUrls));
      formData.append('texts', JSON.stringify(uploadedTexts));
      
      // Make API call to backend
      const response = await fetch('/api/sessions', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to process documents');
      }
      
      const data = await response.json();
      
      // Complete the progress
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgress(100);
      
      // Create a notebook with the processed documents
      const notebookResponse = await fetch('/api/notebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: notebookTitle,
          sources: uploadedFiles.length + uploadedUrls.length + uploadedTexts.length,
          sessionId: data.session_id
        }),
      });
      
      if (!notebookResponse.ok) {
        throw new Error('Failed to create notebook');
      }
      
      setSuccessMessage('Notebook created successfully!');
      
      // Reset after 2 seconds and close modal
      setTimeout(() => {
        setSuccessMessage('');
        setIsProcessing(false);
        setProgress(0);
        setUploadedFiles([]);
        setUploadedUrls([]);
        setUploadedTexts([]);
        setNotebookTitle('New Notebook');
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error processing documents:', error);
      setIsProcessing(false);
      
      // Stop progress simulation
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      setProgress(0);
    }
  };

  // Clean up interval on unmount
  const cleanupInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Handle modal close
  const handleClose = () => {
    cleanupInterval();
    setCurrentModal('main');
    setIsProcessing(false);
    setProgress(0);
    setSuccessMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {currentModal === 'main' && (
          <>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <h2 className="text-xl font-semibold">NotebookLM</h2>
              </div>
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-medium mb-2">Add sources</h3>
              <p className="text-gray-600 text-sm mb-4">
                Sources let NotebookLM base its responses on the information that matters most to you.
                (Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)
              </p>
              
              {/* Notebook title */}
              <div className="mb-4">
                <label htmlFor="notebook-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Notebook Title
                </label>
                <input
                  type="text"
                  id="notebook-title"
                  value={notebookTitle}
                  onChange={(e) => setNotebookTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter notebook title"
                />
              </div>
              
              {/* Upload area */}
              <div className="border border-dashed rounded-lg p-8 mb-4 text-center">
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mb-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p className="text-gray-700 font-medium">Upload sources</p>
                  <p className="text-gray-500 text-sm mt-1">Drag & drop or choose file</p>
                  <button 
                    onClick={() => setCurrentModal('upload')}
                    className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    choose file
                  </button>
                </div>
              </div>
              
              <p className="text-gray-500 text-sm mb-4">
                Supported file types: PDF, txt, Markdown, Audio (e.g. mp3)
              </p>
              
              {/* Source options */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setCurrentModal('text')}
                  className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span className="text-sm">Copied text</span>
                </button>
                
                <button
                  onClick={() => setCurrentModal('website')}
                  className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  <span className="text-sm">Website</span>
                </button>
                
                <button
                  onClick={() => setCurrentModal('youtube')}
                  className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                  <span className="text-sm">YouTube</span>
                </button>
              </div>
              
              {/* Uploaded items */}
              {(uploadedFiles.length > 0 || uploadedUrls.length > 0 || uploadedTexts.length > 0) && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Uploaded sources ({uploadedFiles.length + uploadedUrls.length + uploadedTexts.length})</h4>
                  <ul className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <li key={`file-${index}`} className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm">
                        <span>{file.name}</span>
                        <button 
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </li>
                    ))}
                    
                    {uploadedUrls.map((url, index) => (
                      <li key={`url-${index}`} className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm">
                        <span>{url.length > 40 ? url.substring(0, 40) + '...' : url}</span>
                        <button 
                          onClick={() => setUploadedUrls(prev => prev.filter((_, i) => i !== index))}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </li>
                    ))}
                    
                    {uploadedTexts.map((text, index) => (
                      <li key={`text-${index}`} className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm">
                        <span>{text.length > 40 ? text.substring(0, 40) + '...' : text}</span>
                        <button 
                          onClick={() => setUploadedTexts(prev => prev.filter((_, i) => i !== index))}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Process button */}
              {(uploadedFiles.length > 0 || uploadedUrls.length > 0 || uploadedTexts.length > 0) && (
                <div className="flex justify-end">
                  <button
                    onClick={handleProcessDocuments}
                    disabled={isProcessing}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isProcessing ? 'Processing...' : 'Process'}
                  </button>
                </div>
              )}
              
              {/* Processing progress */}
              {isProcessing && (
                <div className="mt-4">
                  <ProgressBar progress={progress} />
                  {successMessage && (
                    <p className="text-green-500 text-center mt-2">{successMessage}</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        
        {currentModal === 'upload' && (
          <UploadSourcesModal onUpload={handleFileUpload} onBack={() => setCurrentModal('main')} />
        )}
        
        {currentModal === 'text' && (
          <PasteTextModal onUpload={handleTextUpload} onBack={() => setCurrentModal('main')} />
        )}
        
        {currentModal === 'website' && (
          <WebsiteUrlModal onUpload={handleUrlUpload} onBack={() => setCurrentModal('main')} />
        )}
        
        {currentModal === 'youtube' && (
          <YoutubeUrlModal onUpload={handleUrlUpload} onBack={() => setCurrentModal('main')} />
        )}
      </div>
    </div>
  );
}
