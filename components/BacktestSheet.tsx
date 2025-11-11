import React, { useState, useMemo } from 'react';
import { BacktestStrategy, BacktestTrade } from '../types';
import { ArrowLeftIcon, PlusIcon, SaveIcon, TrashIcon, DocumentArrowDownIcon } from '../constants';
import { calculateDetailedMetrics } from '../services/backtestService';
import BacktestAddTradeModal from './BacktestAddTradeModal';

const MetricCard = ({ title, value, change, isPositive }: { title: string, value: string, change?: string, isPositive?: boolean }) => (
    <div className="bg-gray-200 dark:bg-gray-800/50 p-3 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-lg font-bold ${isPositive === true ? 'text-green-400' : isPositive === false ? 'text-red-400' : 'text-gray-900 dark:text-white'}`}>{value}</p>
        {change && <p className="text-xs text-gray-500 dark:text-gray-500">{change}</p>}
    </div>
);

const EquityChart = ({ data }: { data: { trade: number; balance: number }[] }) => {
    if (data.length < 2) return <div className="text-center text-gray-500">Not enough data for chart.</div>;
    
    const width = 500, height = 150;
    const padding = { top: 10, right: 10, bottom: 20, left: 50 };
    const balances = data.map(d => d.balance);
    const minBalance = Math.min(...balances), maxBalance = Math.max(...balances);
    const range = maxBalance - minBalance === 0 ? 1 : maxBalance - minBalance;
    
    const getX = (i: number) => padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right);
    const getY = (v: number) => (height - padding.bottom) - ((v - minBalance) / range) * (height - padding.top - padding.bottom);
    
    const path = data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.balance)}`).join(' ');
    const areaPath = `${path} L ${getX(data.length - 1)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <defs><linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0070f3" stopOpacity={0.4}/><stop offset="100%" stopColor="#0070f3" stopOpacity={0}/></linearGradient></defs>
            <path d={areaPath} fill="url(#equityGradient)" />
            <path d={path} fill="none" stroke="#0070f3" strokeWidth="2" />
        </svg>
    );
};

const WinLossPieChart = ({ wins, losses }: { wins: number, losses: number }) => {
    const total = wins + losses;
    if (total === 0) return <div className="h-24 w-24 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-400">No Trades</div>;
    const winAngle = (wins / total) * 360;
    const winX = 50 + 50 * Math.cos(Math.PI * (winAngle - 90) / 180);
    const winY = 50 + 50 * Math.sin(Math.PI * (winAngle - 90) / 180);
    const largeArc = winAngle > 180 ? 1 : 0;
    const path = `M 50 50 L 50 0 A 50 50 0 ${largeArc} 1 ${winX} ${winY} Z`;
    
    return (
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" fill="#d63031" />
            <path d={path} fill="#00b894" />
        </svg>
      </div>
    );
};


interface BacktestSheetProps {
  strategy: BacktestStrategy;
  onBack: () => void;
  onSave: (strategy: BacktestStrategy) => void;
  onDelete: (id: string) => void;
}

const BacktestSheet: React.FC<BacktestSheetProps> = ({ strategy: initialStrategy, onBack, onSave, onDelete }) => {
    const [strategy, setStrategy] = useState(initialStrategy);
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

    const metrics = useMemo(() => calculateDetailedMetrics(strategy), [strategy]);

    const handleAddTrade = (trade: Omit<BacktestTrade, 'id'>) => {
        const newTrade = { ...trade, id: new Date().toISOString() };
        setStrategy(prev => ({ ...prev, trades: [...prev.trades, newTrade] }));
    };

    const handleDeleteTrade = (tradeId: string) => {
        setStrategy(prev => ({...prev, trades: prev.trades.filter(t => t.id !== tradeId)}));
    };

    const handleSaveAndExit = () => {
        onSave(strategy);
    };

    const handleDeleteStrategy = () => {
        if (window.confirm("Are you sure you want to delete this entire strategy sheet?")) {
            onDelete(strategy.id);
            onBack();
        }
    };
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><ArrowLeftIcon className="h-6 w-6" /></button>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">{strategy.name}</h1>
                        <p className="text-md text-gray-500 dark:text-gray-400">{strategy.pair} on {strategy.timeframe}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleDeleteStrategy} className="bg-red-500/10 text-red-500 font-semibold py-2 px-3 rounded-md hover:bg-red-500/20 text-sm"><TrashIcon className="h-4 w-4" /></button>
                    <button onClick={handleSaveAndExit} className="bg-brand-blue text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm">
                        <SaveIcon className="h-4 w-4" /> Save Sheet
                    </button>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <MetricCard title="Net P/L" value={`${metrics.netProfit.toFixed(2)}$`} change={`${metrics.netProfitPercent.toFixed(2)}%`} isPositive={metrics.netProfit >= 0} />
                <MetricCard title="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} change={`${metrics.wins}W / ${metrics.losses}L`} />
                <MetricCard title="Profit Factor" value={metrics.profitFactor.toFixed(2)} />
                <MetricCard title="Max Drawdown" value={`${metrics.maxDrawdown.toFixed(2)}%`} isPositive={false}/>
                <MetricCard title="Best Day" value={metrics.mostProfitableDay} isPositive={true}/>
                <MetricCard title="Worst Day" value={metrics.leastProfitableDay} isPositive={false}/>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Equity Curve</h3>
                    <EquityChart data={metrics.equityCurve} />
                </div>
                <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Win / Loss</h3>
                    <WinLossPieChart wins={metrics.wins} losses={metrics.losses} />
                    <div className="text-xs mt-2 space-y-1">
                        <p><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>Wins: {metrics.wins}</p>
                        <p><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>Losses: {metrics.losses}</p>
                    </div>
                </div>
            </div>

            {/* Trades Table */}
             <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="flex justify-between items-center p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Trades</h3>
                    <button onClick={() => setIsTradeModalOpen(true)} className="bg-blue-500/10 text-brand-blue font-semibold py-2 px-4 rounded-md hover:bg-blue-500/20 text-sm flex items-center gap-2">
                        <PlusIcon className="h-4 w-4" /> Add Trade
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-200 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 uppercase">
                            <tr>
                                {['Date', 'Day', 'Direction', 'Entry', 'SL', 'TP', 'Result ($)', 'R:R', 'Session', 'Actions'].map(h => <th key={h} className="p-3">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {strategy.trades.map(trade => (
                                <tr key={trade.id} className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="p-3">{new Date(trade.date).toLocaleDateString()}</td>
                                    <td className="p-3">{trade.day}</td>
                                    <td className={`p-3 font-semibold ${trade.direction === 'Long' ? 'text-green-500' : 'text-red-500'}`}>{trade.direction}</td>
                                    <td className="p-3">{trade.entry}</td>
                                    <td className="p-3">{trade.sl}</td>
                                    <td className="p-3">{trade.tp}</td>
                                    <td className={`p-3 font-semibold ${trade.win ? 'text-green-500' : 'text-red-500'}`}>{trade.result.toFixed(2)}</td>
                                    <td className="p-3">{trade.rr.toFixed(2)}</td>
                                    <td className="p-3">{trade.session}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleDeleteTrade(trade.id)} className="text-gray-500 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {strategy.trades.length === 0 && <p className="text-center text-gray-500 p-8">No trades logged for this strategy yet.</p>}
                </div>
            </div>
            
            <BacktestAddTradeModal isOpen={isTradeModalOpen} onClose={() => setIsTradeModalOpen(false)} onSave={handleAddTrade} />
        </div>
    );
};

export default BacktestSheet;