import React, { useState } from 'react';
import { TradingRule } from '../../types';
import { PlusIcon, TrashIcon } from '../../constants';

interface RulesPageProps {
  tradingRules: TradingRule[];
  onSaveRules: (rules: Omit<TradingRule, 'id'|'user_id'|'created_at'>[]) => Promise<void>;
}

const RulesPage: React.FC<RulesPageProps> = ({ tradingRules, onSaveRules }) => {
  const [rules, setRules] = useState<Omit<TradingRule, 'id'|'user_id'|'created_at'>[]>(tradingRules.map(r => ({ rule_text: r.rule_text })));
  const [newRule, setNewRule] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddRule = () => {
    if (newRule.trim() && rules.length < 10) {
      setRules([...rules, { rule_text: newRule.trim() }]);
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };
  
  const handleUpdateRule = (index: number, text: string) => {
    const newRules = [...rules];
    newRules[index].rule_text = text;
    setRules(newRules);
  };

  const handleSave = async () => {
    setLoading(true);
    await onSaveRules(rules);
    setLoading(false);
    alert('Rules saved!');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">Your Trading Rules</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Define 5-10 core rules. You will confirm these each day before trading.</p>
      
      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-center gap-2">
            <input 
              type="text"
              value={rule.rule_text}
              onChange={(e) => handleUpdateRule(index, e.target.value)}
              className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm"
            />
            <button onClick={() => handleRemoveRule(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      {rules.length < 10 && (
        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            value={newRule}
            onChange={e => setNewRule(e.target.value)}
            className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm"
            placeholder="Add a new rule..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
          />
          <button onClick={handleAddRule} className="p-2 bg-brand-blue text-white rounded-md"><PlusIcon className="h-5 w-5"/></button>
        </div>
      )}
      
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={loading} className="bg-brand-blue text-white font-bold py-2 px-6 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-500">
            {loading ? 'Saving...' : 'Save Rules'}
        </button>
      </div>
    </div>
  );
};

export default RulesPage;