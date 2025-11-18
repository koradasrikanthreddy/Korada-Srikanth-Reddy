import React, { useState, useEffect } from 'react';
import { performGroundedSearch, generateOutreachPitch } from '../../services/geminiService';
import Loader from '../common/Loader';
import { GroundingChunk } from '@google/genai';
import { PITCH_SERVICES } from '../../constants';

interface PitchModalProps {
    show: boolean;
    businessName: string;
    format: 'email' | 'sms' | 'phone script';
    onClose: () => void;
}

const PitchGeneratorModal: React.FC<PitchModalProps> = ({ show, businessName, format, onClose }) => {
    const [service, setService] = useState(PITCH_SERVICES[0]);
    const [pitch, setPitch] = useState('');
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (show) {
            setPitch('');
            setService(PITCH_SERVICES[0]);
        }
    }, [show]);

    const displayToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleGeneratePitch = async () => {
        setLoading(true);
        setPitch('');
        try {
            const response = await generateOutreachPitch(businessName, service, format);
            setPitch(response.text);
        } catch (err) {
            setPitch('Sorry, I was unable to generate a pitch. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
             {toastMessage && (
                <div className="absolute top-5 bg-green-500 text-white py-2 px-4 rounded-lg animate-pulse z-50">
                    {toastMessage}
                </div>
            )}
            <div className="bg-slate-800 rounded-lg p-8 max-w-2xl w-full mx-4 border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-white mb-2">Generate {format}</h2>
                <p className="text-slate-400 mb-6">to <span className="font-semibold text-cyan-400">{businessName}</span></p>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                            <label htmlFor="service" className="block text-sm font-medium text-slate-300 mb-2">Service to Offer</label>
                            <select id="service" value={service} onChange={e => setService(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                                {PITCH_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <button onClick={handleGeneratePitch} disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                            {loading ? 'Generating...' : 'Generate Pitch'}
                        </button>
                    </div>
                    {(loading || pitch) && (
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 min-h-[200px] relative">
                            {loading && <div className="absolute inset-0 flex items-center justify-center"><Loader /></div>}
                            {pitch && (
                                <>
                                    <textarea readOnly value={pitch} className="w-full h-48 bg-transparent border-none text-slate-300 text-sm resize-none focus:ring-0" />
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(pitch); displayToast('Copied to clipboard!'); }}
                                        className="absolute top-2 right-2 bg-slate-700 text-white font-semibold text-xs py-1.5 px-3 rounded-md hover:bg-slate-600 transition-colors"
                                    >
                                        Copy Text
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TrafficBooster: React.FC<{onShare: (options: any) => void;}> = () => {
    const [query, setQuery] = useState('');
    const [manualLocationQuery, setManualLocationQuery] = useState('');
    const [useGeo, setUseGeo] = useState(true);
    const [geoLocation, setGeoLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [results, setResults] = useState<GroundingChunk[]>([]);
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pitchModalState, setPitchModalState] = useState<{ show: boolean; businessName: string; format: 'email' | 'sms' | 'phone script'; } | null>(null);

    const handleUseCurrentLocation = () => {
        setUseGeo(true);
        setManualLocationQuery('');
        setLocationError(null);
        if (!geoLocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => setGeoLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
                () => setLocationError('Could not get location. Please enable location services.')
            );
        }
    };

    useEffect(() => {
        handleUseCurrentLocation(); // Try to get location on component mount
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) { setError('Please enter a business type.'); return; }
        if (useGeo && !geoLocation) { setError('Current location is not available. Please enable location services or enter a location manually.'); return; }
        if (!useGeo && !manualLocationQuery) { setError('Please enter a location or use your current location.'); return; }

        setLoading(true);
        setError(null);
        setResults([]);
        setSummary(null);

        try {
            const fullQuery = useGeo ? `${query} near me` : `${query} in ${manualLocationQuery}`;
            const locationToUse = useGeo ? geoLocation ?? undefined : undefined;
            const response = await performGroundedSearch(fullQuery, true, locationToUse);
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.maps) || [];
            setResults(chunks);
            setSummary(response.text);
        } catch (err) {
            setError('Failed to fetch results. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const openPitchModal = (businessName: string, format: 'email' | 'sms' | 'phone script') => {
        setPitchModalState({ show: true, businessName, format });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
             <PitchGeneratorModal
                show={pitchModalState?.show ?? false}
                businessName={pitchModalState?.businessName ?? ''}
                format={pitchModalState?.format ?? 'email'}
                onClose={() => setPitchModalState(null)}
            />
            <form onSubmit={handleSubmit} className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
                 <h3 className="text-xl font-bold">Find & Pitch Local Businesses</h3>
                 <p className="text-sm text-slate-400">Find businesses for market research or generate AI-powered outreach pitches to offer your services.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                        placeholder="Business type (e.g., coffee shops)"
                    />
                    <div className="relative">
                        <input
                            type="text"
                            value={manualLocationQuery}
                            onChange={(e) => { setManualLocationQuery(e.target.value); setUseGeo(false); }}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white pr-12"
                            placeholder="City, State or Zip Code"
                        />
                        <button type="button" onClick={handleUseCurrentLocation} title="Use Current Location" className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${useGeo ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-slate-300 hover:bg-cyan-500 hover:text-white'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </div>
                 <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                    {loading ? 'Searching...' : 'Find Businesses'}
                </button>
                 {(error || locationError) && <p className="text-red-400 text-sm text-center">{error || locationError}</p>}
                 {useGeo && manualLocationQuery === '' && <p className="text-xs text-center text-slate-400">Using current location. To search elsewhere, type in the location field.</p>}
            </form>
            
            <div className="min-h-[400px]">
                {loading && <Loader message="Searching Google Maps..." />}
                {!loading && (results.length > 0 || summary) && (
                    <div className="space-y-6">
                        {summary && <div className="p-4 bg-slate-800/50 rounded-lg text-slate-300 border border-slate-700 prose prose-sm prose-invert max-w-none">{summary}</div>}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.map((chunk, index) => (
                                chunk.maps && (
                                    <div key={index} className="flex flex-col p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-white truncate">{chunk.maps.title}</h4>
                                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{(chunk.maps.placeAnswerSources?.reviewSnippets?.[0] as any)?.snippet ?? 'No review snippet available.'}</p>
                                        </div>
                                        <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline mt-3">View on Google Maps</a>
                                        <div className="mt-4 pt-4 border-t border-slate-700">
                                            <h5 className="text-xs font-semibold text-slate-400 mb-2">Generate Pitch</h5>
                                            <div className="flex justify-around gap-2">
                                                <button onClick={() => openPitchModal(chunk.maps!.title, 'email')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1.5 px-2 rounded-md w-full transition">Email</button>
                                                <button onClick={() => openPitchModal(chunk.maps!.title, 'sms')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1.5 px-2 rounded-md w-full transition">SMS</button>
                                                <button onClick={() => openPitchModal(chunk.maps!.title, 'phone script')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1.5 px-2 rounded-md w-full transition">Script</button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}
                {!loading && results.length === 0 && !summary && !error && !locationError && (
                    <div className="text-center text-slate-500 pt-16">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 opacity-30" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"></path></svg>
                        <p className="mt-4">Local business listings will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrafficBooster;