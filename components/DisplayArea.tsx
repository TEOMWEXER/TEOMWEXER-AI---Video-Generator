
import React from 'react';

interface DisplayAreaProps {
    images: string[];
    videoUrl: string | null;
    isLoading: boolean;
    loadingMessage: string;
}

const Loader: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg text-slate-300">Generating...</p>
        <p className="text-sm">{message}</p>
    </div>
);

const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
        <h2 className="text-2xl font-bold text-slate-200">Your creations will appear here</h2>
        <p className="mt-2">Enter a prompt and click 'Generate' to start.</p>
    </div>
);

const DisplayArea: React.FC<DisplayAreaProps> = ({ images, videoUrl, isLoading, loadingMessage }) => {
    const hasContent = images.length > 0 || videoUrl;

    return (
        <div className="flex-1 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4 lg:p-8 flex items-center justify-center">
            {isLoading ? (
                <Loader message={loadingMessage} />
            ) : hasContent ? (
                <div className="w-full h-full overflow-auto">
                    {videoUrl ? (
                         <video
                            src={videoUrl}
                            controls
                            autoPlay
                            loop
                            className="max-w-full max-h-full mx-auto rounded-lg shadow-2xl shadow-cyan-500/10"
                        />
                    ) : (
                         <div className={`grid gap-4 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {images.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`Generated creation ${index + 1}`}
                                    className="rounded-lg shadow-lg w-full h-auto object-contain"
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <InitialState />
            )}
        </div>
    );
};

export default DisplayArea;
