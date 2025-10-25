
import React, { useState, useCallback } from 'react';
import { ActiveTab, AspectRatio, Style, VideoAspectRatio } from '../types';
import { SparklesIcon, SlidersHorizontalIcon, AspectRatioIcon } from './icons';
import ApiKeySelector from './ApiKeySelector';

// Helper to read file as Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};


interface ControlPanelProps {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
    onGenerateImage: (params: { prompt: string; negativePrompt: string; style: Style; numberOfImages: number; aspectRatio: AspectRatio; }) => void;
    onGenerateVideo: (params: { prompt: string; imageBase64: string; mimeType: string; aspectRatio: VideoAspectRatio; }) => void;
    isLoading: boolean;
    isApiKeySelected: boolean;
    onSelectApiKey: () => void;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 rounded-t-lg text-sm font-medium transition-colors focus:outline-none ${
            active
                ? 'bg-slate-800/60 border-b-2 border-cyan-400 text-white'
                : 'bg-transparent text-slate-400 hover:bg-slate-800/30'
        }`}
    >
        {children}
    </button>
);

const ControlPanel: React.FC<ControlPanelProps> = ({
    activeTab,
    setActiveTab,
    onGenerateImage,
    onGenerateVideo,
    isLoading,
    isApiKeySelected,
    onSelectApiKey
}) => {
    const [prompt, setPrompt] = useState<string>("A majestic lion wearing a crown, cinematic lighting");
    const [negativePrompt, setNegativePrompt] = useState<string>("blurry, text, watermark");
    const [style, setStyle] = useState<Style>("Realistic");
    const [numberOfImages, setNumberOfImages] = useState<number>(1);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
    
    const [videoPrompt, setVideoPrompt] = useState<string>("The lion slowly opens its eyes, and a magical glow emanates from the crown.");
    const [videoAspectRatio, setVideoAspectRatio] = useState<VideoAspectRatio>("16:9");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setUploadError("File size exceeds 4MB. Please choose a smaller image.");
                setUploadedFile(null);
                setUploadedFilePreview(null);
                return;
            }
            setUploadedFile(file);
            setUploadedFilePreview(URL.createObjectURL(file));
            setUploadError(null);
        }
    };

    const handleImageSubmit = useCallback(() => {
        if (!prompt || isLoading) return;
        onGenerateImage({ prompt, negativePrompt, style, numberOfImages, aspectRatio });
    }, [prompt, negativePrompt, style, numberOfImages, aspectRatio, isLoading, onGenerateImage]);

    const handleVideoSubmit = useCallback(async () => {
        if (!videoPrompt || !uploadedFile || isLoading) return;
        try {
            const imageBase64 = await fileToBase64(uploadedFile);
            onGenerateVideo({ prompt: videoPrompt, imageBase64, mimeType: uploadedFile.type, aspectRatio: videoAspectRatio });
        } catch (error) {
            setUploadError("Could not process the image file. Please try another one.");
            console.error(error);
        }
    }, [videoPrompt, uploadedFile, videoAspectRatio, isLoading, onGenerateVideo]);

    return (
        <div className="w-full lg:w-[400px] bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-1 lg:p-2 flex flex-col h-full">
             <div className="flex border-b border-slate-800">
                <TabButton active={activeTab === 'generate'} onClick={() => setActiveTab('generate')}>Generate Image</TabButton>
                <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')}>Generate Video</TabButton>
            </div>
            
            <div className="p-4 md:p-6 flex-grow overflow-y-auto">
                {activeTab === 'generate' && (
                    <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="A majestic lion wearing a crown, cinematic lighting..."
                                className="w-full h-28 bg-slate-800 border border-slate-700 text-slate-200 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Negative Prompt</label>
                            <input
                                type="text"
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder="e.g., blurry, text, watermark"
                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-medium text-slate-300 mb-2"><SparklesIcon className="w-4 h-4 mr-2" />Style</label>
                            <select value={style} onChange={(e) => setStyle(e.target.value as Style)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition">
                                <option>Realistic</option>
                                <option>Anime</option>
                                <option>Cyberpunk</option>
                                <option>Noir</option>
                                <option>Documentary</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center text-sm font-medium text-slate-300 mb-2"><SlidersHorizontalIcon className="w-4 h-4 mr-2" />Number of Images</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="4"
                                    value={numberOfImages}
                                    onChange={(e) => setNumberOfImages(parseInt(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-slate-300 mb-2"><AspectRatioIcon className="w-4 h-4 mr-2" />Aspect Ratio</label>
                                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition">
                                    <option value="1:1">1:1 (Square)</option>
                                    <option value="16:9">16:9 (Landscape)</option>
                                    <option value="9:16">9:16 (Portrait)</option>
                                    <option value="4:3">4:3 (Standard)</option>
                                    <option value="3:4">3:4 (Tall)</option>
                                </select>
                            </div>
                        </div>
                         <button onClick={handleImageSubmit} disabled={isLoading || !prompt} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                             {isLoading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                )}
                {activeTab === 'video' && (
                     <div className="space-y-6">
                        {!isApiKeySelected ? (
                            <ApiKeySelector onSelectKey={onSelectApiKey} />
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Upload Starting Image</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-700 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            {uploadedFilePreview ? (
                                                <img src={uploadedFilePreview} alt="Preview" className="mx-auto h-24 w-auto rounded-md" />
                                            ) : (
                                                <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            )}
                                            <div className="flex text-sm text-slate-400">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-cyan-400 hover:text-cyan-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 focus-within:ring-cyan-500 px-1">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 4MB</p>
                                        </div>
                                    </div>
                                    {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Video Prompt</label>
                                    <textarea
                                        value={videoPrompt}
                                        onChange={(e) => setVideoPrompt(e.target.value)}
                                        placeholder="Describe what happens next..."
                                        className="w-full h-28 bg-slate-800 border border-slate-700 text-slate-200 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center text-sm font-medium text-slate-300 mb-2"><AspectRatioIcon className="w-4 h-4 mr-2" />Aspect Ratio</label>
                                    <select value={videoAspectRatio} onChange={(e) => setVideoAspectRatio(e.target.value as VideoAspectRatio)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition">
                                        <option value="16:9">16:9 (Landscape)</option>
                                        <option value="9:16">9:16 (Portrait)</option>
                                    </select>
                                </div>
                                 <button onClick={handleVideoSubmit} disabled={isLoading || !videoPrompt || !uploadedFile} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                                    {isLoading ? 'Generating Video...' : 'Generate Video'}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ControlPanel;
