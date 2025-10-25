
import React from 'react';

interface ApiKeySelectorProps {
    onSelectKey: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onSelectKey }) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center text-slate-300 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">API Key Required</h3>
            <p className="mb-4 text-sm">
                To use the video generation feature, you must select an API key. This is required for billing purposes.
            </p>
            <button
                onClick={onSelectKey}
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
                Select API Key
            </button>
            <p className="mt-4 text-xs text-slate-500">
                For more information on billing, please visit the{' '}
                <a
                    href="https://ai.google.dev/gemini-api/docs/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-500 hover:underline"
                >
                    official documentation
                </a>.
            </p>
        </div>
    );
};

export default ApiKeySelector;
