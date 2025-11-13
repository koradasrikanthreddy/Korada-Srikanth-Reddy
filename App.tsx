



import React, { useState, useMemo } from 'react';
import { FEATURES, FeatureId, CATEGORY_DETAILS } from './constants';
import ImageGenerator from './components/features/ImageGenerator';
import ImageEditor from './components/features/ImageEditor';
import VideoGenerator from './components/features/VideoGenerator';
import VoiceChat from './components/features/VoiceChat';
import Chatbot from './components/features/Chatbot';
import GroundedSearch from './components/features/GroundedSearch';
import MediaAnalyzer from './components/features/MediaAnalyzer';
import TextToSpeech from './components/features/TextToSpeech';
import AvatarGenerator from './components/features/AvatarGenerator';
import VideoEditor from './components/features/VideoEditor';
import SoundStudio from './components/features/SoundStudio';
import SongsGenerator from './components/features/SongsGenerator';
import MarketingAssistant from './components/features/MarketingAssistant';
import Pricing from './components/features/Pricing';
import ProfileAndSettings from './components/features/ProfileAndSettings';
import MovieGenerator from './components/features/MovieGenerator';
import ContentGenerator from './components/features/ContentGenerator';
import StandupGenerator from './components/features/StandupGenerator';
import StrandsGenerator from './components/features/StrandsGenerator';
import DanceGenerator from './components/features/DanceGenerator';
import { PLATFORMS, Platform, PlatformCategory } from './constants';


// --- Traffic Booster Modal Component ---
interface TrafficBoosterModalProps {
    show: boolean;
    onClose: () => void;
    contentUrl?: string | null;
    contentText?: string | null;
    contentType?: 'image' | 'video' | 'text' | 'audio';
}

export const TrafficBoosterModal: React.FC<TrafficBoosterModalProps> = ({ show, onClose, contentUrl, contentText, contentType = 'image' }) => {
    const [activeTab, setActiveTab] = useState<PlatformCategory>('Photo Sharing');
    const [shareText, setShareText] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    React.useEffect(() => {
        setShareText(contentText || 'Check out this content I created with the AI Creative Suite!');
    }, [contentText, show]);

    if (!show) return null;

    const displayToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleSchedule = () => {
        if (!scheduleDate || !scheduleTime) {
            displayToast('Please select a date and time.');
            return;
        }
        displayToast(`Scheduled for ${scheduleDate} at ${scheduleTime}! (Demo)`);
    };
    
    const getFileName = () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        if (contentType === 'video') return `ai-video-${timestamp}.mp4`;
        if (contentType === 'image') return `ai-image-${timestamp}.jpg`;
        if (contentType === 'audio') return `ai-audio-${timestamp}.mp3`;
        return `ai-content-${timestamp}.txt`;
    }

    const categories: PlatformCategory[] = Array.from(new Set(PLATFORMS.map(p => p.category)));
    const filteredPlatforms = PLATFORMS.filter(p => p.category === activeTab);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 modal-overlay" onClick={onClose}>
            {toastMessage && (
                <div className="absolute top-5 bg-green-500 text-white py-2 px-4 rounded-lg animate-pulse z-50">
                    {toastMessage}
                </div>
            )}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full mx-4 border border-slate-700 shadow-2xl shadow-cyan-500/10 modal-content" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-white mb-4">Share & Promote</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Side */}
                    <div className="space-y-4">
                        <div className="bg-slate-950/50 rounded-lg p-3 max-h-48 overflow-hidden flex items-center justify-center border border-slate-700">
                            {contentType === 'image' && contentUrl && <img src={contentUrl} alt="Content preview" className="max-h-44 w-auto rounded" />}
                            {contentType === 'video' && contentUrl && <video src={contentUrl} controls className="max-h-44 w-auto rounded" />}
                            {contentType === 'audio' && contentUrl && <audio src={contentUrl} controls className="w-full" />}
                            {contentType === 'text' && contentText && <p className="text-slate-300 text-sm max-h-44 overflow-y-auto">{String(contentText).substring(0, 300)}{String(contentText).length > 300 ? '...' : ''}</p>}
                        </div>
                        <textarea
                            rows={3}
                            value={shareText}
                            onChange={(e) => setShareText(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition"
                            placeholder="Add a caption..."
                        />
                        <div className="flex bg-slate-800 rounded-lg p-1 text-sm border border-slate-700">
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setActiveTab(cat)} className={`w-full p-2 rounded-md text-xs font-semibold transition ${activeTab === cat ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-center p-2 bg-slate-950/50 rounded-lg border border-slate-700">
                            {filteredPlatforms.map(platform => (
                                // FIX: Argument of type 'string' is not assignable to parameter of type '"image" | "video" | "text" | "audio"'.
                                // Explicitly cast contentType to its specific union type to resolve a TypeScript inference issue inside the map function.
                                <a key={platform.name} href={platform.shareUrl ? platform.shareUrl(contentUrl || window.location.href, shareText, contentType as ('image' | 'video' | 'text' | 'audio')) : '#'} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-700/50 transition group">
                                    <div className="w-10 h-10 text-slate-300 group-hover:text-white transition transform group-hover:scale-110">{platform.icon}</div>
                                    <span className="text-xs mt-1 text-slate-400">{platform.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-4">
                        <div className="bg-slate-950/50 p-4 rounded-lg space-y-3 border border-slate-700">
                            <h3 className="font-semibold text-slate-200">Schedule Post (Demo)</h3>
                            <div className="flex gap-2">
                                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm" />
                                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm" />
                            </div>
                            <button onClick={handleSchedule} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition">Schedule Send</button>
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-lg space-y-2 border border-slate-700">
                            <h3 className="font-semibold text-slate-200">Other Actions</h3>
                            <div className={`grid ${contentUrl ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                                {contentUrl && <a href={contentUrl} download={getFileName()} className="text-center w-full bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition">Download</a>}
                                <button onClick={() => { navigator.clipboard.writeText(contentUrl || contentText || ''); displayToast('Copied to clipboard!'); }} className="w-full bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition">Copy</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const FeatureCard: React.FC<{ feature: typeof FEATURES[0]; onClick: () => void }> = ({ feature, onClick }) => (
    <div
        className="group relative bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 flex flex-col items-start transition-all duration-300 cursor-pointer overflow-hidden border border-slate-800 hover:border-cyan-500/50"
        onClick={onClick}
    >
        {/* Glow effect */}
        <div className="absolute -inset-px rounded-2xl bg-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></div>
        {/* Spotlight effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
            <div className="p-3 rounded-xl bg-slate-800/70 mb-4 border border-slate-700 group-hover:bg-cyan-900/50 group-hover:border-cyan-700 transition-all duration-300 shadow-lg text-cyan-400">
                {React.cloneElement(feature.icon, { className: 'w-7 h-7' })}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
        </div>
    </div>
);

const App: React.FC = () => {
    const [activeFeature, setActiveFeature] = useState<FeatureId | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [trafficBoosterState, setTrafficBoosterState] = useState<{
        show: boolean;
        contentUrl?: string | null;
        contentText?: string | null;
        contentType?: 'image' | 'video' | 'text' | 'audio';
    }>({ show: false });

    const openTrafficBooster = (content: {
        contentUrl?: string | null;
        contentText?: string | null;
        contentType?: 'image' | 'video' | 'text' | 'audio';
    }) => {
        setTrafficBoosterState({ ...content, show: true });
    };

    const closeTrafficBooster = () => {
        setTrafficBoosterState({ show: false, contentUrl: undefined, contentText: undefined });
    };

    const ActiveComponent = useMemo(() => {
        if (!activeFeature) return null;
        switch (activeFeature) {
            case 'image-generator': return ImageGenerator;
            case 'image-editor': return ImageEditor;
            case 'video-generator': return VideoGenerator;
            case 'movie-generator': return MovieGenerator;
            case 'voice-chat': return VoiceChat;
            case 'chatbot': return Chatbot;
            case 'grounded-search': return GroundedSearch;
            case 'media-analyzer': return MediaAnalyzer;
            case 'text-to-speech': return TextToSpeech;
            case 'avatar-generator': return AvatarGenerator;
            case 'video-editor': return VideoEditor;
            case 'sound-studio': return SoundStudio;
            case 'songs-generator': return SongsGenerator;
            case 'marketing-assistant': return MarketingAssistant;
            case 'content-generator': return ContentGenerator;
            case 'standup-generator': return StandupGenerator;
            case 'strands-generator': return StrandsGenerator;
            case 'dance-generator': return DanceGenerator;
            case 'pricing': return Pricing;
            case 'profile-settings': return ProfileAndSettings;
            default: return null;
        }
    }, [activeFeature]);

    const activeFeatureDetails = FEATURES.find(f => f.id === activeFeature);

    const categorizedFeatures = useMemo(() => {
        const categories: { [key: string]: (typeof FEATURES[0])[] } = {
            'Create & Edit': [],
            'Assist & Analyze': [],
            'Account': [],
        };
        const order: (keyof typeof categories)[] = ['Create & Edit', 'Assist & Analyze'];

        for (const feature of FEATURES) {
            if (feature.category in categories) {
                categories[feature.category].push(feature);
            }
        }
        
        for (const category in categories) {
            categories[category].sort((a, b) => a.title.localeCompare(b.title));
        }

        return { order, categories };
    }, []);

    const dashboardFeatures = useMemo(() => {
        return [...FEATURES].sort((a, b) => {
            const isAAccount = a.category === 'Account';
            const isBAccount = b.category === 'Account';

            if (isAAccount && !isBAccount) {
                return 1;
            }
            if (!isAAccount && isBAccount) {
                return -1;
            }
            return a.title.localeCompare(b.title);
        });
    }, []);

    const NavLink: React.FC<{
        isActive: boolean;
        onClick: (e: React.MouseEvent) => void;
        title: string;
        icon: React.ReactElement;
    }> = ({ isActive, onClick, title, icon }) => (
        <a
            href="#"
            title={isSidebarCollapsed ? title : ''}
            onClick={onClick}
            className={`flex items-center text-sm font-medium transition-all duration-200 group relative ${isSidebarCollapsed ? 'justify-center w-12 h-12 rounded-xl' : 'px-4 py-2.5 rounded-lg'} ${isActive ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            <div className="w-6 h-6 flex-shrink-0">{icon}</div>
            <span
                className={`whitespace-nowrap transition-all duration-200 ease-in-out overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 ml-3'}`}
            >
                {title}
            </span>
            {isActive && !isSidebarCollapsed && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-cyan-400 rounded-r-full"></div>
            )}
        </a>
    );


    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
            <TrafficBoosterModal
                show={trafficBoosterState.show}
                onClose={closeTrafficBooster}
                contentUrl={trafficBoosterState.contentUrl}
                contentText={trafficBoosterState.contentText}
                contentType={trafficBoosterState.contentType}
            />
            {/* Sidebar */}
            <aside className={`flex-shrink-0 bg-slate-900/70 backdrop-blur-lg border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-24' : 'w-72'}`}>
                <div className={`h-20 flex-shrink-0 flex items-center border-b border-slate-800 transition-all duration-300 ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-6'}`}>
                    <svg className="w-8 h-8 text-cyan-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.75 2.06733L16.2045 9.42933L22.929 10.3958L17.8395 15.3443L19.0215 22.0403L12.75 18.2143L6.4785 22.0403L7.6605 15.3443L2.571 10.3958L9.2955 9.42933L12.75 2.06733ZM12.75 5.51133L10.6695 9.89733L5.9445 10.6013L9.348 13.9103L8.514 18.6053L12.75 16.1463L16.986 18.6053L16.152 13.9103L19.5555 10.6013L14.8305 9.89733L12.75 5.51133Z"></path>
                    </svg>
                    <h1 className={`text-xl font-bold text-white whitespace-nowrap transition-all duration-200 ease-in-out overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 ml-3'}`}>AI Creative Suite</h1>
                </div>

                <nav className={`flex-grow p-4 overflow-y-auto ${isSidebarCollapsed ? 'space-y-2' : 'space-y-6'}`}>
                    <div>
                         <NavLink 
                            isActive={activeFeature === null}
                            onClick={(e) => { e.preventDefault(); setActiveFeature(null); }}
                            title="Dashboard"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                        />
                    </div>

                    {categorizedFeatures.order.map(category => (
                        <div key={category}>
                            <h2 className={`text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 ${isSidebarCollapsed ? 'justify-center my-4' : 'px-4 mb-2'}`}>
                                {CATEGORY_DETAILS[category].icon}
                                <span className={isSidebarCollapsed ? 'hidden' : ''}>{category}</span>
                            </h2>
                            <ul className={`space-y-1 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
                                {categorizedFeatures.categories[category].map(feature => (
                                    <li key={feature.id} className="w-full">
                                        <NavLink 
                                            isActive={activeFeature === feature.id}
                                            onClick={(e) => { e.preventDefault(); setActiveFeature(feature.id); }}
                                            title={feature.title}
                                            icon={feature.icon}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className={`flex-shrink-0 p-4 border-t border-slate-800 ${isSidebarCollapsed ? 'space-y-2' : 'space-y-1'}`}>
                    <h2 className={`text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 ${isSidebarCollapsed ? 'justify-center my-4' : 'px-4 mb-2'}`}>
                        {CATEGORY_DETAILS['Account'].icon}
                        <span className={isSidebarCollapsed ? 'hidden' : ''}>Account</span>
                    </h2>
                    <ul className={`space-y-1 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
                        {categorizedFeatures.categories['Account'].map(feature => (
                             <li key={feature.id} className="w-full">
                                <NavLink 
                                    isActive={activeFeature === feature.id}
                                    onClick={(e) => { e.preventDefault(); setActiveFeature(feature.id); }}
                                    title={feature.title}
                                    icon={feature.icon}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            
             <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-sm border-b border-slate-800 z-10">
                     <div className="flex items-center space-x-4">
                        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors" aria-label="Toggle sidebar">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </button>
                        <div className="h-6 border-r border-slate-700"></div>
                        {ActiveComponent ? (
                             <div className="flex items-center space-x-4">
                                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400">
                                     {React.cloneElement(activeFeatureDetails.icon, { className: 'w-6 h-6' })}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">{activeFeatureDetails?.title}</h2>
                                    <p className="text-xs text-slate-400 mt-1 hidden sm:block">{activeFeatureDetails?.description}</p>
                                </div>
                            </div>
                        ) : (
                             <div>
                                <h2 className="text-lg font-bold text-white">Dashboard</h2>
                                <p className="text-xs text-slate-400 mt-1 hidden sm:block">Welcome to your AI Creative Suite</p>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto min-w-0">
                    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                        {ActiveComponent ? (
                            <div className="main-content-enter">
                                <ActiveComponent onShare={openTrafficBooster} />
                            </div>
                        ) : (
                            <div className="main-content-enter">
                                <div className="mb-12">
                                    <h2 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-500">AI Creative Suite</h2>
                                    <p className="mt-4 max-w-2xl text-lg text-slate-400">
                                        A powerful suite of AI-powered tools for design, content creation, and analysis, all powered by Google's Gemini models.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {dashboardFeatures.map((feature) => (
                                        <FeatureCard key={feature.id} feature={feature} onClick={() => setActiveFeature(feature.id)} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
