import React, { useState, useMemo, useEffect } from 'react';
import { BacktestTrade, BacktestTradeDirection, BacktestSession } from '../types';

interface BacktestAddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Omit<BacktestTrade, 'id'>) => void;
}

const BacktestAddTradeModal: React.FC<BacktestAddTradeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [trade, setTrade] = useState({
    date: new Date().toISOString().split('T')[0],
    direction: BacktestTradeDirection.Long,
    entry: '',
    sl: '',
    tp: '',
    session: BacktestSession.NewYork,
    note: '',
    win: false,
  });

  const { rr, result, isValid } = useMemo(() => {
      const entry = parseFloat(trade.entry);
      const sl = parseFloat(trade.sl);
      const tp = parseFloat(trade.tp);

      if (isNaN(entry) || isNaN(sl) || isNaN(tp)) return { rr: 0, result: 0, isValid: false };

      const riskDistance = Math.abs(entry - sl);
      const rewardDistance = Math.abs(tp - entry);
      
      if (riskDistance === 0) return { rr: 0, result: 0, isValid: false };

      const rr = rewardDistance / riskDistance;
      const result = trade.win ? rewardDistance : -riskDistance; // Simplified result, actual $ depends on position size.
                                                                 // For simplicity, we'll use a fixed risk amount for the result.
      const fixedRiskValue = 100; // Assume $100 risk for result calculation
      
      return {
          rr,
          result: trade.win ? rr * fixedRiskValue : -fixedRiskValue,
          isValid: true
      };
  }, [trade.entry, trade.sl, trade.tp, trade.win, trade.direction]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
     if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setTrade(prev => ({...prev, [name]: checked}));
     } else {
        setTrade(prev => ({ ...prev, [name]: value }));
     }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
        alert("Please fill in Entry, SL, and TP with valid numbers.");
        return;
    }
    onSave({
        ...trade,
        entry: parseFloat(trade.entry),
        sl: parseFloat(trade.sl),
        tp: parseFloat(trade.tp),
        rr,
        result,
    });
    onClose();
  };
  
  // Reset form on open
  useEffect(() => {
      if (isOpen) {
          setTrade({
            date: new Date().toISOString().split('T')[0],
            direction: BacktestTradeDirection.Long,
            entry: '',
            sl: '',
            tp: '',
            session: BacktestSession.NewYork,
            note: '',
            win: false,
          });
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const inputStyles = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
  const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">Add New Trade</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="date" className={labelStyles}>Date</label>
                <input type="date" name="date" value={trade.date} onChange={handleChange} className={inputStyles} required />
            </div>
            <div>
                <label htmlFor="direction" className={labelStyles}>Direction</label>
                <select name="direction" value={trade.direction} onChange={handleChange} className={`${inputStyles} appearance-none`}>
                    <option value={BacktestTradeDirection.Long}>Long</option>
                    <option value={BacktestTradeDirection.Short}>Short</option>
                </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
                <label htmlFor="entry" className={labelStyles}>Entry</label>
                <input type="number" step="any" name="entry" value={trade.entry} onChange={handleChange} className={inputStyles} required />
            </div>
            <div>
                <label htmlFor="sl" className={labelStyles}>Stop Loss</label>
                <input type="number" step="any" name="sl" value={trade.sl} onChange={handleChange} className={inputStyles} required />
            </div>
             <div>
                <label htmlFor="tp" className={labelStyles}>Take Profit</label>
                <input type="number" step="any" name="tp" value={trade.tp} onChange={handleChange} className={inputStyles} required />
            </div>
          </div>
          <div>
            <label htmlFor="session" className={labelStyles}>Session</label>
            <select name="session" value={trade.session} onChange={handleChange} className={`${inputStyles} appearance-none`}>
                {Object.values(BacktestSession).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="note" className={labelStyles}>Notes</label>
            <textarea name="note" value={trade.note} onChange={handleChange} rows={2} className={inputStyles} />
          </div>
          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
            <div className="flex items-center gap-4">
                <label htmlFor="win" className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400">
                    <input type="checkbox" name="win" checked={trade.win} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"/>
                    This was a winning trade
                </label>
            </div>
            <div className="text-right">
                <p className="text-xs text-gray-500">Auto-Calculated P/L</p>
                <p className={`font-bold ${result >= 0 ? 'text-green-500' : 'text-red-500'}`}>${result.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="text-gray-600 dark:text-gray-400 font-semibold py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">Add Trade</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BacktestAddTradeModal;
