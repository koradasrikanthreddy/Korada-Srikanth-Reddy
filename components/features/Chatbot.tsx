
import React, { useState, useRef, useEffect } from 'react';
import { createChatSession } from '../../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import Loader from '../common/Loader';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface ChatbotProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onShare }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const systemInstruction = "You are a helpful and creative assistant in a comprehensive AI Creative Suite. Be friendly, knowledgeable, and slightly enthusiastic about technology. You are aware of many design fields (e.g., Web Design, Architecture) and their associated artistic styles (e.g., Minimalist, Brutalist).";
        setChat(createChatSession(systemInstruction));
        setMessages([{ role: 'model', text: 'Hello! I am your AI assistant. How can I help you create something amazing today?' }]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, loading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chat || loading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response: GenerateContentResponse = await chat.sendMessage({ message: input });
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleShare = () => {
        const chatText = messages.map(m => `${m.role === 'user' ? 'You' : 'AI Assistant'}: ${m.text}`).join('\n\n');
        onShare({ contentText: chatText, contentType: 'text' });
    };

    return (
        <div className="flex flex-col h-[70vh] bg-slate-900/50 rounded-lg">
            <div className="flex-shrink-0 p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">AI Assistant</h3>
                <button
                    onClick={handleShare}
                    disabled={messages.length <= 1}
                    className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 text-sm disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    <span>Share Chat</span>
                </button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                            {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                         <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
                            <Loader />
                         </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>
            <div className="flex-shrink-0 p-4 border-t border-slate-700">
                <form onSubmit={handleSubmit} className="flex space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-grow bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input.trim()} className="bg-cyan-500 text-white font-bold p-3 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;