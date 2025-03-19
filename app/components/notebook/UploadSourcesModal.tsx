"use client";

import { useState, useRef } from 'react';

interface UploadSourcesModalProps {
  onUpload: (files: File[]) => void;
  onBack: () => void;
}

export default function UploadSourcesModal({ onUpload, onBack }: UploadSourcesModalProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h2 className="text-xl font-semibold">Upload sources</h2>
        </div>
      </div>
      
      <div className="p-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-12 mb-4 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          
          <div className="flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mb-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p className="text-gray-700 font-medium">Drag & drop or choose file</p>
            <button 
              onClick={openFileSelector}
              className="mt-4 text-blue-500 hover:text-blue-600 underline"
            >
              choose file
            </button>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm mb-4">
          Supported file types: PDF, txt, Markdown, Audio (e.g. mp3)
        </p>
        
        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Selected files ({selectedFiles.length})</h4>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm">
                  <span>{file.name}</span>
                  <button 
                    onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
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
        
        <div className="flex justify-end">
          <button
            onClick={onBack}
            className="mr-2 px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            Upload
          </button>
        </div>
      </div>
    </>
  );
}
