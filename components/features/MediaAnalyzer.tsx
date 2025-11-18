
import React, { useState, useRef } from 'react';
import { analyzeImage, analyzeVideoFrame, transcribeAudio } from '../../services/geminiService';
import { fileToBase64 } from '../../utils';
import Loader from '../common/Loader';
import { GenerateContentResponse } from '@google/genai';

type Mode = 'image' | 'video' | 'audio';

interface MediaAnalyzerProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const MediaAnalyzer: React.FC<MediaAnalyzerProps> = ({ onShare }) => {
    const [mode, setMode] = useState<Mode>('image');
    const [prompt, setPrompt] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [response, setResponse] = useState<GenerateContentResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setPrompt('');
        setFile(null);
        setPreview(null);
        setResponse(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
        resetState();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
        } else if (selectedFile.type.startsWith('video/')) {
            const videoUrl = URL.createObjectURL(selectedFile);
            setPreview(videoUrl);
        } else if (selectedFile.type.startsWith('audio/')) {
             const audioUrl = URL.createObjectURL(selectedFile);
            setPreview(audioUrl);
        }
    };
    
    const captureVideoFrame = (): Promise<{ base64: string, mimeType: string }> => {
        return new Promise((resolve, reject) => {
            if (!preview || mode !== 'video') return reject(new Error("No video preview available"));
            
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            video.src = preview;
            video.onloadeddata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                const base64 = dataUrl.split(',')[1];
                resolve({ base64, mimeType: 'image/jpeg' });
            };
            video.onerror = reject;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || (mode !== 'audio' && !prompt)) {
            setError(`Please upload a${mode === 'audio' ? 'n audio file' : ' file and enter a prompt'}.`);
            return;
        }

        setLoading(true);
        setError(null);
        setResponse(null);
        
        try {
            let result: GenerateContentResponse;
            if (mode === 'image') {
                const base64 = await fileToBase64(file);
                result = await analyzeImage(prompt, base64, file.type);
            } else if (mode === 'video') {
                const { base64, mimeType } = await captureVideoFrame();
                result = await analyzeVideoFrame(prompt, base64, mimeType);
            } else { // audio
                 const base64 = await fileToBase64(file);
                 result = await transcribeAudio(base64, file.type);
            }
            setResponse(result);
        } catch (err) {
            setError(`Failed to analyze ${mode}. Please try again.`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getAcceptType = () => {
        if (mode === 'image') return 'image/*';
        if (mode === 'video') return 'video/*';
        return 'audio/*';
    };

    return (
        <div className="space-y-6">
             <div className="flex bg-slate-700 rounded-lg p-1 max-w-sm mx-auto">
                 <button onClick={() => handleModeChange('image')} className={`w-1/3 p-2 rounded-md text-sm font-semibold transition ${mode === 'image' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Image</button>
                 <button onClick={() => handleModeChange('video')} className={`w-1/3 p-2 rounded-md text-sm font-semibold transition ${mode === 'video' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Video</button>
                 <button onClick={() => handleModeChange('audio')} className={`w-1/3 p-2 rounded-md text-sm font-semibold transition ${mode === 'audio' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Audio</button>
             </div>
             
             <div className="flex flex-col md:flex-row gap-8">
                <form onSubmit={handleSubmit} className="w-full md:w-1/2 lg:w-1/3 space-y-4">
                     <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept={getAcceptType()}
                          className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                        />
                     </div>
                     {preview && (
                         <div className="p-4 bg-slate-900/50 rounded-lg">
                             {mode === 'image' && <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg"/>}
                             {mode === 'video' && <video src={preview} controls className="max-h-40 mx-auto rounded-lg"/>}
                             {mode === 'audio' && <audio src={preview} controls className="w-full"/>}
                         </div>
                     )}
                     
                    {mode !== 'audio' && (
                        <textarea
                            rows={3}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            placeholder={mode === 'image' ? "What's in this image?" : "What's happening in this video?"}
                        />
                    )}
                    
                    <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300">
                        {loading ? `Analyzing ${mode}...` : `Analyze ${mode}`}
                    </button>
                     {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </form>

                <div className="w-full md:w-1/2 lg:w-2/3 min-h-[300px] bg-slate-900/50 rounded-lg p-6 prose prose-invert prose-p:text-slate-300 max-w-none relative">
                    {loading && <Loader message={`Thinking about the ${mode}...`} />}
                    {!loading && !response && <p className="text-slate-500 text-center pt-10">Analysis will appear here.</p>}
                    {response && (
                        <>
                            <div className="absolute top-6 right-6 not-prose">
                                <button
                                    onClick={() => onShare({ contentText: response.text, contentType: 'text' })}
                                    className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                    </svg>
                                    <span>Share</span>
                                </button>
                            </div>
                            <p>{response.text}</p>
                        </>
                    )}
                </div>
             </div>
        </div>
    );
};

export default MediaAnalyzer;
