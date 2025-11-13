import React from 'react';
import { DailyJournal, JournalTrade } from '../../types';

interface AnalyticsPageProps {
  dailyJournals: DailyJournal[];
  journalTrades: JournalTrade[];
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = (props) => {
  
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">Analytics Dashboard</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Visualize your performance and find your edge.
      </p>

      <div className="bg-gray-100 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center text-gray-500">
        <h3 className="text-lg font-semibold">Analytics Dashboard Coming Soon</h3>
        <p>This section will feature charts for win rate, R:R, setup success, and more.</p>
      </div>
    </div>
  );
};

export default AnalyticsPage;
