import React, { useState, useEffect } from 'react';
import { JournalOnetime, TradingRule, DailyJournal, JournalTrade, WeeklyReview, RuleCheck } from '../../types';
import Spinner from '../Spinner';
import OnboardingPage from './OnboardingPage';
import RulesPage from './RulesPage';
import DailyPage from './DailyPage';
import WeeklyPage from './WeeklyPage';
import AnalyticsPage from './AnalyticsPage';

interface JournalPageProps {
  onetimeReflection: JournalOnetime | null;
  tradingRules: TradingRule[];
  dailyJournals: DailyJournal[];
  journalTrades: JournalTrade[];
  weeklyReviews: WeeklyReview[];
  ruleChecks: RuleCheck[];
  onSaveOnetime: (data: any) => Promise<void>;
  onSaveRules: (rules: any[]) => Promise<void>;
  onSaveRuleChecks: (checks: any[]) => Promise<void>;
  onSaveDailyJournal: (journal: any) => Promise<DailyJournal | null>;
  onAddJournalTrade: (trade: any) => Promise<JournalTrade | null>;
  onSaveWeeklyReview: (review: any) => Promise<WeeklyReview | null>;
}

type JournalView = 'daily' | 'weekly' | 'analytics' | 'rules';

const JournalPage: React.FC<JournalPageProps> = (props) => {
  const [view, setView] = useState<JournalView>('daily');
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [rulesCheckedToday, setRulesCheckedToday] = useState(false);

  useEffect(() => {
    if (props.onetimeReflection !== undefined) {
      setIsOnboarded(!!props.onetimeReflection);
      
      if (props.tradingRules.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const todaysChecks = props.ruleChecks.filter(rc => rc.date === today);
        const allRulesChecked = props.tradingRules.every(rule => 
          todaysChecks.some(check => check.rule_id === rule.id && check.followed)
        );
        setRulesCheckedToday(allRulesChecked);
      } else {
        // If there are no rules, they don't need to be checked.
        setRulesCheckedToday(true);
      }
      
      setLoading(false);
    }
  }, [props.onetimeReflection, props.ruleChecks, props.tradingRules]);
  
  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
  };

  const handleRulesChecked = () => {
    setRulesCheckedToday(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!isOnboarded) {
    return <OnboardingPage onSave={props.onSaveOnetime} onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'daily':
        return <DailyPage {...props} rulesCheckedToday={rulesCheckedToday} onRulesChecked={handleRulesChecked} />;
      case 'weekly':
        return <WeeklyPage {...props} />;
      case 'analytics':
        return <AnalyticsPage {...props} />;
      case 'rules':
        return <RulesPage tradingRules={props.tradingRules} onSaveRules={props.onSaveRules} />;
      default:
        return <DailyPage {...props} rulesCheckedToday={rulesCheckedToday} onRulesChecked={handleRulesChecked} />;
    }
  };

  return (
    <div>
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {(['daily', 'weekly', 'analytics', 'rules'] as JournalView[]).map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`${
                view === tab
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-700'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      {renderContent()}
    </div>
  );
};

export default JournalPage;
