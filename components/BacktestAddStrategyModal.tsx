import React, { useState } from 'react';
import { BacktestStrategy, BacktestTimeframe } from '../types';

interface BacktestAddStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (strategy: Omit<BacktestStrategy, 'id' | 'created_at' | 'user_id'>) => void;
}

const BacktestAddStrategyModal: React.FC<BacktestAddStrategyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [strategy, setStrategy] = useState({
    name: '',
    description: '',
    pair: 'BTC/USDT',
    timeframe: '15m' as BacktestTimeframe,
    initial_capital: 1000,
    risk_percent: 1,
    tags: [] as string[],
    trades: [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStrategy(prev => ({ ...prev, [name]: name === 'initial_capital' || name === 'risk_percent' ? parseFloat(value) : value }));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!strategy.tags.includes(tagInput.trim().toLowerCase())) {
        setStrategy(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim().toLowerCase()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setStrategy(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(strategy);
    onClose();
  };

  if (!isOpen) return null;

  const inputStyles = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
  const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">Create New Strategy Sheet</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className={labelStyles}>Strategy Name</label>
            <input type="text" name="name" value={strategy.name} onChange={handleChange} className={inputStyles} required />
          </div>
          <div>
            <label htmlFor="description" className={labelStyles}>Description / Notes</label>
            <textarea name="description" value={strategy.description} onChange={handleChange} rows={2} className={inputStyles} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pair" className={labelStyles}>Pair</label>
              <input type="text" name="pair" value={strategy.pair} onChange={handleChange} className={inputStyles} />
            </div>
            <div>
              <label htmlFor="timeframe" className={labelStyles}>Timeframe</label>
              <select name="timeframe" value={strategy.timeframe} onChange={handleChange} className={`${inputStyles} appearance-none`}>
                <option value="1m">1m</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="1H">1H</option>
                <option value="4H">4H</option>
                <option value="1D">1D</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="initial_capital" className={labelStyles}>Start Capital ($)</label>
              <input type="number" name="initial_capital" value={strategy.initial_capital} onChange={handleChange} className={inputStyles} />
            </div>
            <div>
              <label htmlFor="risk_percent" className={labelStyles}>Risk % per trade</label>
              <input type="number" name="risk_percent" step="0.1" value={strategy.risk_percent} onChange={handleChange} className={inputStyles} />
            </div>
          </div>
           <div>
              <label className={labelStyles}>Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {strategy.tags.map(tag => (
                  <span key={tag} className="bg-blue-500/10 text-brand-blue text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 text-blue-400 hover:text-blue-600">&times;</button>
                  </span>
                ))}
              </div>
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagInput} className={inputStyles} placeholder="Add a tag and press Enter" />
            </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="text-gray-600 dark:text-gray-400 font-semibold py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">Create Strategy Sheet</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BacktestAddStrategyModal;
