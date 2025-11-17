import React, { useState } from 'react';
import Loader from '../common/Loader';

interface TrafficBoosterProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

interface Business {
    id: string;
    name: string;
    address: string;
    phone: string;
    website: string;
    rating: number;
    reviews: number;
}

const TrafficBooster: React.FC<TrafficBoosterProps> = ({ onShare }) => {
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');
    const [maxResults, setMaxResults] = useState(20);
    const [results, setResults] = useState<Business[]>([]);
    const [loading, setLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const getPlaceDetails = async (placeId: string): Promise<Business | null> => {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total&key=${process.env.API_KEY}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.status !== "OK") return null;
            const result = data.result;
            return {
                id: result.place_id,
                name: result.name,
                address: result.formatted_address,
                phone: result.formatted_phone_number || "N/A",
                website: result.website || "N/A",
                rating: result.rating || 0,
                reviews: result.user_ratings_total || 0,
            };
        } catch (err) {
            console.error("Place Details fetch error:", err);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query || !location) {
            setError('Query and Location are required.');
            return;
        }
        setLoading(true);
        setError(null);
        setResults([]);
        setProgressMessage('Starting extraction...');

        let fetchedResults: Business[] = [];
        let nextPageToken: string | null = null;
        let pagesFetched = 0;

        try {
            do {
                const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
                searchUrl.searchParams.append('query', `${query} in ${location}`);
                searchUrl.searchParams.append('key', process.env.API_KEY);
                if (nextPageToken) {
                    searchUrl.searchParams.append('pagetoken', nextPageToken);
                }
                
                const res = await fetch(searchUrl.toString());
                const data = await res.json();

                if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                    throw new Error(data.error_message || `API Error: ${data.status}`);
                }
                
                if (data.results) {
                    for (const item of data.results) {
                        if (fetchedResults.length >= maxResults) break;
                        setProgressMessage(`Fetching details for "${item.name}"... (${fetchedResults.length + 1}/${maxResults})`);
                        const fullDetails = await getPlaceDetails(item.place_id);
                        if (fullDetails) {
                            fetchedResults.push(fullDetails);
                            setResults([...fetchedResults]); // Update state incrementally
                        }
                        await delay(50); // Small delay to avoid hitting limits too fast
                    }
                }

                nextPageToken = data.next_page_token || null;
                pagesFetched++;

                if (nextPageToken && fetchedResults.length < maxResults) {
                    setProgressMessage('Waiting for next page of results...');
                    await delay(2000); // Google requires a delay before using next_page_token
                }

            } while (nextPageToken && fetchedResults.length < maxResults && pagesFetched < 10);
            
            setProgressMessage(`Extraction complete. Found ${fetchedResults.length} businesses.`);

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred during extraction.');
        } finally {
            setLoading(false);
        }
    };

    const handleUseLocation = () => {
        setIsFetchingLocation(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.API_KEY}`;
                try {
                    const res = await fetch(url);
                    const data = await res.json();
                    if (data.results && data.results.length > 0) {
                        // Find a locality or similar level
                        const address = data.results[0].formatted_address;
                        setLocation(address);
                    } else {
                        setError('Could not determine your location name.');
                    }
                } catch (err) {
                    setError('Failed to reverse geocode your location.');
                } finally {
                    setIsFetchingLocation(false);
                }
            },
            (geoError) => {
                setError('Could not get location. Please enable location services.');
                setIsFetchingLocation(false);
            }
        );
    };

    const convertToCSV = (data: Business[]) => {
        const headers = ['Name', 'Address', 'Phone', 'Website', 'Rating', 'Reviews'];
        const rows = data.map(bus => 
            [bus.name, bus.address, bus.phone, bus.website, bus.rating, bus.reviews]
            .map(val => `"${String(val).replace(/"/g, '""')}"`) // Escape quotes
            .join(',')
        );
        return [headers.join(','), ...rows].join('\n');
    };

    const handleExport = () => {
        const csvData = convertToCSV(results);
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'google-maps-extract.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleShare = () => {
        const text = `Extracted ${results.length} businesses for query "${query}" in "${location}".\n\nTop 5 Results:\n` +
            results.slice(0, 5).map(r => `- ${r.name} (${r.rating}⭐, ${r.reviews} reviews)`).join('\n');
        onShare({ contentText: text, contentType: 'text'});
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                        <label htmlFor="query" className="block text-sm font-medium text-slate-300 mb-2">Keyword</label>
                        <input id="query" type="text" value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., 'digital marketing agencies'" />
                    </div>
                    <div className="lg:col-span-2">
                        <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                        <div className="flex gap-2">
                            <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., 'New York'" />
                            <button type="button" onClick={handleUseLocation} disabled={isFetchingLocation} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition" title="Use my current location">
                                {isFetchingLocation ? <Loader /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="maxResults" className="block text-sm font-medium text-slate-300 mb-2">Max Results</label>
                        <input id="maxResults" type="number" value={maxResults} onChange={e => setMaxResults(Number(e.target.value))} min="1" max="200" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"></path></svg>
                    <span>{loading ? 'Extracting...' : 'Extract Businesses'}</span>
                </button>
                {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
            </form>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Results</h3>
                    {results.length > 0 && (
                        <div className="flex gap-2">
                            <button onClick={handleShare} className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition text-sm">Share</button>
                            <button onClick={handleExport} className="bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition text-sm">Export CSV</button>
                        </div>
                    )}
                </div>

                {loading && <Loader message={progressMessage} />}
                
                {!loading && results.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        Your extracted business data will appear here.
                    </div>
                )}
                
                {results.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Address</th>
                                    <th scope="col" className="px-6 py-3">Phone</th>
                                    <th scope="col" className="px-6 py-3">Website</th>
                                    <th scope="col" className="px-6 py-3 text-center">Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((bus) => (
                                    <tr key={bus.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{bus.name}</td>
                                        <td className="px-6 py-4">{bus.address}</td>
                                        <td className="px-6 py-4">{bus.phone}</td>
                                        <td className="px-6 py-4">
                                            {bus.website !== 'N/A' ? <a href={bus.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Visit</a> : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <span className="text-amber-400 mr-1">★</span> {bus.rating} ({bus.reviews})
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrafficBooster;