import React, { useState, useEffect } from 'react';
import { SavedTrade, TradeOutcome } from '../types';
import { CheckIcon, ChevronDownIcon } from '../constants';

interface PerformanceChartProps {
    trades: SavedTrade[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ trades }) => {
    const completedTrades = trades
        .filter(t => t.outcome === TradeOutcome.Win || t.outcome === TradeOutcome.Loss)
        .sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime());

    if (completedTrades.length < 2) {
        return (
            <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg text-center text-gray-500 dark:text-gray-400 mb-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold font-display text-gray-800 dark:text-white mb-2">Performance History</h3>
                <p>Complete at least two trades to see your performance chart.</p>
            </div>
        );
    }
    
    let cumulativePl = 0;
    const dataPoints = completedTrades.map(trade => {
        const profit = trade.calculationResult.maxLossFiat * trade.calculationResult.rewardRiskRatio;
        const loss = -trade.calculationResult.maxLossFiat;
        const pnl = trade.outcome === TradeOutcome.Win ? profit : loss;
        cumulativePl += pnl;
        return {
            pnl: cumulativePl,
            currency: trade.calculationResult.accountCurrency
        };
    });

    const totalWins = completedTrades.filter(t => t.outcome === TradeOutcome.Win).length;
    const winRate = (totalWins / completedTrades.length) * 100;
    const finalPl = dataPoints[dataPoints.length - 1].pnl;
    const currency = dataPoints[0].currency;

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

    const width = 500, height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 60 };
    const pnlValues = [0, ...dataPoints.map(d => d.pnl)];
    const minY = Math.min(...pnlValues), maxY = Math.max(...pnlValues);
    const range = maxY - minY === 0 ? 1 : maxY - minY;
    const getX = (i: number) => padding.left + (i / (dataPoints.length - 1)) * (width - padding.left - padding.right);
    const getY = (v: number) => (height - padding.bottom) - ((v - minY) / range) * (height - padding.top - padding.bottom);
    const path = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.pnl)}`).join(' ');
    const areaPath = `${path} L ${getX(dataPoints.length - 1)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`;
    const yAxisLabels = Array.from(new Set([minY, minY + range/2, maxY])).map(val => ({ value: formatCurrency(val), y: getY(val) }));

    return (
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold font-display text-gray-800 dark:text-white mb-3 px-2">Performance History</h3>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Total P/L</p><p className={`font-bold text-lg ${finalPl >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(finalPl)}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Completed</p><p className="font-bold text-lg text-gray-800 dark:text-white">{completedTrades.length}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p><p className="font-bold text-lg text-gray-800 dark:text-white">{winRate.toFixed(1)}%</p></div>
            </div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="chart-title">
                <title id="chart-title">Trade performance over time</title>
                <defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0070f3" stopOpacity={0.4}/><stop offset="100%" stopColor="#0070f3" stopOpacity={0}/></linearGradient></defs>
                {yAxisLabels.map(({ value, y }, i) => (<g key={i}><text x={padding.left - 10} y={y} dy="0.32em" textAnchor="end" className="text-xs fill-current text-gray-500">{value}</text><line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="stroke-current text-gray-700/50" strokeDasharray="2" /></g>))}
                <path d={areaPath} fill="url(#areaGradient)" /><path d={path} fill="none" stroke="#0070f3" strokeWidth="2" />
                {dataPoints.map((p, i) => (<circle key={i} cx={getX(i)} cy={getY(p.pnl)} r="3" fill="#0070f3" stroke={document.documentElement.classList.contains('dark') ? '#111827' : '#f9fafb'} strokeWidth="2" />))}
            </svg>
        </div>
    );
};

interface TradeJournalEntryProps {
  trade: SavedTrade;
  onUpdateTrade: (trade: SavedTrade) => void;
}

const TradeJournalEntry: React.FC<TradeJournalEntryProps> = ({ trade, onUpdateTrade }) => {
    const [notes, setNotes] = useState(trade.notes);
    const [emotion, setEmotion] = useState(trade.emotionRating);
    const [tags, setTags] = useState(trade.tags);
    const [tagInput, setTagInput] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    
    useEffect(() => {
        setNotes(trade.notes);
        setEmotion(trade.emotionRating);
        setTags(trade.tags);
    }, [trade]);

    const handleSave = () => {
        setSaveStatus('saving');
        onUpdateTrade({ ...trade, notes, emotionRating: emotion, tags });
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    };

    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim() !== '') {
            e.preventDefault();
            if (!tags.includes(tagInput.trim().toLowerCase())) {
                setTags([...tags, tagInput.trim().toLowerCase()]);
            }
            setTagInput('');
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const emotionColor = emotion > 7 ? 'text-green-500' : emotion < 4 ? 'text-red-500' : 'text-yellow-500';
    const isDirty = trade.notes !== notes || trade.emotionRating !== emotion || JSON.stringify(trade.tags.sort()) !== JSON.stringify(tags.sort());

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm focus:ring-brand-blue focus:border-brand-blue" placeholder="What was your rationale? How did you feel?"></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Emotion Rating: <span className={`font-bold ${emotionColor}`}>{emotion}/10</span></label>
                <input type="range" min="1" max="10" value={emotion} onChange={e => setEmotion(parseInt(e.target.value))} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                        <span key={tag} className="bg-blue-500/10 text-brand-blue text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="ml-1.5 text-blue-400 hover:text-blue-600">&times;</button>
                        </span>
                    ))}
                </div>
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagInput} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm focus:ring-brand-blue focus:border-brand-blue" placeholder="Add a tag and press Enter" />
            </div>
            <div className="text-right flex justify-end items-center h-8">
                {saveStatus === 'saving' && <p className="text-xs text-gray-500 dark:text-gray-400 animate-pulse mr-4">Saving...</p>}
                {saveStatus === 'saved' && (
                    <p className="text-xs text-green-500 flex items-center gap-1 mr-4">
                        <CheckIcon className="h-4 w-4" />
                        Saved
                    </p>
                )}
                <button 
                    onClick={handleSave} 
                    disabled={!isDirty || saveStatus === 'saving'}
                    className="bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm disabled:bg-gray-500 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                   {saveStatus === 'saving' ? 'Saving...' : 'Save Journal'}
                </button>
            </div>
        </div>
    );
};


interface TradeJournalPageProps {
  savedTrades: SavedTrade[];
  onUpdateTrade: (trade: SavedTrade) => void;
}

const TradeJournalPage: React.FC<TradeJournalPageProps> = ({ savedTrades, onUpdateTrade }) => {
  const [filter, setFilter] = useState('all');
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

  const handleToggleExpand = (tradeId: string) => {
    setExpandedTradeId(currentId => (currentId === tradeId ? null : tradeId));
  };

  const filteredTrades = savedTrades.filter(trade => {
    if (filter === 'all') return true;
    if (filter === 'planned') return trade.outcome === TradeOutcome.Planned;
    if (filter === 'completed') return trade.outcome === TradeOutcome.Win || trade.outcome === TradeOutcome.Loss;
    return false;
  }).sort((a,b) => new Date(b.id).getTime() - new Date(a.id).getTime());

  return (
    <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Trade Journal</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Review your past trades and track your performance.</p>
        </div>

        <PerformanceChart trades={savedTrades} />

        <div className="flex justify-center my-4">
            <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-lg flex space-x-1">
                <button onClick={() => setFilter('all')} className={`px-4 py-1 text-sm font-semibold rounded-md ${filter === 'all' ? 'bg-white dark:bg-gray-900 text-brand-blue' : 'text-gray-600 dark:text-gray-400'}`}>All</button>
                <button onClick={() => setFilter('planned')} className={`px-4 py-1 text-sm font-semibold rounded-md ${filter === 'planned' ? 'bg-white dark:bg-gray-900 text-brand-blue' : 'text-gray-600 dark:text-gray-400'}`}>Planned</button>
                <button onClick={() => setFilter('completed')} className={`px-4 py-1 text-sm font-semibold rounded-md ${filter === 'completed' ? 'bg-white dark:bg-gray-900 text-brand-blue' : 'text-gray-600 dark:text-gray-400'}`}>Completed</button>
            </div>
        </div>

        <div className="space-y-2">
          {filteredTrades.length === 0 ? (
            <div className="text-center text-gray-500 py-16 bg-gray-100 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <p className="text-lg">No trades found for this filter.</p>
              <p className="text-sm">Use the Risk Management tool to plan and save your first trade.</p>
            </div>
          ) : (
            filteredTrades.map(trade => (
                <div key={trade.id} className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden transition-all duration-300">
                    <button
                        onClick={() => handleToggleExpand(trade.id)}
                        className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors"
                        aria-expanded={expandedTradeId === trade.id}
                        aria-controls={`trade-details-${trade.id}`}
                    >
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <p className="font-bold text-gray-900 dark:text-white">{trade.tradeParams.symbol}</p>
                            <span className={`text-sm font-semibold ${trade.tradeParams.direction === 'Long' ? 'text-green-500' : 'text-red-400'}`}>{trade.tradeParams.direction}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{trade.timestamp}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`text-xs sm:text-sm font-bold w-20 text-center py-1 px-2 rounded-md ${trade.outcome === TradeOutcome.Win ? 'bg-green-500/10 text-green-500' : trade.outcome === TradeOutcome.Loss ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                {trade.outcome}
                            </div>
                            <ChevronDownIcon className={`h-5 w-5 text-gray-500 transition-transform transform ${expandedTradeId === trade.id ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                    {expandedTradeId === trade.id && (
                        <div id={`trade-details-${trade.id}`} className="p-4 border-t border-gray-200 dark:border-gray-800">
                            <TradeJournalEntry trade={trade} onUpdateTrade={onUpdateTrade} />
                        </div>
                    )}
                </div>
            ))
          )}
        </div>
    </div>
  );
};

export default TradeJournalPage;