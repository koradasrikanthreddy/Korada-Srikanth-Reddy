
import React, { useState, useEffect } from 'react';
import { generateText, generateImage } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

interface ProductionPlannerProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

type ToolId = 
    'dashboard' |
    'call-sheet' | 'screenwriting' | 'av-scripts' | 'shot-lists' | 
    'storyboards' | 'mood-boards' | 'script-breakdowns' | 'shooting-schedules' | 
    'script-sides' | 'contacts' | 'task-boards' | 'calendar' | 'files';

// --- Helpers ---
const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

const ToolActions = ({ 
    onShare, 
    onEdit, 
    onSave, 
    onDownload, 
    onDiscard,
    isEditing 
}: any) => {
    const [saved, setSaved] = useState(false);
    const handleSave = () => {
        if(onSave) onSave();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }
    return (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700/50 justify-end">
             {onEdit && (
                <button onClick={onEdit} className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded transition ${isEditing ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    <span>{isEditing ? 'Done' : 'Edit'}</span>
                </button>
            )}
            {onShare && (
                <button onClick={onShare} className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                    <span>Share</span>
                </button>
            )}
            {onSave && (
                <button onClick={handleSave} className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded transition ${saved ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                    <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
            )}
            {onDownload && (
                <button onClick={onDownload} className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    <span>Download</span>
                </button>
            )}
            {onDiscard && (
                <button onClick={onDiscard} className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold bg-red-900/50 hover:bg-red-700 text-red-200 rounded transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <span>Discard</span>
                </button>
            )}
        </div>
    )
}

// --- Sub-Component: Dashboard ---
const DashboardTool = ({ onChangeTool, menuGroups }: { onChangeTool: (id: ToolId) => void, menuGroups: any[] }) => {
    const allTools = menuGroups.flatMap(g => g.items).filter(i => i.id !== 'dashboard');

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-lg">
                <h2 className="text-3xl font-bold text-white mb-2">Production Overview</h2>
                <p className="text-slate-400">Welcome to your all-in-one production command center. Select a tool to get started.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Project Status</h4>
                        <div className="text-2xl font-bold text-green-400">Pre-Production</div>
                        <div className="w-full bg-slate-700 h-2 rounded-full mt-3">
                            <div className="bg-green-500 h-2 rounded-full w-1/3"></div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                         <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Next Shoot</h4>
                         <div className="text-xl font-bold text-white">Oct 24, 2023</div>
                         <p className="text-xs text-slate-500 mt-1">Location: Downtown Studio</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                         <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Tasks</h4>
                         <div className="text-2xl font-bold text-amber-400">3 High Priority</div>
                         <p className="text-xs text-slate-500 mt-1">Cast locking, Loc scout</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {allTools.map((tool: any) => (
                        <button key={tool.id} onClick={() => onChangeTool(tool.id)} className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-left transition group flex flex-col h-full">
                             <div className="text-3xl mb-3 group-hover:scale-110 transition-transform origin-left">{tool.icon}</div>
                             <div className="font-semibold text-slate-200">{tool.label}</div>
                             <div className="text-xs text-slate-500 mt-1">Open Tool →</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Sub-Component: Screenwriter ---
const ScreenwriterTool = ({ onShare }: { onShare: any }) => {
    const [concept, setConcept] = useState('');
    const [script, setScript] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleGenerate = async () => {
        if (!concept.trim()) return;
        setLoading(true);
        try {
            const prompt = `Write a formatted movie script scene based on this concept: "${concept}". 
            Format it with Scene Headings (INT./EXT.), Action lines, Character names centered, and Dialogue. 
            Keep it professional standard screenplay format.`;
            const response = await generateText(prompt, 'gemini-2.5-pro');
            setScript(response.text);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-4 flex flex-col h-full bg-slate-800/30 p-6 rounded-xl border border-slate-700">
                <h3 className="font-bold text-white">Input</h3>
                <label className="block text-sm font-medium text-slate-400">Concept / Scene Idea</label>
                <textarea 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 flex-grow focus:ring-2 focus:ring-cyan-500 text-white min-h-[200px] resize-none"
                    placeholder="e.g., A tense negotiation between a spy and a double agent on a rainy rooftop..."
                    value={concept}
                    onChange={e => setConcept(e.target.value)}
                />
                <button 
                    onClick={handleGenerate} 
                    disabled={loading || !concept.trim()} 
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Writing Script...' : 'Generate Scene'}
                </button>
            </div>
            <div className="bg-white text-black font-mono p-8 rounded-lg shadow-lg h-full overflow-y-auto border-l-8 border-slate-300 min-h-[500px] flex flex-col">
                <div className="flex-grow">
                    {script ? (
                        isEditing ? 
                        <textarea className="w-full h-full p-2 border border-gray-300 rounded resize-none focus:outline-none" value={script} onChange={e => setScript(e.target.value)} /> :
                        <div className="whitespace-pre-wrap">{script}</div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 italic">Script output area...</div>
                    )}
                </div>
                {script && (
                    <div className="mt-auto">
                        <ToolActions 
                            onShare={() => onShare({ contentText: script, contentType: 'text' })}
                            onDownload={() => downloadFile('script.txt', script)}
                            onEdit={() => setIsEditing(!isEditing)}
                            isEditing={isEditing}
                            onSave={() => {}}
                            onDiscard={() => setScript('')}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-Component: AV Scripts ---
const AvScriptTool = ({ onShare }: { onShare: any }) => {
    const [topic, setTopic] = useState('');
    const [script, setScript] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        try {
            const prompt = `Write a 2-column AV Script (Audio/Visual) for a video about: "${topic}".
            Format as a Markdown table with two columns: "Visual" and "Audio".
            Include camera directions in Visual and dialogue/SFX in Audio.`;
            const response = await generateText(prompt, 'gemini-2.5-flash');
            setScript(response.text);
            setIsEditing(false);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
             <div className="space-y-4 flex flex-col h-full bg-slate-800/30 p-6 rounded-xl border border-slate-700">
                <h3 className="font-bold text-white">Project Details</h3>
                <label className="block text-sm font-medium text-slate-400">Topic or Product</label>
                <textarea 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 flex-grow focus:ring-2 focus:ring-purple-500 text-white min-h-[200px] resize-none"
                    placeholder="e.g., 30s Commercial for Energy Drink featuring extreme sports"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                />
                <button 
                    onClick={handleGenerate} 
                    disabled={loading || !topic.trim()} 
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Generating...' : 'Create AV Script'}
                </button>
            </div>
            <div className="bg-slate-900/80 p-8 rounded-lg border border-slate-700 shadow-lg min-h-[400px] overflow-y-auto flex flex-col">
                {script ? (
                     <>
                        <div className="flex-grow">
                            {isEditing ? 
                                <textarea className="w-full h-full bg-slate-800 text-white p-4 rounded font-mono resize-none" value={script} onChange={e => setScript(e.target.value)} /> :
                                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: md.render(script) }} />
                            }
                        </div>
                        <ToolActions 
                            onShare={() => onShare({ contentText: script, contentType: 'text' })}
                            onDownload={() => downloadFile('av_script.md', script)}
                            onEdit={() => setIsEditing(!isEditing)}
                            isEditing={isEditing}
                            onSave={() => {}}
                            onDiscard={() => setScript('')}
                        />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <p>Two-column scripts perfect for commercials and documentaries.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-Component: Script Breakdown ---
const ScriptBreakdownTool = ({ onShare }: { onShare: any }) => {
    const [scriptText, setScriptText] = useState('');
    const [breakdown, setBreakdown] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleAnalyze = async () => {
        if (!scriptText.trim()) return;
        setLoading(true);
        try {
            const prompt = `Analyze this script and perform a breakdown. Categorize into: CAST, EXTRAS, PROPS, WARDROBE, VEHICLES, SFX, VFX. Format as Markdown list. Script: "${scriptText}"`;
            const response = await generateText(prompt, 'gemini-2.5-flash');
            setBreakdown(response.text);
            setIsEditing(false);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-4 flex flex-col h-full bg-slate-800/30 p-6 rounded-xl border border-slate-700">
                <h3 className="font-bold text-white">Script Input</h3>
                <label className="block text-sm font-medium text-slate-400">Paste Scene Text</label>
                <textarea 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 flex-grow focus:ring-2 focus:ring-cyan-500 text-white font-mono text-sm min-h-[200px] resize-none"
                    placeholder="INT. DINER - DAY..."
                    value={scriptText}
                    onChange={e => setScriptText(e.target.value)}
                />
                <button onClick={handleAnalyze} disabled={loading || !scriptText.trim()} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Analyzing...' : 'Breakdown Script'}
                </button>
            </div>
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-700 shadow-lg h-full overflow-y-auto min-h-[400px] flex flex-col">
                <div className="flex-grow">
                    {breakdown ? (
                        isEditing ?
                        <textarea className="w-full h-full bg-slate-800 text-white p-4 rounded resize-none" value={breakdown} onChange={e => setBreakdown(e.target.value)} /> :
                        <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: md.render(breakdown) }} />
                    ) : (
                        <div className="text-center text-slate-500 mt-20">Breakdown items will appear here.</div>
                    )}
                </div>
                {breakdown && (
                     <ToolActions 
                        onShare={() => onShare({ contentText: breakdown, contentType: 'text' })}
                        onDownload={() => downloadFile('breakdown.md', breakdown)}
                        onEdit={() => setIsEditing(!isEditing)}
                        isEditing={isEditing}
                        onSave={() => {}}
                        onDiscard={() => setBreakdown(null)}
                    />
                )}
            </div>
        </div>
    );
};

// --- Sub-Component: Mood Board ---
const MoodBoardTool = ({ onShare }: { onShare: any }) => {
    const [theme, setTheme] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!theme.trim()) return;
        setLoading(true);
        setImages([]);
        try {
            const prompts = [`Cinematic shot, ${theme}`, `Detail shot, ${theme}`, `Wide shot, ${theme}`, `Texture shot, ${theme}`];
            const results = [];
            for (const p of prompts) {
                const imgBytes = await generateImage(p, '1:1');
                results.push(`data:image/jpeg;base64,${imgBytes}`);
            }
            setImages(results);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <input type="text" className="flex-grow bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="Theme (e.g., Cyberpunk Noir)" value={theme} onChange={e => setTheme(e.target.value)} />
                <button onClick={handleGenerate} disabled={loading || !theme.trim()} className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Generating...' : 'Create Board'}</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[400px]">
                {loading ? <div className="col-span-full flex justify-center items-center"><Loader message="Curating visuals..." /></div> : images.length > 0 ? images.map((src, i) => <img key={i} src={src} alt="Mood" className="w-full h-full object-cover rounded-xl shadow-lg border border-slate-700" />) : <div className="col-span-full flex justify-center items-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">Enter a theme to generate mood images.</div>}
            </div>
            {images.length > 0 && (
                <ToolActions 
                    onShare={() => onShare({ contentUrl: images[0], contentText: `Mood Board: ${theme}`, contentType: 'image' })}
                    onDownload={() => {
                         const a = document.createElement('a');
                         a.href = images[0];
                         a.download = `moodboard_${theme}_01.jpg`;
                         a.click();
                    }}
                    onSave={() => {}}
                    onDiscard={() => setImages([])}
                />
            )}
        </div>
    );
};

// --- Sub-Component: Storyboards ---
const StoryboardTool = ({ onShare }: { onShare: any }) => {
    const [sceneDesc, setSceneDesc] = useState('');
    const [panels, setPanels] = useState<{img: string, text: string}[]>([]);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!sceneDesc.trim()) return;
        setLoading(true);
        try {
            // Generate visual descriptions first
            const textPrompt = `Break this scene into 3 storyboard panel descriptions: "${sceneDesc}". Return valid JSON array of strings.`;
            const textResp = await generateText(textPrompt, 'gemini-2.5-flash');
            let descriptions = [];
            try {
                const match = textResp.text.match(/\[.*\]/s);
                if (match) descriptions = JSON.parse(match[0]);
            } catch (e) {}
            
            if (descriptions.length === 0) descriptions = [sceneDesc];

            const newPanels = [];
            for (const desc of descriptions.slice(0, 3)) {
                const imgBytes = await generateImage(`Storyboard sketch, black and white, rough drawing style: ${desc}`, '16:9');
                newPanels.push({ img: `data:image/jpeg;base64,${imgBytes}`, text: desc });
            }
            setPanels(newPanels);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <input type="text" className="flex-grow bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="Scene Action (e.g., Hero jumps across the gap)" value={sceneDesc} onChange={e => setSceneDesc(e.target.value)} />
                <button onClick={handleGenerate} disabled={loading || !sceneDesc.trim()} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Sketching...' : 'Generate Storyboard'}</button>
            </div>
            {loading && <div className="h-64 flex items-center justify-center"><Loader message="Drawing panels..." /></div>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {panels.map((panel, i) => (
                    <div key={i} className="bg-white p-2 rounded-lg shadow-lg">
                        <img src={panel.img} alt={`Panel ${i+1}`} className="w-full border border-slate-200 mb-2" />
                        <p className="text-black text-xs font-mono">{panel.text}</p>
                    </div>
                ))}
            </div>
             {!loading && panels.length === 0 && <div className="h-64 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-500">Enter action to visualize scene sequence.</div>}
             {panels.length > 0 && (
                <ToolActions 
                    onShare={() => onShare({ contentText: `Storyboard for: ${sceneDesc}`, contentType: 'text' })}
                    onDownload={() => downloadFile('storyboard_desc.json', JSON.stringify(panels.map(p => p.text), null, 2))}
                    onSave={() => {}}
                    onDiscard={() => setPanels([])}
                />
             )}
        </div>
    );
};

// --- Sub-Component: Shot List ---
const ShotListTool = ({ onShare }: { onShare: any }) => {
    const [sceneDesc, setSceneDesc] = useState('');
    const [shots, setShots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!sceneDesc.trim()) return;
        setLoading(true);
        try {
             const prompt = `Create a shot list for: "${sceneDesc}". Return JSON array with shotNumber, type, angle, movement, description.`;
             const response = await generateText(prompt, 'gemini-2.5-flash');
             const jsonMatch = response.text.match(/\[.*\]/s);
             if (jsonMatch) setShots(JSON.parse(jsonMatch[0]));
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6">
             <div className="flex gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <input type="text" className="flex-grow bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="Scene Context" value={sceneDesc} onChange={e => setSceneDesc(e.target.value)} />
                <button onClick={handleGenerate} disabled={loading || !sceneDesc.trim()} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Listing...' : 'Generate List'}</button>
            </div>
            {shots.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-slate-700">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-800 text-slate-100 uppercase font-bold">
                            <tr><th className="px-6 py-3">#</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Angle</th><th className="px-6 py-3">Movement</th><th className="px-6 py-3">Description</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700 bg-slate-900/50">
                            {shots.map((shot, i) => (
                                <tr key={i} className="hover:bg-slate-800/50 transition"><td className="px-6 py-4 text-cyan-400">{shot.shotNumber || i + 1}</td><td className="px-6 py-4">{shot.type}</td><td className="px-6 py-4">{shot.angle}</td><td className="px-6 py-4">{shot.movement}</td><td className="px-6 py-4">{shot.description}</td></tr>
                            ))}
                        </tbody>
                    </table>
                    <ToolActions 
                        onShare={() => onShare({ contentText: JSON.stringify(shots, null, 2), contentType: 'text' })}
                        onDownload={() => downloadFile('shotlist.json', JSON.stringify(shots, null, 2))}
                        onSave={() => {}}
                        onDiscard={() => setShots([])}
                    />
                </div>
            )}
             {shots.length === 0 && !loading && <div className="h-64 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-500">Define scene to list camera shots.</div>}
        </div>
    );
};

// --- Sub-Component: Production Schedule ---
const ProductionScheduleTool = ({ onShare }: { onShare: any }) => {
    const [details, setDetails] = useState('Short Film, 5 Days, 20 Scenes');
    const [schedule, setSchedule] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleGenerate = async () => {
        if (!details.trim()) return;
        setLoading(true);
        try {
            const prompt = `Create a shooting schedule for: ${details}. Table columns: Day, Date, Time, Scene/Activity, Cast, Location. Format as Markdown.`;
            const response = await generateText(prompt, 'gemini-2.5-flash');
            setSchedule(response.text);
            setIsEditing(false);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
             <div className="space-y-4 flex flex-col h-full bg-slate-800/30 p-6 rounded-xl border border-slate-700">
                <h3 className="font-bold text-white">Parameters</h3>
                <label className="block text-sm font-medium text-slate-400">Schedule Details</label>
                <textarea 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 flex-grow focus:ring-2 focus:ring-indigo-500 text-white resize-none"
                    value={details} 
                    onChange={e => setDetails(e.target.value)} 
                />
                <button onClick={handleGenerate} disabled={loading || !details.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Scheduling...' : 'Generate Schedule'}
                </button>
            </div>
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-700 shadow-lg flex-grow overflow-y-auto min-h-[400px] flex flex-col">
                <div className="flex-grow">
                {schedule ? (
                    isEditing ?
                    <textarea className="w-full h-full bg-slate-800 text-white p-4 rounded resize-none" value={schedule} onChange={e => setSchedule(e.target.value)} /> :
                    <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: md.render(schedule) }} />
                ) : <div className="text-center text-slate-500 mt-20">Schedule will appear here.</div>}
                </div>
                 {schedule && <ToolActions 
                    onShare={() => onShare({ contentText: schedule, contentType: 'text' })}
                    onDownload={() => downloadFile('schedule.md', schedule)}
                    onEdit={() => setIsEditing(!isEditing)}
                    isEditing={isEditing}
                    onSave={() => {}}
                    onDiscard={() => setSchedule('')}
                />}
            </div>
        </div>
    );
};

// --- Sub-Component: Script Sides ---
const ScriptSidesTool = ({ onShare }: { onShare: any }) => {
    const [charName, setCharName] = useState('');
    const [scene, setScene] = useState('');
    const [sides, setSides] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleGenerate = async () => {
        if (!charName.trim() || !scene.trim()) return;
        setLoading(true);
        try {
            const prompt = `Generate script sides for character "${charName}" from scene context: "${scene}". Include only cue lines and their dialogue. Format clearly for actors.`;
            const response = await generateText(prompt, 'gemini-2.5-flash');
            setSides(response.text);
            setIsEditing(false);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-1 space-y-4 bg-slate-800/30 p-6 rounded-xl border border-slate-700 h-fit">
                <h3 className="font-bold text-white">Inputs</h3>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Character Name</label>
                    <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" value={charName} onChange={e => setCharName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Scene Context</label>
                    <textarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white h-32 resize-none" value={scene} onChange={e => setScene(e.target.value)} />
                </div>
                <button onClick={handleGenerate} disabled={loading || !charName.trim() || !scene.trim()} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Generating...' : 'Create Sides'}</button>
            </div>
            <div className="lg:col-span-2 bg-white text-black font-mono p-8 rounded-lg shadow-lg h-full overflow-y-auto flex flex-col min-h-[400px]">
                <div className="flex-grow">
                    {sides ? (
                        isEditing ? 
                        <textarea className="w-full h-full p-2 border border-gray-300 rounded resize-none focus:outline-none" value={sides} onChange={e => setSides(e.target.value)} /> :
                        <div className="whitespace-pre-wrap">{sides}</div>
                    ) : <div className="text-center text-gray-400 mt-20">Actor sides will appear here.</div>}
                </div>
                 {sides && (
                     <ToolActions 
                        onShare={() => onShare({ contentText: sides, contentType: 'text' })}
                        onDownload={() => downloadFile('sides.txt', sides)}
                        onEdit={() => setIsEditing(!isEditing)}
                        isEditing={isEditing}
                        onSave={() => {}}
                        onDiscard={() => setSides('')}
                    />
                 )}
            </div>
        </div>
    );
};

// --- Sub-Component: Contacts ---
const ContactsTool = ({ onShare }: { onShare: any }) => {
    const [list, setList] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const prompt = `Generate a template Production Contact List for a standard film crew. Include departments (Production, Camera, Sound, Art, G&E) and typical roles. Leave placeholders for Names/Phones. Format as Markdown Table.`;
            const response = await generateText(prompt, 'gemini-2.5-flash');
            setList(response.text);
            setIsEditing(false);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4 flex justify-end"><button onClick={handleGenerate} disabled={loading} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Generate Template</button></div>
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-700 flex-grow overflow-y-auto min-h-[400px]">
                {list ? (
                    <>
                         {isEditing ? 
                            <textarea className="w-full h-96 bg-slate-800 text-white p-4 rounded font-mono resize-none" value={list} onChange={e => setList(e.target.value)} /> :
                            <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: md.render(list) }} />
                        }
                        <ToolActions 
                            onShare={() => onShare({ contentText: list, contentType: 'text' })}
                            onDownload={() => downloadFile('contacts.md', list)}
                            onEdit={() => setIsEditing(!isEditing)}
                            isEditing={isEditing}
                            onSave={() => {}}
                            onDiscard={() => setList('')}
                        />
                    </>
                ) : <div className="text-center text-slate-500 mt-20">Contact list template.</div>}
            </div>
        </div>
    );
};

// --- Sub-Component: Task Board ---
const TaskBoardTool = () => {
    const [tasks, setTasks] = useState<{id: number, text: string, status: 'todo'|'doing'|'done'}[]>([
        { id: 1, text: 'Lock script', status: 'done' },
        { id: 2, text: 'Cast lead actor', status: 'doing' },
        { id: 3, text: 'Scout locations', status: 'todo' }
    ]);
    const [newTask, setNewTask] = useState('');

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask, status: 'todo' }]);
        setNewTask('');
    };

    const moveTask = (id: number, newStatus: 'todo'|'doing'|'done') => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    };

    const Column = ({ status, title, color }: { status: string, title: string, color: string }) => (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex-1 min-w-[250px]">
            <h4 className={`font-bold mb-4 ${color} uppercase text-xs tracking-wider border-b border-slate-700 pb-2`}>{title}</h4>
            <div className="space-y-3">
                {tasks.filter(t => t.status === status).map(t => (
                    <div key={t.id} className="bg-slate-700 p-3 rounded shadow text-sm text-white flex justify-between group">
                        <span>{t.text}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            {status !== 'todo' && <button onClick={() => moveTask(t.id, status === 'done' ? 'doing' : 'todo')} className="text-slate-400 hover:text-white">←</button>}
                            {status !== 'done' && <button onClick={() => moveTask(t.id, status === 'todo' ? 'doing' : 'done')} className="text-slate-400 hover:text-white">→</button>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                <input type="text" className="flex-grow bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" placeholder="New Task" value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} />
                <button onClick={addTask} disabled={!newTask.trim()} className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed">Add</button>
            </div>
            <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-x-auto pb-2">
                <Column status="todo" title="To Do" color="text-slate-400" />
                <Column status="doing" title="In Progress" color="text-cyan-400" />
                <Column status="done" title="Done" color="text-green-400" />
            </div>
        </div>
    );
};

// --- Sub-Component: Calendar ---
const CalendarTool = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const [events, setEvents] = useState<{day: number, text: string, color: string}[]>([
        {day: 4, text: 'Script Deadline', color: 'bg-red-900/50 text-red-200'},
        {day: 12, text: 'Shoot Day 1', color: 'bg-cyan-900/50 text-cyan-200'},
        {day: 13, text: 'Shoot Day 2', color: 'bg-cyan-900/50 text-cyan-200'},
    ]);

    const addEvent = (day: number) => {
        const text = prompt("Event Name:");
        if(text) {
            setEvents([...events, {day, text, color: 'bg-slate-600/50 text-white'}]);
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="grid grid-cols-7 gap-px bg-slate-700 rounded-t-lg overflow-hidden">
                {days.map(d => <div key={d} className="bg-slate-800 p-2 text-center text-xs font-bold text-slate-400 uppercase">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-700 flex-grow border border-slate-700">
                {Array.from({ length: 35 }).map((_, i) => {
                    const day = i + 1;
                    if(day > 31) return <div key={i} className="bg-slate-900/50"></div>;
                    const dayEvents = events.filter(e => e.day === day);
                    
                    return (
                        <div key={i} className="bg-slate-900 min-h-[80px] p-2 relative group hover:bg-slate-800 transition cursor-pointer" onClick={() => addEvent(day)}>
                            <span className="text-xs text-slate-500 font-mono">{day}</span>
                            <div className="space-y-1 mt-1">
                                {dayEvents.map((ev, idx) => (
                                    <div key={idx} className={`${ev.color} text-[10px] p-1 rounded truncate`}>{ev.text}</div>
                                ))}
                            </div>
                             <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-slate-500 text-xs">+</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Sub-Component: File Sharing ---
const FileSharingTool = () => {
    const [files, setFiles] = useState([
        { name: 'script_v4_final.pdf', size: '1.2 MB', date: 'Oct 24' },
        { name: 'location_photos.zip', size: '45 MB', date: 'Oct 22' },
        { name: 'cast_headshots.pdf', size: '8 MB', date: 'Oct 20' },
    ]);

    const uploadFile = () => {
        setFiles([{ name: `upload_${Date.now()}.pdf`, size: '0.5 MB', date: 'Just now' }, ...files]);
    };
    
    const downloadFile = (name: string) => {
        const dummyContent = "Dummy file content for demonstration.";
        const blob = new Blob([dummyContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4 h-full">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-white">Project Files</h3>
                <button onClick={uploadFile} className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-cyan-500 transition">Upload File</button>
            </div>
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-800 uppercase font-bold text-xs text-slate-400">
                        <tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Size</th><th className="px-6 py-3">Date</th><th className="px-6 py-3"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {files.map((f, i) => (
                            <tr key={i} className="hover:bg-slate-700/30 transition">
                                <td className="px-6 py-4 font-medium text-white flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                    {f.name}
                                </td>
                                <td className="px-6 py-4">{f.size}</td>
                                <td className="px-6 py-4">{f.date}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => downloadFile(f.name)} className="text-cyan-400 hover:underline hover:text-cyan-300">Download</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Sub-Component: Call Sheet ---
const CallSheetTool = ({ onShare }: { onShare: any }) => {
    const [details, setDetails] = useState({ title: '', date: '', location: '' });
    const [sheet, setSheet] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleGenerate = async () => {
        if (!details.title.trim()) return;
        setLoading(true);
        try {
            const prompt = `Generate a film Call Sheet. Title: ${details.title}, Date: ${details.date}, Loc: ${details.location}. Include Weather, Hospital, Schedule, Cast, Crew. Format: Markdown tables.`;
            const response = await generateText(prompt, 'gemini-2.5-flash');
            setSheet(response.text);
            setIsEditing(false);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
             <div className="lg:col-span-1 space-y-4 bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-fit">
                <h3 className="font-bold text-white mb-2">Shoot Details</h3>
                <input type="text" placeholder="Project Title" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" onChange={e => setDetails({...details, title: e.target.value})} />
                <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" onChange={e => setDetails({...details, date: e.target.value})} />
                <input type="text" placeholder="Location" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" onChange={e => setDetails({...details, location: e.target.value})} />
                <button onClick={handleGenerate} disabled={loading || !details.title.trim()} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Generating...' : 'Build Call Sheet'}
                </button>
            </div>
            <div className="lg:col-span-2 bg-white text-slate-900 p-8 rounded-xl shadow-xl overflow-y-auto max-h-[600px] flex flex-col">
                <div className="flex-grow">
                    {sheet ? (
                        isEditing ? 
                        <textarea className="w-full h-full p-2 border border-gray-300 rounded resize-none" value={sheet} onChange={e => setSheet(e.target.value)} /> :
                        <div className="prose prose-sm max-w-none font-sans" dangerouslySetInnerHTML={{ __html: md.render(sheet) }} />
                    ) : <div className="text-center text-slate-400 mt-20">Call sheet preview.</div>}
                </div>
                {sheet && (
                    <ToolActions 
                        onShare={() => onShare({ contentText: sheet, contentType: 'text' })}
                        onDownload={() => downloadFile('call_sheet.md', sheet)}
                        onEdit={() => setIsEditing(!isEditing)}
                        isEditing={isEditing}
                        onSave={() => {}}
                        onDiscard={() => setSheet('')}
                    />
                )}
            </div>
        </div>
    );
};


const ProductionPlanner: React.FC<ProductionPlannerProps> = ({ onShare }) => {
    const [activeTool, setActiveTool] = useState<ToolId>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Grouped Menu Structure
    const menuGroups = [
        {
            title: "Start",
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            ]
        },
        {
            title: "Write",
            items: [
                { id: 'screenwriting', label: 'Screenwriting', icon: '✍️' },
                { id: 'av-scripts', label: 'AV Scripts', icon: '🎬' },
            ]
        },
        {
            title: "Breakdown",
            items: [
                { id: 'script-breakdowns', label: 'Script Breakdowns', icon: '🔍' },
            ]
        },
        {
            title: "Visualize",
            items: [
                { id: 'shot-lists', label: 'Shot Lists', icon: '🎥' },
                { id: 'storyboards', label: 'Storyboards', icon: '🖼️' },
                { id: 'mood-boards', label: 'Mood Boards', icon: '🎨' },
            ]
        },
        {
            title: "Plan",
            items: [
                { id: 'contacts', label: 'Contacts', icon: '👥' },
                { id: 'task-boards', label: 'Task Boards', icon: '✅' },
                { id: 'calendar', label: 'Calendar', icon: '🗓️' },
                { id: 'files', label: 'File Sharing', icon: '📁' },
            ]
        },
         {
            title: "Shoot",
            items: [
                { id: 'call-sheet', label: 'Call Sheet Builder', icon: '📋' },
                { id: 'shooting-schedules', label: 'Shooting Schedules', icon: '📅' },
                { id: 'script-sides', label: 'Script Sides', icon: '📄' },
            ]
        },
    ];

    const renderTool = () => {
        switch(activeTool) {
            case 'dashboard': return <DashboardTool onChangeTool={setActiveTool} menuGroups={menuGroups} />;
            case 'call-sheet': return <CallSheetTool onShare={onShare} />;
            case 'screenwriting': return <ScreenwriterTool onShare={onShare} />;
            case 'av-scripts': return <AvScriptTool onShare={onShare} />;
            case 'shot-lists': return <ShotListTool onShare={onShare} />;
            case 'storyboards': return <StoryboardTool onShare={onShare} />;
            case 'mood-boards': return <MoodBoardTool onShare={onShare} />;
            case 'script-breakdowns': return <ScriptBreakdownTool onShare={onShare} />;
            case 'shooting-schedules': return <ProductionScheduleTool onShare={onShare} />;
            case 'script-sides': return <ScriptSidesTool onShare={onShare} />;
            case 'contacts': return <ContactsTool onShare={onShare} />;
            case 'task-boards': return <TaskBoardTool />;
            case 'calendar': return <CalendarTool />;
            case 'files': return <FileSharingTool />;
            default: return <DashboardTool onChangeTool={setActiveTool} menuGroups={menuGroups} />;
        }
    };

    const currentTitle = menuGroups.flatMap(g => g.items).find(i => i.id === activeTool)?.label;

    return (
        <div className="flex h-[calc(100vh-8rem)] overflow-hidden bg-slate-950 rounded-xl border border-slate-800">
            {/* Sidebar */}
            <div className={`flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
                <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 flex justify-between items-center">
                    <h3 className="font-bold text-white">Production Tools</h3>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white lg:hidden">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <div className="overflow-y-auto h-full pb-20">
                    {menuGroups.map((group, idx) => (
                        <div key={idx} className="mb-2">
                            <h4 className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{group.title}</h4>
                            {group.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTool(item.id as ToolId)}
                                    className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 hover:bg-slate-800 transition-colors ${activeTool === item.id ? 'bg-slate-800 text-cyan-400 border-r-2 border-cyan-400' : 'text-slate-400'}`}
                                >
                                    <span>{item.icon}</span>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col min-w-0">
                {/* Header */}
                <div className="h-16 border-b border-slate-800 flex items-center px-6 bg-slate-900/50">
                    {!isSidebarOpen && (
                        <button onClick={() => setIsSidebarOpen(true)} className="mr-4 p-2 rounded-md hover:bg-slate-800 text-slate-400 transition" title="Open Menu">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`mr-4 p-2 rounded-md hover:bg-slate-800 text-slate-400 transition hidden lg:block`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <h2 className="text-xl font-bold text-white">{currentTitle}</h2>
                </div>

                {/* Tool View */}
                <div className="flex-grow overflow-y-auto p-6 bg-grid-slate-900/50">
                    {renderTool()}
                </div>
            </div>
        </div>
    );
};

export default ProductionPlanner;
