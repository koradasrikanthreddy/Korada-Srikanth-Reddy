
import React from 'react';

interface ApiKeyDialogProps {
  onSelectKey: () => void;
  show: boolean;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onSelectKey, show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl shadow-cyan-500/10">
        <h2 className="text-2xl font-bold text-white mb-4">API Key Required for Veo</h2>
        <p className="text-slate-400 mb-6">
          To generate videos with Veo, you need to select an API key associated with a project that has billing enabled.
        </p>
        <div className="flex flex-col space-y-4">
          <button
            onClick={onSelectKey}
            className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
          >
            Select API Key
          </button>
           <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-sm text-cyan-400 hover:text-cyan-300 underline"
          >
            Learn more about billing
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyDialog;
