import React, { useState } from 'react';
import { generateImage } from '../../services/geminiService';
import { ASPECT_RATIOS, AVATAR_HAIR_COLORS, AVATAR_EYE_COLORS, AVATAR_CLOTHING_STYLES, AVATAR_EXPRESSIONS } from '../../constants';
import Loader from '../common/Loader';

interface AvatarGeneratorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'image' }) => void;
}

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({ onShare }) => {
    const [prompt, setPrompt] = useState('');
    const [hairColor, setHairColor] = useState(AVATAR_HAIR_COLORS[0]);
    const [eyeColor, setEyeColor] = useState(AVATAR_EYE_COLORS[0]);
    const [clothingStyle, setClothingStyle] = useState(AVATAR_CLOTHING_STYLES[0]);
    const [expression, setExpression] = useState(AVATAR_EXPRESSIONS[0]);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) {
            setError('Please describe the character you want to create.');
            return;
        }
        setLoading(true);
        setError(null);
        setImage(null);
        try {
            let fullPrompt = `A high-quality, digital art headshot avatar of ${prompt}.`;
            
            const attributes = [
                hairColor !== 'any color' && `${hairColor} hair`,
                eyeColor !== 'any color' && `${eyeColor} eyes`,
                clothingStyle !== 'any style' && `wearing ${clothingStyle}`,
                expression !== 'neutral' && `with a ${expression} expression`,
            ].filter(Boolean).join(', ');

            if (attributes) {
                fullPrompt += ` The character has ${attributes}.`;
            }
            
            const imageBytes = await generateImage(fullPrompt, aspectRatio);
            setImage(`data:image/jpeg;base64,${imageBytes}`);
        } catch (err) {
            setError('Failed to generate avatar. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <form onSubmit={handleSubmit} className="w-full md:w-1/3 space-y-6">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Character Description</label>
                    <textarea
                        id="prompt"
                        rows={3}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        placeholder="e.g., a wise owl wizard, a female cyberpunk hacker"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="hairColor" className="block text-sm font-medium text-slate-300 mb-2">Hair Color</label>
                        <select
                            id="hairColor"
                            value={hairColor}
                            onChange={(e) => setHairColor(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                        >
                            {AVATAR_HAIR_COLORS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="eyeColor" className="block text-sm font-medium text-slate-300 mb-2">Eye Color</label>
                        <select
                            id="eyeColor"
                            value={eyeColor}
                            onChange={(e) => setEyeColor(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                        >
                            {AVATAR_EYE_COLORS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="clothingStyle" className="block text-sm font-medium text-slate-300 mb-2">Clothing Style</label>
                    <select
                        id="clothingStyle"
                        value={clothingStyle}
                        onChange={(e) => setClothingStyle(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                    >
                        {AVATAR_CLOTHING_STYLES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                </div>

                 <div>
                    <label htmlFor="expression" className="block text-sm font-medium text-slate-300 mb-2">Expression</label>
                    <select
                        id="expression"
                        value={expression}
                        onChange={(e) => setExpression(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                    >
                        {AVATAR_EXPRESSIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-5 gap-2">
                        {ASPECT_RATIOS.map((ratio) => (
                            <button
                                key={ratio}
                                type="button"
                                onClick={() => setAspectRatio(ratio)}
                                className={`p-2 rounded-lg border text-sm transition ${aspectRatio === ratio ? 'bg-cyan-500 border-cyan-500 text-white font-bold' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center"
                >
                    {loading ? 'Generating...' : 'Generate Avatar'}
                </button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>

            <div className="w-full md:w-2/3 flex items-center justify-center bg-slate-800/50 rounded-lg border border-slate-700 min-h-[300px] md:min-h-0 p-4">
                {loading && <Loader message="Creating your avatar..." />}
                {!loading && image && (
                    <div className="text-center">
                        <img src={image} alt="Generated Avatar" className="max-w-full max-h-[60vh] rounded-lg object-contain" />
                        <div className="mt-4">
                            <button
                                onClick={() => onShare({ contentUrl: image, contentText: prompt, contentType: 'image' })}
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
                {!loading && !image && <p className="text-slate-500">Your generated avatar will appear here</p>}
            </div>
        </div>
    );
};

export default AvatarGenerator;