import React from 'react';
import { CalculationResult } from '../types';
import { InfoIcon, ListIcon } from '../constants';
import Tooltip from './Tooltip';

interface ResultsPanelProps {
  result: CalculationResult | null;
  isLoading: boolean;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, isLoading }) => {

  if (isLoading) {
    return <ResultsSkeleton />;
  }
  
  if (!result) {
    return (
      <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[300px] shadow-lg">
        <ListIcon className="h-12 w-12 text-gray-700 mb-4" />
        <h3 className="text-lg font-bold text-gray-400">Your results will appear here</h3>
        <p className="text-gray-500">Fill out the trade parameters and click "Calculate & Analyze Risk" to begin.</p>
      </div>
    );
  }

  const {
    positionSizeAsset,
    positionSizeFiat,
    notionalValue,
    maxLossFiat,
    maxLossPercent,
    rewardRiskRatio,
    takeProfitLevels,
    assetName,
    accountCurrency,
  } = result;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: accountCurrency }).format(value);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <ListIcon className="text-brand-blue h-6 w-6" />
            <h2 className="text-xl font-bold font-display text-white">Trade Calculation</h2>
        </div>
      </div>

      <div className="space-y-4">
        <MetricRow 
          label="Position Size" 
          value={`${positionSizeAsset.toFixed(5)} ${assetName}`}
          subValue={formatCurrency(positionSizeFiat)}
          tooltipText="The amount of the asset you should buy or sell."
        />
        <MetricRow 
          label="Notional Value" 
          value={formatCurrency(notionalValue)}
          tooltipText="The total value of your position, including leverage (Position Size * Entry Price * Leverage)."
        />
        <MetricRow 
          label="Max Loss" 
          value={<span className="text-red-400">{formatCurrency(maxLossFiat)}</span>}
          subValue={`${maxLossPercent.toFixed(2)}% of Account`}
          tooltipText="The maximum amount you can lose if your stop-loss is hit."
        />
        <MetricRow 
          label="Reward:Risk (Target)"
          value={<span className="text-green-400">{rewardRiskRatio.toFixed(2)} : 1</span>}
          subValue={`+${formatCurrency(maxLossFiat * rewardRiskRatio)}`}
          tooltipText="The ratio of your potential profit (at your target) to your potential loss."
        />
      </div>

      <div className="mt-8">
        <h3 className="text-md font-semibold text-gray-300 mb-3">Suggested Take Profit Levels (R:R)</h3>
        <div className="space-y-2">
          {takeProfitLevels.map(level => (
            <div key={level.rr} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-md">
              <span className="font-medium text-gray-400">TP {level.rr === 1.5 ? 1 : level.rr === 2 ? 2 : 3} ({level.rr}:1)</span>
              <span className="font-mono text-gray-200">{formatCurrency(level.price)}</span>
              <span className="font-mono text-green-400 font-semibold">+{formatCurrency(level.profit)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricRow = ({ label, value, subValue, tooltipText }: { label: string, value: React.ReactNode, subValue?: string, tooltipText: string }) => (
  <div className="flex justify-between items-center border-b border-gray-800 pb-3 last:border-b-0">
    <div className="flex items-center space-x-2">
      <span className="text-gray-400">{label}</span>
      <Tooltip text={tooltipText}>
        <InfoIcon className="text-gray-600 h-4 w-4" />
      </Tooltip>
    </div>
    <div className="text-right">
      <span className="font-mono text-lg font-semibold text-white">{value}</span>
      {subValue && <p className="text-sm text-gray-500">{subValue}</p>}
    </div>
  </div>
);

const ResultsSkeleton = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-800 pb-3 last:border-b-0">
                    <div className="h-5 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                </div>
            ))}
        </div>
        <div className="mt-8">
            <div className="h-5 bg-gray-700 rounded w-1/2 mb-3"></div>
            <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-800/50 p-3 rounded-md h-12"></div>
                ))}
            </div>
        </div>
    </div>
);


export default ResultsPanel;