"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateNotebook() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array and append to existing files
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim() === '' || files.length === 0) {
      setError('Please provide a title and upload at least one file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/sessions', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`);
      }

      const data = await response.json();
      if (data.failed_documents.length > 0) {
        throw new Error(`Some files failed to process: ${data.failed_documents.map((d: any) => d.error).join(', ')}`);
      }

      // Navigate to the notebook page with the session ID
      router.push(`/notebook/${data.session_id}`);
    } catch (error) {
      console.error('Error creating notebook:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while creating the notebook.');
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-800 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to notebooks
        </Link>
      </div>

      <div className="bg-white shadow-sm border rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-8">Create a new notebook</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Notebook Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter a title for your notebook"
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Files
            </label>
            <div className={`border-2 border-dashed rounded-lg p-8 text-center ${isLoading ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileChange}
                className="hidden"
                multiple
                disabled={isLoading}
              />
              <label
                htmlFor="fileUpload"
                className={`flex flex-col items-center justify-center cursor-pointer ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-4">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span className="text-gray-600 font-medium">Click to upload or drag and drop</span>
                <span className="text-gray-500 text-sm mt-1">
                  PDFs, DOCs, CSVs, MP3s, MP4s, and more
                </span>
              </label>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Files to upload ({files.length})
              </h3>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500"
                      disabled={isLoading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {isLoading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-6 text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <Link
              href="/dashboard"
              className="px-6 py-2 border rounded-full mr-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading || title.trim() === '' || files.length === 0}
              className="bg-purple-500 text-white rounded-full px-6 py-2 disabled:bg-purple-300 hover:bg-purple-600 transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Notebook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}