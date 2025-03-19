"use client";

import { useState } from 'react';

interface PasteTextModalProps {
  onUpload: (text: string) => void;
  onBack: () => void;
}

export default function PasteTextModal({ onUpload, onBack }: PasteTextModalProps) {
  const [text, setText] = useState<string>('');

  const handleSubmit = () => {
    if (text.trim()) {
      onUpload(text);
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
          <h2 className="text-xl font-semibold">Paste copied text</h2>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-gray-600 mb-4">
          Paste your copied text below to upload as a source in NotebookLM
        </p>
        
        <textarea
          className="w-full h-48 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste text here*"
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={onBack}
            className="mr-2 px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            Insert
          </button>
        </div>
      </div>
    </>
  );
}
