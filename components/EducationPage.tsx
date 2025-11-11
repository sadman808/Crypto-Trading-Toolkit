import React, { useState } from 'react';
import { getEducationContent } from '../services/geminiService';
import { JournalIcon, BrainIcon } from '../constants';
import Spinner from './Spinner';

interface EducationPageProps {
  apiKey: string;
}

const EducationPage: React.FC<EducationPageProps> = ({ apiKey }) => {
  const [topicInput, setTopicInput] = useState('');
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setCurrentTopic(topicInput);
    setIsLoading(true);
    setError(null);
    setContent(null);

    try {
      const result = await getEducationContent(topicInput, apiKey);
      setContent(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      line = line.trim();
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={index} className="text-lg font-bold text-gray-800 dark:text-white mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li key={index} className="ml-5 list-disc text-gray-600 dark:text-gray-400">{line.substring(2)}</li>;
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
         return <p key={index} className="text-gray-600 dark:text-gray-400 mt-4">{line}</p>;
      }
      return <p key={index} className="text-gray-600 dark:text-gray-400">{line}</p>;
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <JournalIcon className="h-8 w-8 text-brand-blue" />
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Trading Education Hub</h1>
          <p className="text-md text-gray-500 dark:text-gray-400 mt-1">Learn key concepts to improve your trading skills.</p>
        </div>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="What do you want to learn about? (e.g., Candlestick Patterns)"
            className="flex-grow bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition"
          />
          <button
            type="submit"
            disabled={isLoading || !topicInput.trim()}
            className="bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center disabled:bg-gray-500/80 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner /> : <><BrainIcon className="h-5 w-5 mr-2" /> Learn</>}
          </button>
        </form>
      </div>
      
      <div className="mt-6 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 min-h-[300px] transition-all duration-500">
        {isLoading && <div className="flex justify-center items-center h-48"><Spinner /></div>}
        {error && <div className="text-red-500 bg-red-500/10 p-4 rounded-md">{error}</div>}
        {content && (
             <>
                <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-4 capitalize">{currentTopic}</h2>
                <div className="prose dark:prose-invert max-w-none leading-relaxed">{renderContent(content)}</div>
            </>
        )}
        {!isLoading && !content && !error && (
            <div className="text-center text-gray-500 py-16">
                <p className="text-lg">Enter a topic above to start your learning journey.</p>
                <p className="text-sm">Examples: "Order Blocks", "Fundamental Analysis", "Ichimoku Cloud"</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default EducationPage;
