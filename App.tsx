import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { KeySelector } from './components/KeySelector';
import { generateMemoryVideo } from './services/geminiService';
import { AspectRatio, LOADING_MESSAGES, VideoGenerationState, AIStudio } from './types';

const App: React.FC = () => {
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("Animate this photo so it’s like a live memory");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  
  const [genState, setGenState] = useState<VideoGenerationState>({ status: 'idle' });
  const loadingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for API key presence
    const checkKey = async () => {
      const aistudio = (window as any).aistudio as AIStudio | undefined;
      if (aistudio && await aistudio.hasSelectedApiKey()) {
        setApiKeySelected(true);
      }
    };
    checkKey();
  }, []);

  const handleKeySelection = async () => {
    try {
      const aistudio = (window as any).aistudio as AIStudio | undefined;
      if (aistudio) {
        await aistudio.openSelectKey();
        // Assume success if no error, as per strict rules
        setApiKeySelected(true);
      }
    } catch (e) {
      console.error("Key selection failed", e);
      // Reset state if needed, but per rules, assume success on flow completion
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Reset generation state
      setGenState({ status: 'idle' });
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setGenState({ status: 'generating', progressMessage: LOADING_MESSAGES[0] });

    // Cycle through loading messages
    let msgIndex = 0;
    loadingIntervalRef.current = window.setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
      setGenState(prev => ({ ...prev, progressMessage: LOADING_MESSAGES[msgIndex] }));
    }, 4000);

    try {
      const videoUrl = await generateMemoryVideo(selectedFile, prompt, aspectRatio);
      setGenState({ status: 'completed', videoUrl });
    } catch (error: any) {
      setGenState({ status: 'error', error: error.message });
    } finally {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setGenState({ status: 'idle' });
    setPrompt("Animate this photo so it’s like a live memory");
  };

  if (!apiKeySelected) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <KeySelector onSelect={handleKeySelection} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
        
        {/* Intro */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">New Memory</h2>
          <p className="text-gray-600 text-lg">
            Create a living moment from your static photos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: INPUT */}
          <div className="space-y-6">
            
            {/* Image Uploader */}
            <div className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 relative overflow-hidden group
              ${!selectedFile ? 'border-gray-200 hover:border-[#2A9CA2] bg-gray-50 hover:bg-white cursor-pointer' : 'border-[#2A9CA2] bg-white'}
            `}>
              {!selectedFile ? (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center py-10">
                  <div className="w-16 h-16 bg-[#2A9CA2]/10 text-[#2A9CA2] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium text-lg">Tap to upload photo</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              ) : (
                <div className="relative group">
                   <img 
                    src={previewUrl!} 
                    alt="Preview" 
                    className="w-full h-auto max-h-[400px] object-contain rounded-lg shadow-sm"
                  />
                  <button 
                    onClick={handleReset}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors"
                    title="Remove image"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Controls */}
            {selectedFile && genState.status !== 'generating' && (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6 animate-fade-in-up">
                
                {/* Prompt Section - mimicking "Praise" styling */}
                <div>
                  <label className="block text-sm font-bold text-[#2A9CA2] mb-2 uppercase tracking-wide">
                    Memory Description
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2A9CA2] focus:border-[#2A9CA2] outline-none resize-none h-24 text-gray-800 bg-gray-50"
                    placeholder="Describe how the memory should move..."
                  />
                </div>

                {/* Aspect Ratio Section - mimicking filter active icons */}
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Format</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setAspectRatio('16:9')}
                      className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all font-medium ${
                        aspectRatio === '16:9' 
                          ? 'bg-[#2A9CA2] text-white shadow-md' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className="w-6 h-3 border-2 border-current rounded-sm"></div>
                      <span>Landscape</span>
                    </button>
                    <button
                      onClick={() => setAspectRatio('9:16')}
                      className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all font-medium ${
                        aspectRatio === '9:16' 
                          ? 'bg-[#2A9CA2] text-white shadow-md' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className="w-3 h-5 border-2 border-current rounded-sm"></div>
                      <span>Portrait</span>
                    </button>
                  </div>
                </div>

                {/* Generate Button - The "Accent" New Memory button */}
                <button
                  onClick={handleGenerate}
                  className="w-full py-4 bg-[#8F2881] hover:bg-[#7a226e] text-white rounded-full font-bold text-lg shadow-lg shadow-purple-200 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                  Create Memory
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: OUTPUT */}
          <div className="space-y-6">
            
            {genState.status === 'idle' && !selectedFile && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-xl p-8 bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 mb-4 opacity-50">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <p>Your animated memory will appear here</p>
              </div>
            )}

            {genState.status === 'generating' && (
              <div className="h-full min-h-[400px] bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col items-center justify-center p-12 text-center">
                 <div className="relative w-20 h-20 mb-8">
                   <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-[#2A9CA2] border-t-transparent rounded-full animate-spin"></div>
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">Generating Video</h3>
                 <p className="text-[#2A9CA2] animate-pulse font-medium">{genState.progressMessage}</p>
                 <p className="text-xs text-gray-400 mt-8 max-w-xs">This process involves complex rendering and may take a minute or two.</p>
              </div>
            )}

            {genState.status === 'completed' && genState.videoUrl && (
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up">
                <div className="relative bg-black aspect-video flex items-center justify-center">
                   <video 
                    src={genState.videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className={`w-full h-full object-contain ${aspectRatio === '9:16' ? 'max-h-[600px]' : ''}`}
                  />
                </div>
                <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                     <h3 className="font-bold text-gray-900">Memory Generated</h3>
                     <p className="text-sm text-gray-500">Video ready for download</p>
                  </div>
                  <a 
                    href={genState.videoUrl} 
                    download="live-memory.mp4"
                    className="px-6 py-2 bg-[#588F28] hover:bg-[#4a7a21] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 12.75l-3-3m0 0 3-3m-3 3h7.5" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            )}

            {genState.status === 'error' && (
               <div className="bg-red-50 rounded-xl border border-red-200 p-8 text-center">
                 <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                 </div>
                 <h3 className="text-lg font-bold text-red-800 mb-2">Generation Failed</h3>
                 <p className="text-red-600 mb-6">{genState.error}</p>
                 <button 
                   onClick={() => setGenState({ status: 'idle' })}
                   className="text-sm font-semibold text-red-700 hover:underline"
                 >
                   Try Again
                 </button>
               </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;