
import React, { useState } from 'react';
import { editImage } from '../../services/geminiService';
import ImageUploader from '../common/ImageUploader';
import { fileToBase64 } from '../../utils';
import Loader from '../common/Loader';
import { IMAGE_EDIT_SUGGESTIONS } from '../../constants';

interface ImageEditorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'image' }) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onShare }) => {
    const [prompt, setPrompt] = useState('');
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt || !originalImage) {
            setError('Please upload an image and provide an editing instruction.');
            return;
        }
        setLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const imageBase64 = await fileToBase64(originalImage);
            const resultBase64 = await editImage(prompt, imageBase64, originalImage.type);
            if (resultBase64) {
                setEditedImage(`data:image/png;base64,${resultBase64}`);
            } else {
                throw new Error("The model did not return an image.");
            }
        } catch (err) {
            setError('Failed to edit image. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (file: File) => {
        setOriginalImage(file);
        setEditedImage(null); // Clear previous edit
        setError(null);
    };

    const handleImageClear = () => {
        setOriginalImage(null);
        setEditedImage(null);
        setError(null);
        setPrompt('');
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Original Image */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-center text-slate-300">Original</h3>
                    <ImageUploader 
                        onImageUpload={handleImageUpload}
                        onImageClear={handleImageClear} 
                    />
                </div>
                
                {/* Edited Image */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-center text-slate-300">Edited</h3>
                    <div className="w-full h-full relative bg-slate-900/50 border border-slate-700 rounded-lg p-6 text-center flex items-center justify-center min-h-[300px] aspect-square">
                        {loading && <Loader message="The AI is working its magic..." />}
                        {!loading && editedImage && (
                            <div className="text-center group">
                                <img src={editedImage} alt="Edited" className="max-w-full max-h-[60vh] rounded-lg object-contain" />
                                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onShare({ contentUrl: editedImage, contentText: prompt, contentType: 'image' })}
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
                        {!loading && !editedImage && <p className="text-slate-500">Your edited image will appear here</p>}
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                        <div>
                            <label htmlFor="edit-prompt" className="block text-sm font-medium text-slate-300 mb-2">Editing Instructions</label>
                            <textarea
                                id="edit-prompt"
                                rows={5}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition"
                                placeholder="e.g., Add a retro filter, or remove the person in the background"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Suggestions</label>
                            <div className="flex flex-wrap gap-2">
                                {IMAGE_EDIT_SUGGESTIONS.map(suggestion => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => setPrompt(suggestion)}
                                        className="bg-slate-700 text-xs text-slate-300 px-3 py-1.5 rounded-full hover:bg-slate-600 transition"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                     </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                        {loading ? 'Applying Edits...' : 'Edit Image'}
                    </button>
                    {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default ImageEditor;
