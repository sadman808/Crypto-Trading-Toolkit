

import React from 'react';
import { TradeParams, Currency, Direction, Timeframe, RiskMethod } from '../types';
import { ChevronDownIcon } from '../constants';
import Spinner from './Spinner';

interface InputPanelProps {
  params: TradeParams;
  setParams: React.Dispatch<React.SetStateAction<TradeParams>>;
  onCalculate: () => void;
  isLoading: boolean;
  aiEnabled: boolean;
}

const InputPanel: React.FC<InputPanelProps> = ({ params, setParams, onCalculate, isLoading, aiEnabled }) => {
  const handleChange = (field: keyof TradeParams, value: any) => {
    // Prevent negative numbers for most fields
    const numericFields: (keyof TradeParams)[] = ['accountBalance', 'entryPrice', 'stopLossPrice', 'targetPrice', 'fixedRiskAmount', 'winProbability', 'winLossRatio'];
    if (numericFields.includes(field) && parseFloat(value) < 0) {
      return;
    }
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const inputStyles = "w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
  const labelStyles = "block text-sm font-medium text-gray-400 mb-1";
  const customSelectWrapper = "relative";
  const customSelect = `${inputStyles} appearance-none pr-8`;
  const customSelectIcon = "absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6 shadow-lg">
      <h2 className="text-xl font-bold font-display text-white">Trade Parameters</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="symbol" className={labelStyles}>Symbol</label>
          <input type="text" id="symbol" value={params.symbol} onChange={e => handleChange('symbol', e.target.value.toUpperCase())} className={inputStyles} placeholder="e.g., BTC/USDT" />
        </div>
        <div>
          <label htmlFor="accountCurrency" className={labelStyles}>Account Currency</label>
          <div className={customSelectWrapper}>
            <select id="accountCurrency" value={params.accountCurrency} onChange={e => handleChange('accountCurrency', e.target.value)} className={customSelect}>
              {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className={customSelectIcon}><ChevronDownIcon className="text-gray-500" /></div>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="accountBalance" className={labelStyles}>Account Balance</label>
        <input type="number" id="accountBalance" value={params.accountBalance} onChange={e => handleChange('accountBalance', parseFloat(e.target.value) || 0)} className={inputStyles} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="entryPrice" className={labelStyles}>Entry Price</label>
          <input type="number" id="entryPrice" value={params.entryPrice} onChange={e => handleChange('entryPrice', parseFloat(e.target.value) || 0)} className={inputStyles} />
        </div>
        <div>
          <label htmlFor="stopLossPrice" className={labelStyles}>Stop-Loss Price</label>
          <input type="number" id="stopLossPrice" value={params.stopLossPrice} onChange={e => handleChange('stopLossPrice', parseFloat(e.target.value) || 0)} className={inputStyles} />
        </div>
        <div>
          <label htmlFor="targetPrice" className={labelStyles}>Target Price</label>
          <input type="number" id="targetPrice" value={params.targetPrice} onChange={e => handleChange('targetPrice', parseFloat(e.target.value) || 0)} className={inputStyles} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="direction" className={labelStyles}>Direction</label>
           <div className={customSelectWrapper}>
            <select id="direction" value={params.direction} onChange={e => handleChange('direction', e.target.value)} className={customSelect}>
              {Object.values(Direction).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className={customSelectIcon}><ChevronDownIcon className="text-gray-500" /></div>
          </div>
        </div>
        <div>
          <label htmlFor="timeframe" className={labelStyles}>Timeframe</label>
          <div className={customSelectWrapper}>
            <select id="timeframe" value={params.timeframe} onChange={e => handleChange('timeframe', e.target.value)} className={customSelect}>
              {Object.values(Timeframe).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className={customSelectIcon}><ChevronDownIcon className="text-gray-500" /></div>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="riskMethod" className={labelStyles}>Risk Method</label>
        <div className={customSelectWrapper}>
            <select id="riskMethod" value={params.riskMethod} onChange={e => handleChange('riskMethod', e.target.value)} className={customSelect}>
              {Object.values(RiskMethod).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className={customSelectIcon}><ChevronDownIcon className="text-gray-500" /></div>
        </div>
      </div>

      {params.riskMethod === RiskMethod.FixedPercentage && (
        <div>
          <label htmlFor="riskPercentage" className={labelStyles}>Risk ({params.riskPercentage}%)</label>
          <input type="range" id="riskPercentage" min="0.1" max="10" step="0.1" value={params.riskPercentage} onChange={e => handleChange('riskPercentage', parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
        </div>
      )}

      {params.riskMethod === RiskMethod.FixedAmount && (
        <div>
          <label htmlFor="fixedRiskAmount" className={labelStyles}>Risk Amount</label>
          <input type="number" id="fixedRiskAmount" value={params.fixedRiskAmount} onChange={e => handleChange('fixedRiskAmount', parseFloat(e.target.value) || 0)} className={inputStyles} />
        </div>
      )}

      {params.riskMethod === RiskMethod.KellyCriterion && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="winProbability" className={labelStyles}>Win Probability (%)</label>
            <input type="number" id="winProbability" min="0" max="100" value={params.winProbability} onChange={e => handleChange('winProbability', parseFloat(e.target.value) || 0)} className={inputStyles} />
          </div>
          <div>
            <label htmlFor="winLossRatio" className={labelStyles}>Win/Loss Ratio</label>
            <input type="number" id="winLossRatio" value={params.winLossRatio} onChange={e => handleChange('winLossRatio', parseFloat(e.target.value) || 0)} className={inputStyles} />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="leverage" className={labelStyles}>Leverage ({params.leverage}x)</label>
        <input type="range" id="leverage" min="1" max="100" step="1" value={params.leverage} onChange={e => handleChange('leverage', parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
      </div>

      <button onClick={onCalculate} disabled={isLoading} className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed">
        {isLoading ? <Spinner /> : aiEnabled ? 'Calculate & Analyze Risk' : 'Calculate'}
      </button>
    </div>
  );
};

export default InputPanel;
