import React, { useState, useEffect, useRef } from 'react';
import { generateVideoFromPrompt, generateVideoFromImage, pollVideoOperation } from '../../services/geminiService';
import { VIDEO_ASPECT_RATIOS, VEO_LOADING_MESSAGES } from '../../constants';
import { fileToBase64 } from '../../utils';
import ImageUploader from '../common/ImageUploader';
import Loader from '../common/Loader';


type Mode = 'text-to-video' | 'image-to-video';

interface VideoGeneratorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'video' }) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onShare }) => {
    const [mode, setMode] = useState<Mode>('text-to-video');
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [isHighQuality, setIsHighQuality] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(VEO_LOADING_MESSAGES[0]);
    const [error, setError] = useState<string | null>(null);
    const pollIntervalRef = useRef<number | null>(null);
    const messageIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
        };
    }, []);

    const startLoadingMessages = () => {
        let i = 0;
        setLoadingMessage(VEO_LOADING_MESSAGES[0]);
        messageIntervalRef.current = window.setInterval(() => {
            i = (i + 1) % VEO_LOADING_MESSAGES.length;
            setLoadingMessage(VEO_LOADING_MESSAGES[i]);
        }, 3000);
    };

    const stopLoadingMessages = () => {
        if (messageIntervalRef.current) {
            clearInterval(messageIntervalRef.current);
            messageIntervalRef.current = null;
        }
    };
    
    const cleanupPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    };

    const handlePolling = (initialOperation: any) => {
        let op = initialOperation;
        pollIntervalRef.current = window.setInterval(async () => {
            try {
                op = await pollVideoOperation(op);
                if (op.done) {
                    cleanupPolling();
                    stopLoadingMessages();
                    setLoading(false);
                    const uri = op.response?.generatedVideos?.[0]?.video?.uri;
                    if (uri) {
                        const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
                        const blob = await response.blob();
                        setVideoUrl(URL.createObjectURL(blob));
                    } else {
                        setError('Video generation finished, but no video URL was returned.');
                    }
                }
            } catch (err) {
                cleanupPolling();
                stopLoadingMessages();
                setLoading(false);
                setError('An error occurred while checking video status.');
                console.error(err);
            }
        }, 10000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === 'image-to-video' && !imageFile) {
            setError('Please upload an image for image-to-video mode.');
            return;
        }
        if (mode === 'text-to-video' && !prompt) {
            setError('Please enter a prompt.');
            return;
        }

        setLoading(true);
        setError(null);
        setVideoUrl(null);
        startLoadingMessages();

        try {
            let operation: any;
            if (mode === 'image-to-video' && imageFile) {
                const imageBase64 = await fileToBase64(imageFile);
                operation = await generateVideoFromImage(prompt, imageBase64, imageFile.type, aspectRatio, isHighQuality);
            } else {
                operation = await generateVideoFromPrompt(prompt, aspectRatio, isHighQuality);
            }
            handlePolling(operation);
        } catch (err: any) {
            stopLoadingMessages();
            setLoading(false);
            if(err.message?.includes("Requested entity was not found")) {
                setError("An API Key error occurred. Please ensure your key is valid and has billing enabled.");
            } else {
                setError('Failed to start video generation. Please check your prompt and try again.');
            }
            console.error(err);
        }
    };
    
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <form onSubmit={handleSubmit} className="w-full md:w-1/3 space-y-6">
                 <div>
                    <div className="flex bg-slate-700 rounded-lg p-1">
                        <button type="button" onClick={() => { setMode('text-to-video'); setImageFile(null); }} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition ${mode === 'text-to-video' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Text to Video</button>
                        <button type="button" onClick={() => setMode('image-to-video')} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition ${mode === 'image-to-video' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Image to Video</button>
                    </div>
                </div>

                {mode === 'image-to-video' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Source Image</label>
                        <ImageUploader onImageUpload={setImageFile} onImageClear={() => setImageFile(null)} />
                    </div>
                )}
               
                <div>
                    <label htmlFor="prompt-vid" className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
                    <textarea
                        id="prompt-vid"
                        rows={4}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        placeholder={mode === 'image-to-video' ? "e.g., Make the clouds move (optional)" : "e.g., A neon hologram of a cat driving fast"}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-2 gap-2">
                        {VIDEO_ASPECT_RATIOS.map((ratio) => (
                            <button
                                key={ratio}
                                type="button"
                                onClick={() => setAspectRatio(ratio as '16:9' | '9:16')}
                                className={`p-2 rounded-lg border text-sm transition ${aspectRatio === ratio ? 'bg-cyan-500 border-cyan-500 text-white font-bold' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                            >
                                {ratio === '16:9' ? 'Landscape' : 'Portrait'} ({ratio})
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Quality</label>
                    <div className="flex items-center justify-between bg-slate-700 rounded-lg p-2">
                        <span className="text-slate-400 text-sm flex-1 text-center">Standard (Fast)</span>
                        <label className="relative inline-flex items-center cursor-pointer mx-4">
                            <input type="checkbox" checked={isHighQuality} onChange={() => setIsHighQuality(!isHighQuality)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                        <span className="text-slate-300 text-sm flex-1 text-center">High Quality (Slower)</span>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
                >
                    {loading ? 'Generating Video...' : 'Generate Video'}
                </button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>

            <div className="w-full md:w-2/3 flex items-center justify-center bg-slate-800/50 rounded-lg border border-slate-700 min-h-[300px] md:min-h-0 p-4">
                {loading && <Loader message={loadingMessage} />}
                {!loading && videoUrl && (
                    <div className="text-center">
                        <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-[60vh] rounded-lg" />
                        <div className="mt-4">
                            <button
                                onClick={() => onShare({ contentUrl: videoUrl, contentText: prompt, contentType: 'video' })}
                                className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                                <span>Share & Promote</span>
                            </button>
                        </div>
                    </div>
                )}
                {!loading && !videoUrl && <p className="text-slate-500">Your generated video will appear here</p>}
            </div>
        </div>
    );
};

export default VideoGenerator;