import React, { useState } from 'react';
import { getEducationContent } from '../services/geminiService';
import { BrainIcon, CalculatorIcon, JournalIcon, ArrowTrendingUpIcon } from '../constants';
import Spinner from './Spinner';

interface EducationPageProps {
  apiKey: string;
}

const topics = [
  {
    name: 'Risk Management',
    description: 'Learn to protect your capital and manage losses.',
    icon: <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
  },
  {
    name: 'Technical Analysis',
    description: 'Understand charts, patterns, and indicators.',
    icon: <BrainIcon className="h-8 w-8 text-blue-500" />
  },
  {
    name: 'Market Psychology',
    description: 'Master the emotional aspects of trading.',
    icon: <JournalIcon className="h-8 w-8 text-yellow-500" />
  },
  {
    name: 'Leverage and Margin',
    description: 'Explore the concepts of leveraged trading.',
    icon: <CalculatorIcon className="h-8 w-8 text-purple-500" />
  }
];

const EducationPage: React.FC<EducationPageProps> = ({ apiKey }) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTopicSelect = async (topicName: string) => {
    if (selectedTopic === topicName) {
        setSelectedTopic(null);
        setContent(null);
        return;
    }

    setSelectedTopic(topicName);
    setIsLoading(true);
    setError(null);
    setContent(null);

    try {
      const result = await getEducationContent(topicName, apiKey);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map(topic => (
          <button
            key={topic.name}
            onClick={() => handleTopicSelect(topic.name)}
            className={`bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-left hover:border-brand-blue hover:scale-[1.03] transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 ${selectedTopic === topic.name ? 'ring-2 ring-brand-blue border-brand-blue' : ''}`}
          >
            <div className="mb-4">{topic.icon}</div>
            <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-2">{topic.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{topic.description}</p>
          </button>
        ))}
      </div>
      
      {selectedTopic && (
        <div className="mt-6 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 transition-all duration-500">
          <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-4">{selectedTopic}</h2>
          {isLoading && <div className="flex justify-center items-center h-48"><Spinner /></div>}
          {error && <div className="text-red-500 bg-red-500/10 p-4 rounded-md">{error}</div>}
          {content && <div className="prose dark:prose-invert max-w-none leading-relaxed">{renderContent(content)}</div>}
        </div>
      )}
    </div>
  );
};

export default EducationPage;
