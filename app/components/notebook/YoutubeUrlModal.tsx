"use client";

import { useState } from 'react';

interface YoutubeUrlModalProps {
  onUpload: (url: string) => void;
  onBack: () => void;
}

export default function YoutubeUrlModal({ onUpload, onBack }: YoutubeUrlModalProps) {
  const [url, setUrl] = useState<string>('');

  const handleSubmit = () => {
    if (url.trim()) {
      onUpload(url);
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
          <h2 className="text-xl font-semibold">YouTube URL</h2>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-gray-600 mb-4">
          Paste in a YouTube URL below to upload as a source in NotebookLM
        </p>
        
        <div className="mb-4">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </div>
            <input
              type="url"
              className="flex-1 p-3 focus:outline-none"
              placeholder="Paste YouTube URL*"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          
          <ul className="list-disc pl-6 text-sm text-gray-600 mt-4">
            <li>Only the text transcript will be imported at this moment</li>
            <li>Only public YouTube videos are supported</li>
            <li>Recently uploaded videos may not be available to import</li>
            <li>If upload fails, <a href="#" className="text-blue-500">learn more</a> for common reasons</li>
          </ul>
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={onBack}
            className="mr-2 px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!url.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            Insert
          </button>
        </div>
      </div>
    </>
  );
}
