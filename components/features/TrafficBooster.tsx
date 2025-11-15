import React, { useState } from 'react';
import { 
    generateSeoContentPlan,
    generateArticleFromOutline,
    generateFaqSchema,
    generateSocialMediaPack
} from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

interface TrafficBoosterProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

interface SeoPlan {
    topicCluster: string[];
    faqs: { question: string; answer: string }[];
    semanticKeywords: string[];
    contentOutline: { heading: string; points: string[] }[];
}

interface SocialPost {
    platform: string;
    post: string;
}

const TrafficBooster: React.FC<TrafficBoosterProps> = ({ onShare }) => {
    const [topic, setTopic] = useState('');
    const [audience, setAudience] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [plan, setPlan] = useState<SeoPlan | null>(null);
    const [article, setArticle] = useState<string | null>(null);
    const [faqSchema, setFaqSchema] = useState<string | null>(null);
    const [socialPosts, setSocialPosts] = useState<SocialPost[] | null>(null);

    const [loadingArticle, setLoadingArticle] = useState(false);
    const [loadingSchema, setLoadingSchema] = useState(false);
    const [loadingSocial, setLoadingSocial] = useState(false);

    const [toastMessage, setToastMessage] = useState('');

    const displayToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 2000);
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        displayToast('Copied to clipboard!');
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic || !audience) {
            setError('Please provide both a topic and a target audience.');
            return;
        }
        setLoading(true);
        setError(null);
        setPlan(null);
        setArticle(null);
        setFaqSchema(null);
        setSocialPosts(null);

        try {
            const response = await generateSeoContentPlan(topic, audience);
            const parsedResult: SeoPlan = JSON.parse(response.text);
            setPlan(parsedResult);
        } catch (err) {
            setError('Failed to generate SEO plan. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateArticle = async () => {
        if (!plan?.contentOutline || !topic) return;
        setLoadingArticle(true);
        setArticle(null);
        try {
            const response = await generateArticleFromOutline(topic, plan.contentOutline);
            setArticle(response.text);
        } catch (err) {
            setError('Failed to generate the article.');
        } finally {
            setLoadingArticle(false);
        }
    };
    
    const handleGenerateFaqSchema = async () => {
        if (!plan?.faqs) return;
        setLoadingSchema(true);
        setFaqSchema(null);
        try {
            const response = await generateFaqSchema(plan.faqs);
            const schemaText = response.text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            setFaqSchema(JSON.stringify(JSON.parse(schemaText), null, 2));
        } catch(err) {
            setError('Failed to generate schema.');
        } finally {
            setLoadingSchema(false);
        }
    };

    const handleGenerateSocialPosts = async () => {
        if (!article || !topic) return;
        setLoadingSocial(true);
        setSocialPosts(null);
        try {
            const articleSummary = article.substring(0, 300) + '...';
            const response = await generateSocialMediaPack(topic, articleSummary);
            const posts = JSON.parse(response.text.replace(/^```json\s*/, '').replace(/\s*```$/, ''));
            setSocialPosts(posts);
        } catch(err) {
            setError('Failed to generate social posts.');
        } finally {
            setLoadingSocial(false);
        }
    };

    const fullShareText = () => {
        if (!plan) return '';
        let text = `SEO Content Plan for: ${topic}\nTarget Audience: ${audience}\n\n`;
        if (plan.topicCluster) text += `## Topic Cluster\n${plan.topicCluster.map(item => `- ${item}`).join('\n')}\n\n`;
        if (article) text += `## Full Article\n${article}\n\n`;
        if (socialPosts) text += `## Social Posts\n${socialPosts.map(p => `### ${p.platform}\n${p.post}`).join('\n\n')}\n\n`;
        if (faqSchema) text += `## FAQ Schema\n\`\`\`json\n${faqSchema}\n\`\`\`\n\n`;
        return text.trim();
    };

    return (
        <div className="space-y-8 relative">
             {toastMessage && (
                <div className="fixed top-24 right-10 bg-green-500 text-white py-2 px-4 rounded-lg animate-pulse z-20">
                    {toastMessage}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <fieldset disabled={loading} className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">Topic / Main Keyword</label>
                            <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., 'sustainable fashion'" />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="audience" className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
                            <input id="audience" type="text" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., 'eco-conscious millennials'" />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z"></path></svg>
                        <span>{loading ? 'Generating Plan...' : 'Generate SEO Plan'}</span>
                    </button>
                </fieldset>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>
            
            {loading && <Loader message="Generating a data-driven SEO strategy..." />}

            {plan && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Generated Content Plan</h2>
                        <button onClick={() => onShare({ contentText: fullShareText(), contentType: 'text' })} className="flex items-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                            <span>Share Full Report</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3"><h3 className="text-lg font-bold text-cyan-400">Topic Cluster</h3><div className="flex flex-wrap gap-2">{plan.topicCluster.map(item => (<span key={item} className="bg-slate-700/50 text-slate-300 text-sm py-1 px-3 rounded-full">{item}</span>))}</div></div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3"><h3 className="text-lg font-bold text-cyan-400">Semantic Keywords</h3><div className="flex flex-wrap gap-2">{plan.semanticKeywords.map(item => (<span key={item} className="bg-slate-700/50 text-slate-300 text-sm py-1 px-3 rounded-full">{item}</span>))}</div></div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 lg:col-span-2"><h3 className="text-lg font-bold text-cyan-400 mb-3">Content Outline</h3><div className="space-y-4">{plan.contentOutline.map((s, i) => (<div key={i}><h4 className="font-semibold text-slate-100">{s.heading}</h4><ul className="list-disc list-inside space-y-1 mt-1 pl-2 text-sm text-slate-400">{s.points.map(p => <li key={p}>{p}</li>)}</ul></div>))}</div><div className="mt-4 pt-3 border-t border-slate-700"><button onClick={handleGenerateArticle} disabled={loadingArticle} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-slate-600 transition-colors">{loadingArticle ? 'Generating Article...' : '✨ Generate Full Article'}</button></div></div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 lg:col-span-2"><h3 className="text-lg font-bold text-cyan-400 mb-3">FAQs</h3><div className="space-y-2">{plan.faqs.map((faq, i) => (<details key={i} className="bg-slate-800 p-3 rounded-lg text-sm"><summary className="font-semibold text-slate-200 cursor-pointer">{faq.question}</summary><p className="mt-2 text-slate-400">{faq.answer}</p></details>))}</div><div className="mt-4 pt-3 border-t border-slate-700"><button onClick={handleGenerateFaqSchema} disabled={loadingSchema} className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-600 transition-colors">{loadingSchema ? 'Generating Schema...' : '📄 Generate FAQPage Schema'}</button></div></div>
                    </div>

                    {(loadingArticle || article) && (
                        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4">Generated Article</h3>
                            {loadingArticle && <Loader message="Writing your article..." />}
                            {article && <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white"><div dangerouslySetInnerHTML={{ __html: md.render(article) }} /></div>}
                            {article && <div className="mt-6 pt-4 border-t border-slate-700"><button onClick={handleGenerateSocialPosts} disabled={loadingSocial} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-600 transition-colors">{loadingSocial ? 'Generating Posts...' : '🚀 Generate Social Media Pack'}</button></div>}
                        </div>
                    )}
                    
                     {(loadingSocial || socialPosts) && (
                        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4">Social Media Pack</h3>
                            {loadingSocial && <Loader message="Crafting social posts..." />}
                            {socialPosts && <div className="space-y-4">{socialPosts.map((p, i) => (<div key={i} className="bg-slate-800 p-4 rounded-lg"><div className="flex justify-between items-center mb-2"><h4 className="font-bold text-cyan-400">{p.platform}</h4><button onClick={() => handleCopyToClipboard(p.post)} className="text-xs bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1 px-3 rounded-full">Copy</button></div><p className="text-sm text-slate-300 whitespace-pre-wrap">{p.post}</p></div>))}</div>}
                        </div>
                    )}

                    {(loadingSchema || faqSchema) && (
                        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4">FAQPage JSON-LD Schema</h3>
                            {loadingSchema && <Loader message="Generating schema..." />}
                            {faqSchema && <div><pre className="text-xs bg-slate-950 p-4 rounded-lg overflow-x-auto text-green-300 whitespace-pre-wrap">{faqSchema}</pre><div className="text-center mt-4"><button onClick={() => handleCopyToClipboard(faqSchema)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg">Copy Schema</button></div></div>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrafficBooster;