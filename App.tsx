
import React, { useState, useEffect, useCallback } from 'react';
import { Operation } from "@google/genai";
import ControlPanel from './components/ControlPanel';
import DisplayArea from './components/DisplayArea';
import Chatbot from './components/Chatbot';
import { BrainCircuitIcon } from './components/icons';
import { generateImage, generateVideo, checkVideoStatus, fetchVideo } from './services/geminiService';
import { ActiveTab, AspectRatio, Style, VideoAspectRatio } from './types';

// Extend the Window interface to include aistudio property
// FIX: Defined an AIStudio interface to resolve the TypeScript error with subsequent property declarations.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const VIDEO_LOADING_MESSAGES = [
    "Warming up the AI director...",
    "Choreographing the pixels...",
    "Setting up the virtual cameras...",
    "Rendering cinematic magic...",
    "Applying digital makeup...",
    "Final touches on the masterpiece...",
    "This can take a few minutes...",
];

function App() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('generate');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isApiKeySelected, setIsApiKeySelected] = useState<boolean>(false);
    
    const checkApiKey = useCallback(async () => {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsApiKeySelected(hasKey);
        } else {
             // Fallback for environments where aistudio is not available
            console.warn("aistudio not found. Assuming API key is set via environment variables.");
            setIsApiKeySelected(true);
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const handleSelectApiKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            // Optimistically assume the user selected a key.
            // A failed API call will reset this if needed.
            setIsApiKeySelected(true);
        }
    };

    const handleGenerateImage = useCallback(async (params: { prompt: string; negativePrompt: string; style: Style; numberOfImages: number; aspectRatio: AspectRatio; }) => {
        setIsLoading(true);
        setGeneratedImages([]);
        setGeneratedVideoUrl(null);
        setError(null);
        setLoadingMessage('Conjuring images from the digital ether...');
        
        try {
            const images = await generateImage(params.prompt, params.negativePrompt, params.style, params.numberOfImages, params.aspectRatio);
            setGeneratedImages(images);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const pollVideoStatus = useCallback(async (operation: Operation) => {
        let currentOperation = operation;
        let messageIndex = 0;

        const intervalId = setInterval(() => {
            setLoadingMessage(VIDEO_LOADING_MESSAGES[messageIndex]);
            messageIndex = (messageIndex + 1) % VIDEO_LOADING_MESSAGES.length;
        }, 5000);

        while (!currentOperation.done) {
            try {
                await new Promise(resolve => setTimeout(resolve, 10000));
                currentOperation = await checkVideoStatus(currentOperation);
            } catch (e) {
                clearInterval(intervalId);
                const errorMessage = e instanceof Error ? e.message : 'Failed to check video status.';
                if (errorMessage.includes("Requested entity was not found")) {
                    setError("API Key is invalid or not found. Please select a valid API key.");
                    setIsApiKeySelected(false);
                } else {
                    setError(errorMessage);
                }
                setIsLoading(false);
                return;
            }
        }

        clearInterval(intervalId);

        const videoUri = currentOperation.response?.generatedVideos?.[0]?.video?.uri;
        if (videoUri) {
            setLoadingMessage('Fetching your masterpiece...');
            try {
                const url = await fetchVideo(videoUri);
                setGeneratedVideoUrl(url);
            } catch (e) {
                 setError(e instanceof Error ? e.message : 'Failed to download the generated video.');
            }
        } else {
            setError('Video generation completed, but no video URL was returned.');
        }
        setIsLoading(false);

    }, []);

    const handleGenerateVideo = useCallback(async (params: { prompt: string; imageBase64: string; mimeType: string; aspectRatio: VideoAspectRatio; }) => {
        setIsLoading(true);
        setGeneratedImages([]);
        setGeneratedVideoUrl(null);
        setError(null);
        setLoadingMessage(VIDEO_LOADING_MESSAGES[0]);

        try {
            const initialOperation = await generateVideo(params.prompt, params.imageBase64, params.mimeType, params.aspectRatio);
            await pollVideoStatus(initialOperation);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during video generation.';
             if (errorMessage.includes("Requested entity was not found")) {
                setError("API Key is invalid or not found. Please select a valid API key and try again.");
                setIsApiKeySelected(false);
            } else {
                setError(errorMessage);
            }
            setIsLoading(false);
        }
    }, [pollVideoStatus]);
    
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col p-4">
            <header className="text-center mb-4 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-wider flex items-center justify-center">
                    <span className="text-cyan-400">TEOMWEXER</span>
                    <BrainCircuitIcon className="w-8 h-8 mx-2 text-blue-500"/>
                    <span className="text-white">AI Generator</span>
                </h1>
            </header>

            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md relative mb-4 max-w-4xl mx-auto w-full" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                        <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </span>
                </div>
            )}
            
            <main className="flex-grow flex flex-col lg:flex-row gap-4 lg:gap-8">
                <ControlPanel 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onGenerateImage={handleGenerateImage}
                    onGenerateVideo={handleGenerateVideo}
                    isLoading={isLoading}
                    isApiKeySelected={isApiKeySelected}
                    onSelectApiKey={handleSelectApiKey}
                />
                <DisplayArea 
                    images={generatedImages}
                    videoUrl={generatedVideoUrl}
                    isLoading={isLoading}
                    loadingMessage={loadingMessage}
                />
            </main>

            <Chatbot />
        </div>
    );
}

export default App;
