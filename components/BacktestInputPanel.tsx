import React from 'react';
import { BacktestParams } from '../types';
import Spinner from './Spinner';

interface BacktestInputPanelProps {
  params: BacktestParams;
  setParams: React.Dispatch<React.SetStateAction<BacktestParams>>;
  onRunBacktest: () => void;
  isLoading: boolean;
}

const BacktestInputPanel: React.FC<BacktestInputPanelProps> = ({ params, setParams, onRunBacktest, isLoading }) => {
  const handleChange = (field: keyof BacktestParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const inputStyles = "w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
  const labelStyles = "block text-sm font-medium text-gray-400 mb-1";
  const customSelect = `${inputStyles} appearance-none pr-8`;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6 shadow-lg sticky top-24">
      <h2 className="text-xl font-bold font-display text-white">Strategy Configuration</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="symbol" className={labelStyles}>Coin Pair</label>
          <input type="text" id="symbol" value={params.symbol} onChange={e => handleChange('symbol', e.target.value.toUpperCase())} className={inputStyles} placeholder="BTC/USDT" />
        </div>
        <div>
          <label htmlFor="timeframe" className={labelStyles}>Timeframe</label>
          <select id="timeframe" value={params.timeframe} onChange={e => handleChange('timeframe', e.target.value)} className={customSelect}>
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="30m">30m</option>
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1D">1D</option>
            <option value="1W">1W</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className={labelStyles}>Backtest Period</label>
        <div className="grid grid-cols-2 gap-4">
          <input type="date" value={params.startDate} onChange={e => handleChange('startDate', e.target.value)} className={inputStyles} />
          <input type="date" value={params.endDate} onChange={e => handleChange('endDate', e.target.value)} className={inputStyles} />
        </div>
      </div>

      <div>
        <label htmlFor="initialBalance" className={labelStyles}>Initial Balance ($)</label>
        <input type="number" id="initialBalance" value={params.initialBalance} onChange={e => handleChange('initialBalance', parseFloat(e.target.value) || 0)} className={inputStyles} />
      </div>

      <div>
        <label htmlFor="strategyRules" className={labelStyles}>Strategy Rules</label>
        <textarea
            id="strategyRules"
            value={params.strategyRules}
            onChange={e => handleChange('strategyRules', e.target.value)}
            rows={3}
            className={`${inputStyles} font-mono text-sm`}
            placeholder="e.g.&#10;BUY when RSI < 30&#10;SELL when RSI > 70"
        />
        <p className="text-xs text-gray-500 mt-1">Simple RSI supported. Example: `BUY when RSI &lt; 30`</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label htmlFor="stopLossPercent" className={labelStyles}>Stop Loss (%)</label>
            <input type="number" id="stopLossPercent" value={params.stopLossPercent} onChange={e => handleChange('stopLossPercent', parseFloat(e.target.value) || 0)} className={inputStyles} />
        </div>
        <div>
            <label htmlFor="takeProfitPercent" className={labelStyles}>Take Profit (%)</label>
            <input type="number" id="takeProfitPercent" value={params.takeProfitPercent} onChange={e => handleChange('takeProfitPercent', parseFloat(e.target.value) || 0)} className={inputStyles} />
        </div>
      </div>

      <button onClick={onRunBacktest} disabled={isLoading} className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed">
        {isLoading ? <Spinner /> : 'Run Backtest'}
      </button>
    </div>
  );
};

export default BacktestInputPanel;