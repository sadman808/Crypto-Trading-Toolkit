
import React, { useState, useEffect } from 'react';
import { AIInsights, Recommendation } from '../types';
import { CheckIcon } from '../constants';

interface AIAssistantPanelProps {
  insights: AIInsights | null;
  isLoading: boolean;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ insights, isLoading }) => {
  if (isLoading) {
    return <AIAssistantSkeleton />;
  }

  if (!insights) {
    return (
        <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[300px] shadow-lg">
            <span className="text-3xl mb-4">🤖</span>
            <h3 className="text-lg font-bold text-gray-400">AI Risk Assistant is waiting</h3>
            <p className="text-gray-500">Your AI-powered analysis will appear here after calculation.</p>
        </div>
    );
  }

  const { recommendation, suitabilityScore, summary, warnings, checklist } = insights;
  
  const getRecommendationStyles = (rec: Recommendation) => {
    switch (rec) {
      case Recommendation.Proceed: return { bg: 'bg-green-500/10', text: 'text-green-400', button: 'bg-green-600 hover:bg-green-700' };
      case Recommendation.ReduceSize: return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', button: 'bg-yellow-600 hover:bg-yellow-700' };
      case Recommendation.Skip: return { bg: 'bg-red-500/10', text: 'text-red-400', button: 'bg-red-600 hover:bg-red-700' };
      default: return { bg: 'bg-gray-700', text: 'text-gray-300', button: 'bg-gray-600 hover:bg-gray-700' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  }

  const recStyles = getRecommendationStyles(recommendation);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xl">🤖</span>
        <h2 className="text-xl font-bold font-display text-white">AI Risk Assistant</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-gray-800/50 p-4 rounded-lg mb-6">
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-400 mb-1">Recommendation</p>
          <button className={`px-6 py-2 rounded-md font-bold text-white transition-colors ${recStyles.button}`}>
            {recommendation}
          </button>
        </div>
        <div className="text-center md:text-right">
          <p className="text-sm text-gray-400 mb-1">Suitability Score</p>
          <p className={`text-6xl font-bold font-display ${getScoreColor(suitabilityScore)}`}>{suitabilityScore}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-md font-semibold text-gray-300 mb-2">AI Summary</h3>
        <p className="text-gray-400 leading-relaxed">{summary}</p>
      </div>

      {warnings && warnings.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold text-yellow-400 mb-2">Potential Warnings</h3>
          <ul className="list-disc list-inside space-y-1 text-yellow-500">
            {warnings.map((warning, index) => <li key={index}>{warning}</li>)}
          </ul>
        </div>
      )}

      {checklist && checklist.length > 0 && <PreTradeChecklist initialItems={checklist} />}
    </div>
  );
};

const PreTradeChecklist = ({ initialItems }: { initialItems: AIInsights['checklist'] }) => {
    const [items, setItems] = useState(initialItems);

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const handleCheck = (index: number) => {
        const newItems = [...items];
        newItems[index].checked = !newItems[index].checked;
        setItems(newItems);
    };

    return (
        <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-300 mb-3">Pre-Trade Checklist</h3>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <label key={index} htmlFor={`checklist-${index}`} className="flex items-center cursor-pointer p-3 bg-gray-800/50 rounded-md hover:bg-gray-800 transition-colors">
                        <div className="relative flex items-center">
                           <input id={`checklist-${index}`} type="checkbox" checked={item.checked} onChange={() => handleCheck(index)} className="appearance-none h-5 w-5 border-2 border-gray-600 rounded bg-gray-900 checked:bg-brand-blue checked:border-brand-blue transition-all" />
                           {item.checked && <CheckIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />}
                        </div>
                        <span className={`ml-3 text-gray-300 ${item.checked ? 'line-through text-gray-500' : ''}`}>{item.text}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

const AIAssistantSkeleton = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg animate-pulse">
        <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-2 gap-6 items-center bg-gray-800/50 p-4 rounded-lg mb-6 h-28">
            <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                <div className="h-10 bg-gray-700 rounded w-2/3"></div>
            </div>
            <div className="flex flex-col items-end space-y-2">
                 <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                 <div className="h-16 bg-gray-700 rounded w-16"></div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-5 bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
        <div className="mt-6">
            <div className="h-5 bg-gray-700 rounded w-1/3 mb-3"></div>
            <div className="space-y-3">
                <div className="h-12 bg-gray-800/50 rounded-md"></div>
                <div className="h-12 bg-gray-800/50 rounded-md"></div>
                <div className="h-12 bg-gray-800/50 rounded-md"></div>
            </div>
        </div>
    </div>
);


export default AIAssistantPanel;
