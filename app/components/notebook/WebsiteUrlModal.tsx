"use client";

import { useState } from 'react';

interface WebsiteUrlModalProps {
  onUpload: (url: string) => void;
  onBack: () => void;
}

export default function WebsiteUrlModal({ onUpload, onBack }: WebsiteUrlModalProps) {
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
          <h2 className="text-xl font-semibold">Website URL</h2>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-gray-600 mb-4">
          Paste in a Web URL below to upload as a source in NotebookLM.
        </p>
        
        <div className="mb-4">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
            <input
              type="url"
              className="flex-1 p-3 focus:outline-none"
              placeholder="Paste URL*"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          
          <ul className="list-disc pl-6 text-sm text-gray-600 mt-4">
            <li>Only the visible text on the website will be imported at this moment</li>
            <li>Paid articles are not supported</li>
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
