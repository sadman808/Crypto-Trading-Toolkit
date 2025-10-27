import React, { useState } from 'react';
import { SavedTrade, TradeOutcome } from '../types';
import { TrashIcon, DocumentArrowDownIcon, RefreshIcon } from '../constants';

interface SavedTradesListPageProps {
  savedTrades: SavedTrade[];
  onLoad: (trade: SavedTrade) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onUpdateTrade: (trade: SavedTrade) => void;
}

const SavedTradesListPage: React.FC<SavedTradesListPageProps> = ({ savedTrades, onLoad, onDelete, onClearAll, onUpdateTrade }) => {
  const [filter, setFilter] = useState('all');
  
  const filteredTrades = savedTrades.filter(trade => {
    if (filter === 'all') return true;
    return trade.outcome.toLowerCase() === filter;
  });

  const exportToCsv = () => {
      const headers = "ID,Timestamp,Symbol,Direction,Entry,StopLoss,Target,Outcome,RiskAmount,PNL\n";
      const rows = savedTrades.map(t => {
          const pnl = t.outcome === TradeOutcome.Win 
              ? t.calculationResult.maxLossFiat * t.calculationResult.rewardRiskRatio 
              : t.outcome === TradeOutcome.Loss
              ? -t.calculationResult.maxLossFiat
              : 0;
          return [
              t.id,
              t.timestamp,
              t.tradeParams.symbol,
              t.tradeParams.direction,
              t.tradeParams.entryPrice,
              t.tradeParams.stopLossPrice,
              t.tradeParams.targetPrice,
              t.outcome,
              t.calculationResult.maxLossFiat,
              pnl.toFixed(2)
          ].join(',');
      }).join('\n');
      
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "crypto_trades.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
                <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Saved Trades Log</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">A detailed history of all your trading activity.</p>
            </div>
             <div className="flex items-center gap-2">
                <button onClick={exportToCsv} className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm">
                    <DocumentArrowDownIcon className="h-4 w-4" /> Export CSV
                </button>
                <button onClick={onClearAll} className="bg-red-500/10 text-red-500 font-semibold py-2 px-4 rounded-md hover:bg-red-500/20 hover:text-red-600 transition-colors flex items-center gap-2 text-sm">
                    <TrashIcon className="h-4 w-4" /> Clear All
                </button>
            </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto">
            <div className="p-4">
                <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-lg flex max-w-xs space-x-1">
                    <button onClick={() => setFilter('all')} className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md ${filter === 'all' ? 'bg-white dark:bg-gray-900 text-brand-blue' : 'text-gray-600 dark:text-gray-400'}`}>All</button>
                    <button onClick={() => setFilter('win')} className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md ${filter === 'win' ? 'bg-white dark:bg-gray-900 text-brand-blue' : 'text-gray-600 dark:text-gray-400'}`}>Wins</button>
                    <button onClick={() => setFilter('loss')} className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md ${filter === 'loss' ? 'bg-white dark:bg-gray-900 text-brand-blue' : 'text-gray-600 dark:text-gray-400'}`}>Losses</button>
                    <button onClick={() => setFilter('planned')} className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md ${filter === 'planned' ? 'bg-white dark:bg-gray-900 text-brand-blue' : 'text-gray-600 dark:text-gray-400'}`}>Planned</button>
                </div>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-200 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 uppercase">
                    <tr>
                        <th scope="col" className="p-3">Symbol</th>
                        <th scope="col" className="p-3">Direction</th>
                        <th scope="col" className="p-3 hidden md:table-cell">Entry</th>
                        <th scope="col" className="p-3 hidden md:table-cell">R:R</th>
                        <th scope="col" className="p-3">Outcome</th>
                        <th scope="col" className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTrades.map(trade => (
                        <tr key={trade.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800/50">
                            <td className="p-3 font-medium text-gray-900 dark:text-white">{trade.tradeParams.symbol}</td>
                            <td className={`p-3 font-semibold ${trade.tradeParams.direction === 'Long' ? 'text-green-500' : 'text-red-500'}`}>{trade.tradeParams.direction}</td>
                            <td className="p-3 hidden md:table-cell">{trade.tradeParams.entryPrice}</td>
                            <td className="p-3 hidden md:table-cell">{trade.calculationResult.rewardRiskRatio.toFixed(2)}</td>
                            <td className="p-3">
                                <select
                                    value={trade.outcome}
                                    onChange={(e) => {
                                        const newOutcome = e.target.value as TradeOutcome;
                                        onUpdateTrade({ ...trade, outcome: newOutcome });
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`w-24 cursor-pointer text-center px-2 py-1 rounded-full text-xs font-semibold border-transparent focus:border-brand-blue focus:ring-1 focus:ring-brand-blue appearance-none ${
                                        trade.outcome === TradeOutcome.Win
                                            ? 'bg-green-500/10 text-green-500'
                                            : trade.outcome === TradeOutcome.Loss
                                            ? 'bg-red-500/10 text-red-500'
                                            : 'bg-gray-500/10 text-gray-500'
                                    }`}
                                    aria-label={`Change outcome for trade ${trade.tradeParams.symbol}`}
                                >
                                    <option className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200" value={TradeOutcome.Planned}>Planned</option>
                                    <option className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200" value={TradeOutcome.Win}>Win</option>
                                    <option className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200" value={TradeOutcome.Loss}>Loss</option>
                                </select>
                            </td>
                            <td className="p-3 flex items-center gap-2">
                                <button onClick={() => onLoad(trade)} className="flex items-center gap-1 text-brand-blue hover:underline font-semibold" aria-label={`Load trade ${trade.tradeParams.symbol}`}>
                                    <RefreshIcon className="h-4 w-4" />
                                    Load
                                </button>
                                <button onClick={() => onDelete(trade.id)} aria-label="Delete trade" className="text-gray-500 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredTrades.length === 0 && <p className="text-center text-gray-500 p-8">No trades match the current filter.</p>}
        </div>
    </div>
  );
};

export default SavedTradesListPage;