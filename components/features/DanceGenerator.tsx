import React, { useState, useEffect, useRef } from 'react';
import { generateVideoFromPrompt, pollVideoOperation } from '../../services/geminiService';
import { DANCE_STYLES, VIDEO_ASPECT_RATIOS, VEO_LOADING_MESSAGES } from '../../constants';
import Loader from '../common/Loader';

interface DanceGeneratorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'video' }) => void;
}

const DanceGenerator: React.FC<DanceGeneratorProps> = ({ onShare }) => {
    // Form Inputs
    const [danceStyle, setDanceStyle] = useState(DANCE_STYLES[0]);
    const [characterDescription, setCharacterDescription] = useState('');
    const [setting, setSetting] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
    
    // Outputs & State
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(VEO_LOADING_MESSAGES[0]);
    const [error, setError] = useState<string | null>(null);

    // Refs
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

    const cleanupPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    };

    const stopLoading = () => {
        setLoading(false);
        if (messageIntervalRef.current) {
            clearInterval(messageIntervalRef.current);
            messageIntervalRef.current = null;
        }
        cleanupPolling();
    };
    
    const handlePolling = (initialOperation: any) => {
        let op = initialOperation;
        pollIntervalRef.current = window.setInterval(async () => {
            try {
                op = await pollVideoOperation(op);
                if (op.done) {
                    const uri = op.response?.generatedVideos?.[0]?.video?.uri;
                    if (uri) {
                        const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
                        const blob = await response.blob();
                        setVideoUrl(URL.createObjectURL(blob));
                    } else {
                        setError('Video generation finished, but no video URL was returned.');
                    }
                    stopLoading();
                }
            } catch (err) {
                stopLoading();
                setError('An error occurred while checking video status.');
                console.error(err);
            }
        }, 10000);
    };
    
    const handleApiError = (err: any) => {
        stopLoading();
        if (err.message?.includes("Requested entity was not found")) {
            setError("An API Key error occurred. Please ensure your key is valid and has billing enabled.");
        } else {
            setError('Failed to start video generation. Please check your prompt and try again.');
        }
        console.error(err);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!characterDescription || !setting) {
            setError('Please describe the character and the setting.');
            return;
        }

        setLoading(true);
        setError(null);
        setVideoUrl(null);
        startLoadingMessages();

        try {
            const fullPrompt = `A high-quality, cinematic video of ${characterDescription} performing a ${danceStyle} dance. The setting is ${setting}. The camera should capture the full body to showcase the dance moves clearly.`;
            // Use high quality for better motion
            const operation = await generateVideoFromPrompt(fullPrompt, aspectRatio, true);
            handlePolling(operation);
        } catch (err: any) {
            handleApiError(err);
        }
    };
    
    return (
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Controls */}
            <form onSubmit={handleSubmit} className="w-full lg:w-1/3 space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Dance Generator Setup</h3>
                <fieldset disabled={loading} className="space-y-4">
                    <div>
                        <label htmlFor="dance-style" className="block text-sm font-medium text-slate-300 mb-2">Dance Style</label>
                        <select
                            id="dance-style"
                            value={danceStyle}
                            onChange={(e) => setDanceStyle(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                        >
                            {DANCE_STYLES.map((style) => <option key={style} value={style}>{style}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="character-desc" className="block text-sm font-medium text-slate-300 mb-2">Character Description</label>
                        <textarea
                            id="character-desc"
                            rows={3}
                            value={characterDescription}
                            onChange={(e) => setCharacterDescription(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                            placeholder="e.g., a robot with neon lights, a ballerina in a futuristic tutu"
                        />
                    </div>
                     <div>
                        <label htmlFor="setting-desc" className="block text-sm font-medium text-slate-300 mb-2">Setting / Background</label>
                        <textarea
                            id="setting-desc"
                            rows={3}
                            value={setting}
                            onChange={(e) => setSetting(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                            placeholder="e.g., on a city street at night, in a grand ballroom"
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
                    <button
                        type="submit"
                        className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                        {loading ? 'Generating...' : 'Generate Dance'}
                    </button>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </fieldset>
            </form>

            {/* Output */}
            <div className="w-full lg:w-2/3 flex items-center justify-center bg-slate-800/50 rounded-lg border border-slate-700 min-h-[400px] md:min-h-0 p-4">
                {loading && <Loader message={loadingMessage} />}
                {!loading && videoUrl && (
                    <div className="text-center space-y-4">
                        <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-[70vh] rounded-lg" />
                        <button
                            onClick={() => onShare({ contentUrl: videoUrl, contentText: `A video of ${characterDescription} doing a ${danceStyle} dance.`, contentType: 'video' })}
                            className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 mx-auto"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                            <span>Share & Promote</span>
                        </button>
                    </div>
                )}
                {!loading && !videoUrl && (
                     <div className="text-center text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 opacity-30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-3.5 4.04l2.12-.89.89-2.12C11.87 4.01 12.83 4.3 13 5.14l2.29 9.14 6.13.43c.9.06 1.34 1.21.69 1.85l-4.63 4.63c-.45.45-1.2.59-1.81.33l-4.5-1.93-4.5 1.93c-.61.26-1.36.12-1.81-.33l-4.63-4.63c-.65-.64-.21-1.79.69-1.85l6.13-.43L11 5.14c.17-.84 1.13-1.13 1.5-.1z"/></svg>
                        <p className="mt-4">Your dance video will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DanceGenerator;