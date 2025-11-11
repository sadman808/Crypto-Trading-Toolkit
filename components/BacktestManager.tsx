import React, { useState, useMemo } from 'react';
import { BacktestStrategy } from '../types';
import { BrainIcon, PlusIcon, TrashIcon } from '../constants';
import BacktestAddStrategyModal from './BacktestAddStrategyModal';
import { calculateSummaryStats } from '../backtestService';

interface BacktestManagerProps {
  strategies: BacktestStrategy[];
  onSelectStrategy: (strategy: BacktestStrategy) => void;
  onAddStrategy: (strategy: Omit<BacktestStrategy, 'id' | 'created_at' | 'user_id'>) => Promise<BacktestStrategy | null>;
  onDeleteStrategy: (id: string) => void;
}

const BacktestManager: React.FC<BacktestManagerProps> = ({ strategies, onSelectStrategy, onAddStrategy, onDeleteStrategy }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const stats = useMemo(() => {
        return strategies.map(s => ({
            id: s.id,
            ...calculateSummaryStats(s)
        }));
    }, [strategies]);

    const highestWinRateId = useMemo(() => {
        if (stats.length === 0) return null;
        return stats.reduce((prev, current) => (prev.winRate > current.winRate) ? prev : current).id;
    }, [stats]);
    
    const handleAddStrategy = async (strategyData: Omit<BacktestStrategy, 'id' | 'created_at' | 'user_id'>) => {
        const newStrategy = await onAddStrategy(strategyData);
        if (newStrategy) {
            onSelectStrategy(newStrategy);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-200px)]">
            <div className="flex items-center gap-3 mb-6">
                <BrainIcon className="h-8 w-8 text-brand-blue" />
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Backtest Strategy Manager</h1>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1">Create, analyze, and compare your trading strategies.</p>
                </div>
            </div>

            {strategies.length === 0 ? (
                <div className="text-center text-gray-500 py-24 bg-gray-100 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <p className="text-lg">No strategies yet.</p>
                    <p className="text-sm">Click the `+` button to add your first backtest sheet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-200 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 uppercase">
                            <tr>
                                <th className="p-3">Strategy Name</th>
                                <th className="p-3">Total Trades</th>
                                <th className="p-3">Win Rate %</th>
                                <th className="p-3">Avg R:R</th>
                                <th className="p-3">Avg Return</th>
                                <th className="p-3">Most Profitable Session</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {strategies.map(strategy => {
                                const strategyStats = stats.find(s => s.id === strategy.id);
                                return (
                                    <tr key={strategy.id} className={`border-b border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800/50 cursor-pointer ${strategy.id === highestWinRateId ? 'bg-green-500/10' : ''}`} onClick={() => onSelectStrategy(strategy)}>
                                        <td className="p-3 font-medium text-gray-900 dark:text-white">{strategy.name} {strategy.id === highestWinRateId && '🟢'}</td>
                                        <td className="p-3">{strategyStats?.totalTrades}</td>
                                        <td className="p-3">{strategyStats?.winRate.toFixed(2)}%</td>
                                        <td className="p-3">{strategyStats?.avgRR.toFixed(2)}</td>
                                        <td className="p-3">{strategyStats?.avgReturnPerTrade.toFixed(2)}$</td>
                                        <td className="p-3">{strategyStats?.mostProfitableSession}</td>
                                        <td className="p-3">
                                            <button onClick={(e) => { e.stopPropagation(); onDeleteStrategy(strategy.id); }} className="text-gray-500 hover:text-red-500">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            
            <button onClick={() => setIsModalOpen(true)} className="fixed bottom-10 right-10 bg-brand-blue text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-transform hover:scale-110">
                <PlusIcon className="h-6 w-6" />
            </button>
            
            <BacktestAddStrategyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddStrategy} />
        </div>
    );
};

export default BacktestManager;