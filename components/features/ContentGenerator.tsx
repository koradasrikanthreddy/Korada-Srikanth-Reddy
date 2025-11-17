import React, { useState, useMemo } from 'react';
import { generateText } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';
import { EXPANDED_CONTENT_TYPES, BaseContentType, DetailedContentType } from '../../constants';


const md = new Remarkable({ html: true });

interface ContentGeneratorProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

// --- Helper Components for Form ---
const Input: React.FC<{ name: string, label: string, placeholder: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, value?: string, required?: boolean }> = ({ name, label, placeholder, onChange, value, required = true }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <input type="text" id={name} name={name} value={value || ''} onChange={onChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder={placeholder} required={required} />
    </div>
);

const Textarea: React.FC<{ name: string, label: string, placeholder: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, value?: string, rows?: number, required?: boolean }> = ({ name, label, placeholder, onChange, value, rows = 3, required = true }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <textarea id={name} name={name} value={value || ''} onChange={onChange} rows={rows} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder={placeholder} required={required} />
    </div>
);

const Select: React.FC<{ name: string, label: string, options: string[], onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, value?: string }> = ({ name, label, options, onChange, value }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <select id={name} name={name} value={value || ''} onChange={onChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500">
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);


// --- Main Component ---
const ContentGenerator: React.FC<ContentGeneratorProps> = ({ onShare }) => {
    const [selectedTypeId, setSelectedTypeId] = useState<string>('blog-post');
    const [inputs, setInputs] = useState<Record<string, string>>({
        tone: 'Informative',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');
    
    const allTypes = useMemo(() => Object.values(EXPANDED_CONTENT_TYPES).flat(), []);
    const selectedType = useMemo(() => allTypes.find(t => t.id === selectedTypeId), [selectedTypeId, allTypes]);
    const baseType = selectedType?.baseType;

    const displayToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 2000);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const generatePrompt = () => {
        if (!selectedType) return '';
        const promptHint = selectedType.promptHint || '';

        switch (baseType) {
            case 'blog-post':
                return `Generate a comprehensive, well-structured blog post ${promptHint} about "${inputs.topic}".
                Keywords to include: ${inputs.keywords || 'N/A'}.
                Optional Outline: ${inputs.outline || 'Standard blog post structure (introduction, multiple body paragraphs with subheadings, conclusion)'}.
                The tone should be ${inputs.tone || 'informative'}.
                Format the response in Markdown with a main title (H1), headings for sections (H2), and sub-headings (H3) if necessary. Use bold for key terms.`;
            case 'social-media':
                return `Create an engaging social media post ${promptHint} for ${inputs.platform || 'any platform'}.
                Topic: "${inputs.topic}".
                Tone: ${inputs.tone || 'engaging'}.
                Please include 3-5 relevant hashtags. The post should be concise and impactful, suitable for the chosen platform.`;
            case 'ad-copy':
                return `Write compelling ad copy ${promptHint} for a marketing campaign.
                Product/Service Name: ${inputs.product}.
                Brief Description: ${inputs.description}.
                Target Audience: ${inputs.audience}.
                Call to Action: ${inputs.cta}.
                Generate two distinct variations if applicable: one short and punchy, and one slightly more descriptive.`;
            case 'video-script':
                return `Write a script for a short ${inputs.style || 'promotional'} video ${promptHint}.
                Topic: "${inputs.topic}".
                Key Talking Points to cover:\n${inputs.points}.
                The script should be structured with scene numbers, visual cues (in parentheses), and dialogue/voiceover text.`;
            case 'creative':
                return `Write a creative piece ${promptHint}.
                Style: ${inputs.style || 'prose'}.
                Prompt: "${inputs.prompt}".
                Focus on vivid imagery and compelling language.`;
            case 'product-description':
                return `Write a persuasive and detailed product description for "${inputs.productName}" ${promptHint}.
                Key Features:
                - ${inputs.features?.split('\n').join('\n- ')}
                The tone should be ${inputs.tone || 'enthusiastic'}.
                The description should highlight the benefits of each feature and be formatted in Markdown with a clear heading and bullet points.`;
            case 'email-newsletter':
                 return `Draft an engaging email newsletter ${promptHint}.
                Subject Line: "${inputs.subject}"
                Target Audience: ${inputs.audience}
                Main Points to Cover:
                - ${inputs.mainPoints?.split('\n').join('\n- ')}
                Call to Action: ${inputs.cta}
                The email should have a friendly and conversational tone, with a clear structure (greeting, body, closing).`;
            case 'press-release':
                 return `Generate a professional press release ${promptHint} in AP style.
                Company Name: ${inputs.companyName}.
                Headline: "${inputs.headline}".
                Dateline: ${inputs.dateline || 'CITY, State – DATE'}.
                Summary (First Paragraph - Who, What, When, Where, Why): ${inputs.summary}.
                Include a compelling quote from a company spokesperson: "${inputs.quote}".
                The press release must include a boilerplate about the company, a media contact section, and "###" to signify the end.`;
            case 'case-study':
                return `Write a compelling case study ${promptHint}.
                Company Name: ${inputs.companyName}
                Customer Name: ${inputs.customerName}
                The Problem/Challenge: ${inputs.problem}
                The Solution Provided: ${inputs.solution}
                The Results (include metrics): ${inputs.results}
                Structure the case study with clear sections: Summary, The Challenge, The Solution, The Results, and a concluding paragraph. Use Markdown for formatting.`;
            default:
                return '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const prompt = generatePrompt();
        if (!prompt) {
            setError('Invalid content type.');
            return;
        }
        
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await generateText(prompt, 'gemini-2.5-pro');
            setResult(response.text);
        } catch (err) {
            setError('Failed to generate content. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const renderInputs = () => {
        switch (baseType) {
            case 'blog-post':
                return (
                    <>
                        <Input name="topic" label="Topic / Title" placeholder="e.g., The Future of AI" onChange={handleInputChange} value={inputs.topic}/>
                        <Input name="keywords" label="Keywords (optional)" placeholder="e.g., artificial intelligence, machine learning" onChange={handleInputChange} value={inputs.keywords} required={false}/>
                        <Select name="tone" label="Tone" options={['Informative', 'Casual', 'Formal', 'Humorous', 'Persuasive']} onChange={handleInputChange} value={inputs.tone} />
                        <Textarea name="outline" label="Outline (optional)" rows={4} placeholder="- Intro: What is AI?&#10;- Body: Key advancements&#10;- Conclusion: Future implications" onChange={handleInputChange} value={inputs.outline} required={false}/>
                    </>
                );
            case 'social-media':
                return (
                    <>
                        <Input name="topic" label="Topic" placeholder="e.g., Announcing our new feature" onChange={handleInputChange} value={inputs.topic}/>
                        <Select name="platform" label="Platform" options={['X', 'LinkedIn', 'Instagram', 'Facebook', 'Any Platform']} onChange={handleInputChange} value={inputs.platform} />
                        <Select name="tone" label="Tone" options={['Professional', 'Casual', 'Witty', 'Persuasive', 'Inspirational']} onChange={handleInputChange} value={inputs.tone}/>
                    </>
                );
            case 'ad-copy':
                 return (
                    <>
                        <Input name="product" label="Product/Service Name" placeholder="e.g., AI Creative Suite" onChange={handleInputChange} value={inputs.product}/>
                        <Textarea name="description" label="Brief Description" placeholder="e.g., A suite of AI-powered tools..." onChange={handleInputChange} value={inputs.description}/>
                        <Input name="audience" label="Target Audience" placeholder="e.g., Designers, marketers, content creators" onChange={handleInputChange} value={inputs.audience}/>
                        <Input name="cta" label="Call to Action" placeholder="e.g., Sign up for free" onChange={handleInputChange} value={inputs.cta}/>
                    </>
                );
            case 'video-script':
                return (
                    <>
                        <Input name="topic" label="Topic" placeholder="e.g., Introduction to our new app" onChange={handleInputChange} value={inputs.topic}/>
                        <Select name="style" label="Video Style" options={['Promotional', 'Tutorial', 'Explainer', 'Testimonial']} onChange={handleInputChange} value={inputs.style}/>
                        <Textarea name="points" label="Key Talking Points" rows={5} placeholder="- Highlight problem&#10;- Introduce solution (our product)&#10;- Show key features&#10;- End with a strong call to action" onChange={handleInputChange} value={inputs.points}/>
                    </>
                );
            case 'creative':
                return (
                    <>
                         <Select name="style" label="Style" options={['Short Story', 'Poem', 'Dialogue', 'Monologue', 'Prose']} onChange={handleInputChange} value={inputs.style}/>
                         <Textarea name="prompt" label="Prompt" rows={6} placeholder="e.g., A detective finds a mysterious clock that can stop time, but each use has a cost." onChange={handleInputChange} value={inputs.prompt}/>
                    </>
                );
            case 'product-description':
                return (
                    <>
                        <Input name="productName" label="Product Name" placeholder="e.g., Quantum Leap Sneakers" onChange={handleInputChange} value={inputs.productName} />
                        <Textarea name="features" label="Key Features (one per line)" placeholder="- Self-lacing technology&#10;- Graphene-infused sole" rows={4} onChange={handleInputChange} value={inputs.features} />
                        <Select name="tone" label="Tone" options={['Enthusiastic', 'Professional', 'Playful', 'Luxurious']} onChange={handleInputChange} value={inputs.tone} />
                    </>
                );
            case 'email-newsletter':
                 return (
                    <>
                        <Input name="subject" label="Subject Line" placeholder="e.g., This Week's AI Breakthroughs" onChange={handleInputChange} value={inputs.subject} />
                        <Input name="audience" label="Target Audience" placeholder="e.g., Tech enthusiasts and developers" onChange={handleInputChange} value={inputs.audience} />
                        <Textarea name="mainPoints" label="Main Points (one per line)" placeholder="- New product launch&#10;- Upcoming webinar announcement" rows={4} onChange={handleInputChange} value={inputs.mainPoints} />
                        <Input name="cta" label="Call to Action" placeholder="e.g., Register Now!" onChange={handleInputChange} value={inputs.cta} />
                    </>
                );
            case 'press-release':
                 return (
                    <>
                        <Input name="companyName" label="Company Name" placeholder="e.g., Quantum Innovations Inc." onChange={handleInputChange} value={inputs.companyName} />
                        <Input name="headline" label="Headline" placeholder="e.g., Quantum Innovations Launches First AI-Powered..." onChange={handleInputChange} value={inputs.headline} />
                        <Input name="dateline" label="Dateline (optional)" placeholder="e.g., SAN FRANCISCO – Oct. 26, 2023" onChange={handleInputChange} value={inputs.dateline} required={false} />
                        <Textarea name="summary" label="Summary Paragraph" placeholder="A brief summary of the announcement..." rows={3} onChange={handleInputChange} value={inputs.summary} />
                        <Input name="quote" label="Spokesperson Quote" placeholder="e.g., 'We are thrilled to...' - Jane Doe, CEO" onChange={handleInputChange} value={inputs.quote} />
                    </>
                );
            case 'case-study':
                 return (
                    <>
                        <Input name="companyName" label="Your Company Name" placeholder="e.g., AI Solutions Co." onChange={handleInputChange} value={inputs.companyName} />
                        <Input name="customerName" label="Customer Name" placeholder="e.g., Global Tech Ltd." onChange={handleInputChange} value={inputs.customerName} />
                        <Textarea name="problem" label="The Problem / Challenge" placeholder="e.g., Global Tech struggled with inefficient data processing..." rows={3} onChange={handleInputChange} value={inputs.problem} />
                        <Textarea name="solution" label="The Solution Provided" placeholder="e.g., AI Solutions Co. implemented a custom machine learning model..." rows={3} onChange={handleInputChange} value={inputs.solution} />
                        <Textarea name="results" label="Key Results & Metrics" placeholder="e.g., Achieved a 40% reduction in processing time..." rows={3} onChange={handleInputChange} value={inputs.results} />
                    </>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="flex flex-col md:flex-row gap-8">
            {toastMessage && (
                <div className="absolute top-24 right-10 bg-green-500 text-white py-2 px-4 rounded-lg animate-pulse z-20">
                    {toastMessage}
                </div>
            )}
            <div className="w-full md:w-1/3 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="content-type" className="block text-sm font-medium text-slate-300 mb-2">Content Type</label>
                        <select
                            id="content-type"
                            name="contentType"
                            value={selectedTypeId}
                            onChange={(e) => {
                                setSelectedTypeId(e.target.value);
                                setInputs({ tone: inputs.tone });
                                setResult(null);
                            }}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                        >
                            {Object.entries(EXPANDED_CONTENT_TYPES).map(([groupName, types]) => (
                                <optgroup label={groupName} key={groupName}>
                                    {types.map(type => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    {renderInputs()}
                    <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                           <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                        <span>{loading ? 'Generating...' : 'Generate Content'}</span>
                    </button>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </form>
            </div>
            <div className="w-full md:w-2/3 flex flex-col bg-slate-800 rounded-lg border border-slate-700 min-h-[400px]">
                <div className="flex-shrink-0 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Generated Content</h3>
                    {result && (
                        <div className="flex items-center space-x-2">
                             <button onClick={() => { navigator.clipboard.writeText(result); displayToast('Copied to clipboard!'); }} className="flex items-center space-x-2 bg-slate-700 text-white font-semibold py-2 px-3 rounded-lg hover:bg-slate-600 transition-colors duration-300 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                                <span>Copy</span>
                            </button>
                            <button onClick={() => onShare({ contentText: result, contentType: 'text' })} className="flex items-center space-x-2 bg-purple-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                <span>Share</span>
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex-grow p-6 overflow-y-auto prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white prose-a:text-cyan-400">
                    {loading && <Loader message="AI is crafting your content..." />}
                    {!loading && !result && <div className="flex items-center justify-center h-full"><p className="text-slate-500">Your generated content will appear here.</p></div>}
                    {result && <div dangerouslySetInnerHTML={{ __html: md.render(result) }} />}
                </div>
            </div>
        </div>
    );
};

export default ContentGenerator;