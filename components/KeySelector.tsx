import React from 'react';

interface KeySelectorProps {
  onSelect: () => void;
}

export const KeySelector: React.FC<KeySelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
        <div className="w-16 h-16 bg-[#2A9CA2]/10 text-[#2A9CA2] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          To generate high-quality videos with Veo, you need to connect a paid Google Cloud Project with the Gemini API enabled.
        </p>
        <button
          onClick={onSelect}
          className="w-full py-3 px-6 bg-[#8F2881] hover:bg-[#7a226e] text-white rounded-lg font-medium transition-all transform active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Select API Key</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
        <div className="mt-6 text-xs text-gray-400">
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline hover:text-[#2A9CA2]"
          >
            Learn about Gemini API billing
          </a>
        </div>
      </div>
    </div>
  );
};