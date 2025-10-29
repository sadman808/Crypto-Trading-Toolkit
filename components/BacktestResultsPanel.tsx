import React from 'react';
import { BacktestResult, BacktestAIInsights, Candle } from '../types';
import { BrainIcon, SaveIcon, DocumentArrowDownIcon } from '../constants';
import Tooltip from './Tooltip';

const MetricCard = ({ title, value, className = '' }: { title: string, value: string | number, className?: string }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-2xl font-bold font-display ${className}`}>{value}</p>
    </div>
);

const CandlestickChart = ({ candles, trades }: { candles: Candle[], trades: BacktestResult['trades'] }) => {
    if (candles.length === 0) return null;
    const width = 800, height = 400;
    const padding = { top: 20, right: 50, bottom: 30, left: 50 };
    const prices = candles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices), maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    const candleWidth = (width - padding.left - padding.right) / candles.length;
    const getX = (i: number) => padding.left + i * candleWidth;
    const getY = (price: number) => padding.top + (height - padding.top - padding.bottom) * (1 - (price - minPrice) / priceRange);

    const formatPrice = (price: number) => {
        if (price > 100) return price.toFixed(2);
        if (price > 1) return price.toFixed(4);
        return price.toFixed(8);
    }
    const yAxisLabels = [minPrice, minPrice + priceRange / 4, minPrice + priceRange / 2, minPrice + 3 * priceRange / 4, maxPrice];

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="chart-title">
            <title id="chart-title">Candlestick chart of backtest period</title>
            {/* Y-Axis Labels & Grid Lines */}
            {yAxisLabels.map((price, i) => (
                <g key={i}>
                    <text x={width - padding.right + 5} y={getY(price)} dy="0.32em" className="text-xs fill-current text-gray-500">{formatPrice(price)}</text>
                    <line x1={padding.left} x2={width - padding.right} y1={getY(price)} y2={getY(price)} className="stroke-current text-gray-700/50" strokeDasharray="2" />
                </g>
            ))}
            {/* Candles */}
            {candles.map((c, i) => {
                const isGreen = c.close >= c.open;
                const bodyY = isGreen ? getY(c.close) : getY(c.open);
                const bodyHeight = Math.abs(getY(c.open) - getY(c.close)) || 1;
                return (
                    <g key={c.timestamp}>
                        <line x1={getX(i) + candleWidth / 2} y1={getY(c.high)} x2={getX(i) + candleWidth / 2} y2={getY(c.low)} stroke={isGreen ? '#00b894' : '#d63031'} strokeWidth="1" />
                        <rect x={getX(i)} y={bodyY} width={candleWidth * 0.8} height={bodyHeight} fill={isGreen ? '#00b894' : '#d63031'} />
                    </g>
                );
            })}
             {/* Trades */}
            {trades.map((trade, i) => {
                const entryIndex = candles.findIndex(c => c.timestamp === trade.entryTimestamp);
                const exitIndex = candles.findIndex(c => c.timestamp === trade.exitTimestamp);
                if (entryIndex === -1 || exitIndex === -1) return null;
                const entryY = getY(trade.entryPrice);
                const exitY = getY(trade.exitPrice);

                return (
                    <g key={`trade-${i}`}>
                        {/* Entry Marker */}
                        <path d={`M ${getX(entryIndex) + candleWidth/2} ${entryY + 12} l -5 -10 l 10 0 z`} fill="#0070f3" />
                        {/* Exit Marker */}
                        <circle cx={getX(exitIndex) + candleWidth/2} cy={exitY} r="5" fill={trade.profit > 0 ? '#00b894' : '#d63031'} stroke="#111827" strokeWidth="2" />
                    </g>
                );
            })}
        </svg>
    );
};

const EquityChart = ({ balanceHistory }: { balanceHistory: BacktestResult['balanceHistory'] }) => {
    if (balanceHistory.length < 2) return null;
    const width = 800, height = 200;
    const padding = { top: 20, right: 50, bottom: 20, left: 50 };
    const balances = balanceHistory.map(d => d.balance);
    const minBalance = Math.min(...balances), maxBalance = Math.max(...balances);
    const range = maxBalance - minBalance === 0 ? 1 : maxBalance - minBalance;

    const getX = (i: number) => padding.left + i * (width - padding.left - padding.right) / (balanceHistory.length - 1);
    const getY = (val: number) => padding.top + (height - padding.top - padding.bottom) * (1 - (val - minBalance) / range);

    const path = balanceHistory.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.balance)}`).join(' ');

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Portfolio Growth</h3>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-gray-900/50 rounded">
                <path d={path} fill="none" stroke="#1E90FF" strokeWidth="2" />
            </svg>
        </div>
    );
};


interface BacktestResultsPanelProps {
  result: BacktestResult | null;
  aiInsights: BacktestAIInsights | null;
  candleData: Candle[];
  isLoading: boolean;
}

const BacktestResultsPanel: React.FC<BacktestResultsPanelProps> = ({ result, aiInsights, candleData, isLoading }) => {
  if (isLoading) {
    return <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 min-h-[400px] flex justify-center items-center animate-pulse"><div className="h-8 w-1/2 bg-gray-700 rounded"></div></div>;
  }
  
  if (!result) {
    return (
      <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[400px] shadow-lg">
        <BrainIcon className="h-12 w-12 text-gray-700 mb-4" />
        <h3 className="text-lg font-bold text-gray-400">Your backtest results will appear here</h3>
        <p className="text-gray-500">Configure your strategy and click "Run Backtest" to begin.</p>
      </div>
    );
  }
  
  const isProfit = result.netProfitPercent >= 0;

  return (
    <div className="space-y-6">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-2xl font-bold font-display text-white">Backtest Report</h2>
            <div className="flex items-center gap-2">
                <Tooltip text="Save backtest summary to trade log (future feature)">
                    <button disabled className="bg-gray-800 text-gray-500 font-semibold py-2 px-4 rounded-md flex items-center gap-2 text-sm cursor-not-allowed">
                        <SaveIcon className="h-4 w-4" /> Save Result
                    </button>
                </Tooltip>
                 <Tooltip text="Export full report as PDF (future feature)">
                    <button disabled className="bg-gray-800 text-gray-500 font-semibold py-2 px-4 rounded-md flex items-center gap-2 text-sm cursor-not-allowed">
                        <DocumentArrowDownIcon className="h-4 w-4" /> Export Report
                    </button>
                 </Tooltip>
            </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <MetricCard title="Net Profit" value={`${result.netProfitPercent.toFixed(2)}%`} className={isProfit ? 'text-green-400' : 'text-red-400'} />
            <MetricCard title="Win Rate" value={`${result.winRate.toFixed(1)}%`} />
            <MetricCard title="Total Trades" value={result.totalTrades} />
            <MetricCard title="Max Drawdown" value={`${result.maxDrawdown.toFixed(2)}%`} className="text-yellow-400" />
        </div>
        
        {/* Charts */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <CandlestickChart candles={candleData} trades={result.trades} />
            <EquityChart balanceHistory={result.balanceHistory} />
        </div>

        {/* AI Insights */}
        {aiInsights && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <BrainIcon className="text-brand-blue" />
                    <h2 className="text-xl font-bold font-display text-white">AI Strategy Analysis</h2>
                </div>
                <div className="text-center bg-gray-800/50 p-4 rounded-lg mb-6">
                     <p className="text-sm text-gray-400 mb-1">AI Strategy Score</p>
                     <p className="text-6xl font-bold font-display text-brand-blue">{aiInsights.aiStrategyScore}<span className="text-3xl text-gray-500">/100</span></p>
                </div>
                <div className="space-y-4 text-sm">
                    <div><strong className="text-gray-300">Market Conditions:</strong><p className="text-gray-400">{aiInsights.marketConditionAnalysis}</p></div>
                    <div><strong className="text-gray-300">Strengths:</strong><p className="text-gray-400">{aiInsights.strategyStrengths}</p></div>
                    <div><strong className="text-gray-300">Weaknesses:</strong><p className="text-gray-400">{aiInsights.strategyWeaknesses}</p></div>
                    <div>
                        <strong className="text-gray-300">Improvement Suggestions:</strong>
                        <ul className="list-disc list-inside space-y-1 text-gray-400 mt-1">
                            {aiInsights.improvementSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default BacktestResultsPanel;
