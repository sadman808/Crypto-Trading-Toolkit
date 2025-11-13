import React, { useState, useEffect } from 'react';
import { DailyJournal, TradingRule, JournalTrade, RuleCheck, Bias, MarketSession, Emotion, SetupType, TradeGrade } from '../../types';
import { CheckIcon } from '../../constants';

// --- Daily Rules Checklist ---
const DailyChecklist: React.FC<{ rules: TradingRule[], onConfirm: (checkedRuleIds: string[]) => void }> = ({ rules, onConfirm }) => {
    const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});
    const allChecked = rules.length > 0 && rules.every(rule => checkedState[rule.id]);

    const handleCheck = (ruleId: string) => {
        setCheckedState(prev => ({...prev, [ruleId]: !prev[ruleId]}));
    };
    
    const handleSubmit = () => {
        if (allChecked) {
            onConfirm(Object.keys(checkedState).filter(id => checkedState[id]));
        }
    };

    return (
        <div className="max-w-xl mx-auto text-center p-8 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">Daily Confirmation</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Review and commit to your rules before starting your session.</p>
            <div className="space-y-3 text-left">
                {rules.map(rule => (
                    <label key={rule.id} className="flex items-center cursor-pointer p-3 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="relative flex items-center">
                            <input type="checkbox" checked={!!checkedState[rule.id]} onChange={() => handleCheck(rule.id)} className="appearance-none h-5 w-5 border-2 border-gray-400 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-900 checked:bg-brand-blue checked:border-brand-blue transition-all" />
                            {checkedState[rule.id] && <CheckIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />}
                        </div>
                        <span className={`ml-3 text-gray-700 dark:text-gray-300 ${checkedState[rule.id] ? 'line-through text-gray-500' : ''}`}>{rule.rule_text}</span>
                    </label>
                ))}
            </div>
            <button onClick={handleSubmit} disabled={!allChecked} className="mt-6 w-full bg-brand-green text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-500/80 disabled:cursor-not-allowed">
                Unlock Today's Journal
            </button>
        </div>
    );
};

// --- Daily Page ---
interface DailyPageProps {
  tradingRules: TradingRule[];
  dailyJournals: DailyJournal[];
  journalTrades: JournalTrade[];
  onSaveRuleChecks: (checks: { rule_id: string; date: string; followed: boolean }[]) => Promise<void>;
  onSaveDailyJournal: (journal: Partial<DailyJournal> & { date: string }) => Promise<DailyJournal | null>;
  onAddJournalTrade: (trade: any) => Promise<JournalTrade | null>;
  rulesCheckedToday: boolean;
  onRulesChecked: () => void;
}

const DailyPage: React.FC<DailyPageProps> = (props) => {
    const today = new Date().toISOString().split('T')[0];
    const todaysJournal = props.dailyJournals.find(j => j.date === today);
    const todaysTrades = props.journalTrades.filter(t => t.journal_daily_id === todaysJournal?.id);
  
    const [journal, setJournal] = useState<Partial<DailyJournal>>(todaysJournal || { date: today });
    
    useEffect(() => {
        setJournal(todaysJournal || { date: today });
    }, [todaysJournal]);

    const handleRuleConfirm = async (checkedRuleIds: string[]) => {
        const checks = checkedRuleIds.map(id => ({ rule_id: id, date: today, followed: true }));
        await props.onSaveRuleChecks(checks);
        await props.onSaveDailyJournal({ ...journal, date: today, rules_confirmed: true });
        props.onRulesChecked();
    };
    
    if (!props.rulesCheckedToday) {
        return <DailyChecklist rules={props.tradingRules} onConfirm={handleRuleConfirm} />;
    }

    // Main daily view will be implemented here. For now, a placeholder.
    return (
        <div>
            <h1 className="text-2xl font-bold">Daily Journal for {today}</h1>
            <p>Pre-market, Trades, and Post-market sections will be built here.</p>
        </div>
    );
};

export default DailyPage;