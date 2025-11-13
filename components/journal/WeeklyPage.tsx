import React from 'react';
import { DailyJournal, JournalTrade, WeeklyReview } from '../../types';

interface WeeklyPageProps {
  dailyJournals: DailyJournal[];
  journalTrades: JournalTrade[];
  weeklyReviews: WeeklyReview[];
  onSaveWeeklyReview: (review: any) => Promise<WeeklyReview | null>;
}

const WeeklyPage: React.FC<WeeklyPageProps> = (props) => {

  // This component will be complex. For now, a placeholder structure.
  
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">Weekly Review</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Review your week every Friday to consolidate learnings and spot patterns.
      </p>

      <div className="bg-gray-100 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center text-gray-500">
        <h3 className="text-lg font-semibold">Weekly Review Feature Coming Soon</h3>
        <p>This section will include weekly P/L, mistake heatmaps, and summaries.</p>
      </div>
    </div>
  );
};

export default WeeklyPage;
