
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToBot, startChat } from '../services/geminiService';
import { MessageCircleIcon, SendIcon, XIcon, BrainCircuitIcon } from './icons';

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if(isOpen) {
            startChat(); // Initialize chat session when opened
             setMessages([{ role: 'model', text: 'Hello! How can I help you optimize your prompt today?' }]);
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await sendMessageToBot(input);
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-cyan-500/80 backdrop-blur-lg text-white rounded-full p-4 shadow-lg hover:bg-cyan-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400 z-50"
                aria-label="Toggle Chatbot"
            >
                {isOpen ? <XIcon className="w-6 h-6" /> : <MessageCircleIcon className="w-6 h-6" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-slate-900/70 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden">
                    <header className="p-4 border-b border-slate-700 flex items-center justify-between">
                        <div className="flex items-center">
                            <BrainCircuitIcon className="w-6 h-6 text-cyan-400 mr-2"/>
                            <h3 className="font-bold text-lg text-white">AI Assistant</h3>
                        </div>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="flex flex-col space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-700 text-slate-200 p-3 rounded-xl">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-700">
                        <div className="flex items-center bg-slate-800 rounded-lg">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask for prompt ideas..."
                                className="flex-1 bg-transparent p-3 text-slate-200 focus:outline-none"
                            />
                            <button onClick={handleSend} disabled={isLoading} className="p-3 text-cyan-400 hover:text-cyan-300 disabled:text-slate-600">
                                <SendIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
