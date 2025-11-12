import React from 'react';
import Spinner from './Spinner';
import { BrainIcon } from '../constants';

interface JournalAIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  analysisResult: string | null;
}

const JournalAIAnalysisModal: React.FC<JournalAIAnalysisModalProps> = ({ isOpen, onClose, isLoading, analysisResult }) => {
  if (!isOpen) return null;

  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      line = line.trim();
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold text-gray-800 dark:text-white mt-4 mb-2">{line.replace(/### /g, '')}</h3>;
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li key={index} className="ml-5 list-disc text-gray-600 dark:text-gray-400">{line.substring(2)}</li>;
      }
      return <p key={index} className="text-gray-600 dark:text-gray-400 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 max-w-2xl w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
            <BrainIcon className="h-6 w-6 text-brand-blue" />
            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">AI Psychologist Report</h2>
        </div>
        
        <div className="min-h-[250px] max-h-[60vh] overflow-y-auto pr-2">
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full">
                    <Spinner />
                    <p className="mt-4 text-gray-500 dark:text-gray-400">Analyzing your trading patterns...</p>
                </div>
            )}
            {analysisResult && (
                 <div className="prose dark:prose-invert max-w-none">{renderContent(analysisResult)}</div>
            )}
        </div>

        <div className="mt-6 text-right">
             <button onClick={onClose} className="bg-brand-blue text-white font-bold py-2 px-6 rounded-md hover:bg-blue-600 transition-colors">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default JournalAIAnalysisModal;
