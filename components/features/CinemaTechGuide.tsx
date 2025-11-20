
import React, { useState } from 'react';

interface CinemaTechGuideProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

type Tab = 'overview' | '3d' | '4d' | '5d' | '6d-9d' | 'xd';

const CinemaTechGuide: React.FC<CinemaTechGuideProps> = ({ onShare }) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const data = {
        overview: {
            title: "Evolution of Cinema",
            description: "In today's rapidly evolving realm of motion pictures, technological advancements have enabled us to create captivating and immersive experiences that go beyond traditional movie-watching.",
            points: [
                "From 3D to 9D and XD cinema, each technology offers a distinct combination of visual and sensory effects.",
                "Understanding the disparities between these cinema technologies is crucial for movie enthusiasts and industry professionals alike.",
                "We delve into the various dimensions of cinema and explore how each technology enhances the movie-watching experience."
            ]
        },
        '3d': {
            title: "3D Cinema",
            description: "3D cinema offers a three-dimensional perspective of the video, generating a perception of depth. This encompasses vertical, horizontal, and depth dimensions.",
            keyCharacteristics: [
                "Simulation of depth: Creates a lifelike representation of objects and scenes.",
                "Enhanced visual spectacle: Enhances visual effects and intensifies vibrant colors.",
                "Engaging storytelling: Allows the audience to establish a stronger emotional connection.",
                "Requires 3D glasses for optimal viewing."
            ]
        },
        '4d': {
            title: "4D Cinema",
            description: "While 3D cinema creates visual depth, 4D cinema elevates the experience by integrating sensory effects and physical sensations.",
            keyCharacteristics: [
                "Dynamic seats: Synchronized with on-screen action (move, vibrate, tilt).",
                "Environmental effects: Wind, rain, and fog to enhance realism.",
                "Sensory engagement: Scents and special effects like bubbles or strobe lights."
            ]
        },
        '5d': {
            title: "5D Cinema",
            description: "5D cinema pushes the boundaries of immersion by incorporating a wider array of sensory effects and interactive elements.",
            keyCharacteristics: [
                "Enhanced Dynamic seats: Simulate jolts or sudden drops.",
                "Physical effects: Water sprays, gusts of air, sensation of being poked/tapped.",
                "Interactivity: Shooting games or interactive displays responding to touch/gestures."
            ]
        },
        '6d-9d': {
            title: "6D to 9D Cinema",
            description: "As we move from 6D to 9D, the complexity increases. These are commonly employed in virtual reality experiences and simulator rides.",
            subSections: [
                {
                    name: "6D Cinema",
                    text: "Delivers a heightened level of interactivity. Includes game-like features, synchronized seat vibrations, and advanced technologies like motion tracking."
                },
                {
                    name: "7D Cinema",
                    text: "Aims for an adrenaline-pumping journey. Features specialized seat movements (leg ticklers, back pokers) and enhanced special effects like snow or smoke."
                },
                {
                    name: "8D Cinema",
                    text: "Integrates advanced technologies and sensory enhancements. Features 360-degree rotating seats and virtual reality elements for unparalleled immersion."
                },
                {
                    name: "9D Cinema",
                    text: "Pushes boundaries of realism. Combines multiple sensory effects (wind, rain, scent) with high-definition visuals and VR for an unforgettable experience."
                }
            ]
        },
        'xd': {
            title: "XD Cinema (Extreme Digital)",
            description: "XD cinema is a premium large-format movie-watching experience that utilizes state-of-the-art visual and auditory technologies.",
            keyCharacteristics: [
                "Advanced visual technologies: High-resolution projection (IMAX or Dolby Vision) with exceptional clarity.",
                "Immersive sound systems: Cutting-edge sound (Dolby Atmos or DTS:X) placed precisely in 3D space.",
                "Purpose-built auditoriums: Wall-to-wall screens, comfortable seating, and optimized viewing angles."
            ]
        }
    };

    const handleShare = () => {
        const tabData = data[activeTab];
        const shareText = `${tabData.title}\n\n${tabData.description}\n\n` + 
            (tabData.keyCharacteristics ? `Key Characteristics:\n${tabData.keyCharacteristics.map(c => `- ${c}`).join('\n')}` : '') +
            (tabData.points ? tabData.points.join('\n') : '') +
            (tabData.subSections ? tabData.subSections.map(s => `${s.name}: ${s.text}`).join('\n') : '');
            
        onShare({ contentText: shareText, contentType: 'text' });
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 h-[calc(100vh-12rem)] min-h-[600px]">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-1/4 flex flex-col bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden flex-shrink-0">
                <div className="p-4 bg-slate-800 border-b border-slate-700">
                    <h3 className="font-bold text-white">Technologies</h3>
                </div>
                <div className="flex-grow overflow-y-auto p-2 space-y-1">
                    <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Overview</button>
                    <button onClick={() => setActiveTab('3d')} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === '3d' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>3D Cinema</button>
                    <button onClick={() => setActiveTab('4d')} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === '4d' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>4D Cinema</button>
                    <button onClick={() => setActiveTab('5d')} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === '5d' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>5D Cinema</button>
                    <button onClick={() => setActiveTab('6d-9d')} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === '6d-9d' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>6D, 7D, 8D, 9D</button>
                    <button onClick={() => setActiveTab('xd')} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'xd' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>XD Cinema</button>
                </div>
            </div>

            {/* Content Area */}
            <div className="w-full lg:w-3/4 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col relative overflow-hidden">
                 {/* Background Accent */}
                 <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
                 <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex-grow flex flex-col p-8 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-3xl font-bold text-white">{data[activeTab].title}</h2>
                        <button 
                            onClick={handleShare}
                            className="flex items-center space-x-2 text-sm bg-slate-800 hover:bg-slate-700 text-cyan-400 py-2 px-4 rounded-lg transition-colors border border-slate-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                            <span>Share Info</span>
                        </button>
                    </div>

                    <p className="text-lg text-slate-300 mb-8 leading-relaxed">{data[activeTab].description}</p>

                    {data[activeTab].points && (
                        <div className="space-y-4 mb-8">
                            {data[activeTab].points.map((point, idx) => (
                                <div key={idx} className="flex items-start">
                                    <div className="h-2 w-2 mt-2.5 rounded-full bg-cyan-500 mr-4 flex-shrink-0"></div>
                                    <p className="text-slate-300">{point}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {data[activeTab].keyCharacteristics && (
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-xl font-semibold text-cyan-400 mb-4">Key Characteristics</h3>
                            <ul className="space-y-3">
                                {data[activeTab].keyCharacteristics.map((char, idx) => (
                                    <li key={idx} className="flex items-start text-slate-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>{char}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {data[activeTab].subSections && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data[activeTab].subSections.map((sub, idx) => (
                                <div key={idx} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/30 transition-colors">
                                    <h3 className="text-lg font-bold text-white mb-2">{sub.name}</h3>
                                    <p className="text-slate-400 text-sm">{sub.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {activeTab === 'overview' && (
                        <div className="mt-auto pt-8">
                            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-slate-700">
                                <p className="text-center text-slate-300 italic">"Understanding these technologies empowers you to choose the most suitable cinematic experience for your next adventure."</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CinemaTechGuide;
