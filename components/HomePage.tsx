import React from 'react';
import { Page } from '../App';
import { SavedTrade, PortfolioAsset, TradeOutcome, AppSettings } from '../types';
import { JournalIcon, ArrowTrendingUpIcon, ChartPieIcon, CheckIcon, ScaleIcon, ClockIcon, FolderIcon, CubeIcon, ClipboardDocumentListIcon, BrainIcon, HeartIcon, ChartBarIcon, SettingsIcon } from '../constants';

// --- Reusable Components for the new Dashboard ---

const StatCard = ({ title, value, icon, subValue, subColor }: { title: string, value: string, icon: React.ReactNode, subValue?: string, subColor?: string }) => (
    <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500/10 text-brand-blue mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{value}</p>
            </div>
        </div>
        {subValue && <p className={`text-xs font-semibold mt-2 ${subColor}`}>{subValue}</p>}
    </div>
);

// FIX: Changed QuickActionButton to use React.FC to correctly type the component and allow the 'key' prop during mapping.
interface QuickActionButtonProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ title, description, icon, onClick }) => (
    <button onClick={onClick} className="w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4 text-left hover:border-brand-blue hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center gap-4">
        <div className="p-3 rounded-full bg-blue-500/10 text-brand-blue">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </button>
);

const AllFeaturesButton = QuickActionButton;


const RecentTradesChart: React.FC<{ trades: SavedTrade[], currency: string }> = ({ trades, currency }) => {
    const last10Trades = trades.slice(0, 10).reverse();
    if (last10Trades.length === 0) {
        return <div className="flex items-center justify-center h-full text-sm text-gray-500">No recent trades to display.</div>;
    }

    const pnlValues = last10Trades.map(t => {
        if (t.outcome === 'Win') return t.calculationResult.maxLossFiat * t.calculationResult.rewardRiskRatio;
        if (t.outcome === 'Loss') return -t.calculationResult.maxLossFiat;
        return 0;
    });

    const maxAbsPnl = Math.max(1, ...pnlValues.map(Math.abs)); // Avoid division by zero
    const barWidth = 100 / last10Trades.length;

    return (
        <div className="h-full">
            <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
                <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" className="text-gray-300 dark:text-gray-700" strokeWidth="0.5" />
                {last10Trades.map((trade, i) => {
                    const pnl = pnlValues[i];
                    const barHeight = (Math.abs(pnl) / maxAbsPnl) * 24; // Max height is 24 (just under half of the 50 viewbox)
                    const y = pnl >= 0 ? 25 - barHeight : 25;
                    const color = pnl >= 0 ? 'text-green-500' : 'text-red-500';

                    return (
                        <rect 
                            key={trade.id}
                            x={i * barWidth + barWidth * 0.15}
                            y={y}
                            width={barWidth * 0.7}
                            height={barHeight}
                            className={`fill-current ${color}`}
                        >
                            <title>{`${trade.tradeParams.symbol}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(pnl)}`}</title>
                        </rect>
                    );
                })}
            </svg>
        </div>
    );
};

const PortfolioDonutChart: React.FC<{ portfolio: PortfolioAsset[] }> = ({ portfolio }) => {
    const totalValue = portfolio.reduce((sum, asset) => sum + asset.quantity * asset.currentPrice, 0);
    if (totalValue === 0) {
        return <div className="flex items-center justify-center h-full text-sm text-gray-500">No assets in portfolio.</div>
    }

    const chartData = portfolio
        .map(asset => ({ name: asset.id, value: asset.quantity * asset.currentPrice }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Show top 5
    
    const othersValue = portfolio.slice(5).reduce((sum, asset) => sum + asset.quantity * asset.currentPrice, 0);
    if (othersValue > 0) {
        chartData.push({ name: 'Others', value: othersValue });
    }

    const COLORS = ["#0070f3", "#00b894", "#fdcb6e", "#d63031", "#6c5ce7", "#e84393"];
    let cumulative = 0;
    
    return (
        <div className="flex items-center gap-4 h-full">
            <div className="w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 36 36">
                    {chartData.map((item, index) => {
                        const percentage = item.value / totalValue * 100;
                        const strokeDasharray = `${percentage} ${100 - percentage}`;
                        const strokeDashoffset = -cumulative;
                        cumulative += percentage;
                        return (
                            <circle
                                key={item.name}
                                cx="18" cy="18" r="15.915"
                                fill="transparent"
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth="3.8"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 18 18)"
                            />
                        );
                    })}
                </svg>
            </div>
            <div className="space-y-1 text-xs overflow-y-auto">
                {chartData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">({(item.value / totalValue * 100).toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecentTradesFeed: React.FC<{ trades: SavedTrade[] }> = ({ trades }) => {
    const recentTrades = trades.slice(0, 5);
    
    const getIcon = (outcome: TradeOutcome) => {
        switch (outcome) {
            case 'Win': return <div className="w-2 h-2 rounded-full bg-green-500" />;
            case 'Loss': return <div className="w-2 h-2 rounded-full bg-red-500" />;
            case 'Planned': return <div className="w-2 h-2 rounded-full bg-gray-500" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-3">
            {recentTrades.length > 0 ? recentTrades.map(trade => (
                <div key={trade.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        {getIcon(trade.outcome)}
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{trade.tradeParams.symbol}</p>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">{new Date(trade.timestamp).toLocaleDateString()}</p>
                </div>
            )) : <p className="text-sm text-center text-gray-500 py-4">No trades have been saved yet.</p>}
        </div>
    );
};

const TradingRulesWidget: React.FC<{ rules: string[], onEditClick: () => void }> = ({ rules, onEditClick }) => {
    return (
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <CheckIcon className="h-5 w-5" /> My Trading Rules
                </h3>
                <button onClick={onEditClick} className="text-xs font-semibold text-brand-blue hover:underline">Edit</button>
            </div>
            {rules && rules.length > 0 ? (
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                    {rules.slice(0, 4).map((rule, index) => (
                        <li key={index} className="truncate" title={rule}>{rule}</li>
                    ))}
                    {rules.length > 4 && <li className="text-xs text-gray-500">...and {rules.length - 4} more</li>}
                </ul>
            ) : (
                <p className="text-sm text-center text-gray-500 py-2">No trading rules defined. <button onClick={onEditClick} className="font-semibold text-brand-blue hover:underline">Add some in Settings</button>.</p>
            )}
        </div>
    );
};


// --- Main Page Component ---
interface HomePageProps {
  setCurrentPage: (page: Page) => void;
  savedTrades: SavedTrade[];
  portfolio: PortfolioAsset[];
  baseCurrency: string;
  settings: AppSettings;
}

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage, savedTrades, portfolio, baseCurrency, settings }) => {
    
    // --- Calculations ---
    const completedTrades = savedTrades.filter(t => t.outcome === TradeOutcome.Win || t.outcome === TradeOutcome.Loss);
    const totalWins = completedTrades.filter(t => t.outcome === TradeOutcome.Win).length;
    const winRate = completedTrades.length > 0 ? (totalWins / completedTrades.length) * 100 : 0;
    
    const grossProfit = completedTrades
        .filter(t => t.outcome === TradeOutcome.Win)
        .reduce((acc, trade) => acc + (trade.calculationResult.maxLossFiat * trade.calculationResult.rewardRiskRatio), 0);
        
    const grossLoss = completedTrades
        .filter(t => t.outcome === TradeOutcome.Loss)
        .reduce((acc, trade) => acc + trade.calculationResult.maxLossFiat, 0);

    const totalPL = grossProfit - grossLoss;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
    
    const portfolioValue = portfolio.reduce((acc, asset) => acc + (asset.quantity * asset.currentPrice), 0);
    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: baseCurrency }).format(value);

    const allFeatures = [
        { page: 'risk', title: 'Risk Management AI', description: 'Plan trades with AI-powered risk analysis', icon: <ArrowTrendingUpIcon className="h-6 w-6" /> },
        { page: 'journal', title: 'Trading Journal', description: 'Log daily routines, trades, and weekly reviews', icon: <JournalIcon className="h-6 w-6" /> },
        { page: 'log', title: 'Trade Log', description: 'View and manage all saved trade plans', icon: <ClipboardDocumentListIcon className="h-6 w-6" /> },
        { page: 'assets', title: 'Asset Library', description: 'Your personal research database for instruments', icon: <CubeIcon className="h-6 w-6" /> },
        { page: 'playbook', title: 'Trading Playbook', description: 'Document and review your A+ setups', icon: <BrainIcon className="h-6 w-6" /> },
        { page: 'watchlist', title: 'Watchlist', description: 'Keep an eye on potential opportunities', icon: <ArrowTrendingUpIcon className="h-6 w-6" /> },
        { page: 'mindset', title: 'Mindset & Psychology', description: 'Build discipline with routines and reflections', icon: <HeartIcon className="h-6 w-6" /> },
        { page: 'backtest', title: 'Backtest Sheets', description: 'Manually backtest and analyze strategies', icon: <BrainIcon className="h-6 w-6" /> },
        { page: 'compound', title: 'Compounding Calculator', description: 'Project account growth and analyze its feasibility', icon: <ChartBarIcon className="h-6 w-6" /> },
        { page: 'education', title: 'Education Hub', description: 'Organize courses and create study notes', icon: <JournalIcon className="h-6 w-6" /> },
        { page: 'settings', title: 'Settings', description: 'Customize your toolkit and manage API keys', icon: <SettingsIcon className="h-6 w-6" /> },
    ];

    // --- Component Structure ---
    return (
        <div className="space-y-8">
            <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-gray-100">Advanced Dashboard</h1>
                <p className="text-md text-gray-500 dark:text-gray-400 mt-1">Your trading command center.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard title="Total P/L" value={formatCurrency(totalPL)} icon={<FolderIcon className="h-6 w-6" />} subValue={`${completedTrades.length} trades`} subColor={totalPL >= 0 ? 'text-green-500' : 'text-red-500'} />
                        <StatCard title="Portfolio Value" value={formatCurrency(portfolioValue)} icon={<ChartPieIcon className="h-6 w-6" />} />
                        <StatCard title="Win Rate" value={`${winRate.toFixed(1)}%`} icon={<CheckIcon className="h-6 w-6" />} subValue={`${totalWins}W / ${completedTrades.length - totalWins}L`} subColor="text-gray-500" />
                        <StatCard title="Profit Factor" value={profitFactor.toFixed(2)} icon={<ScaleIcon className="h-6 w-6" />} subColor={profitFactor >= 1 ? 'text-green-500' : 'text-red-500'} />
                    </div>

                    {/* Recent Performance Chart */}
                     <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-48">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-2">Recent Performance (Last 10 Trades)</h3>
                        <RecentTradesChart trades={completedTrades} currency={baseCurrency} />
                    </div>

                    {/* Portfolio & Extra Tools */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-48">
                             <h3 className="font-bold text-gray-800 dark:text-white mb-2">Portfolio Allocation</h3>
                             <PortfolioDonutChart portfolio={portfolio} />
                        </div>
                         <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-48">
                            <h3 className="font-bold text-gray-800 dark:text-white mb-2">Future Widget</h3>
                            <div className="flex items-center justify-center h-full text-sm text-gray-500">Coming soon...</div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Area */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <QuickActionButton title="Plan New Trade" description="Open the Risk Management AI" icon={<ArrowTrendingUpIcon className="h-6 w-6" />} onClick={() => setCurrentPage('risk')} />
                            <QuickActionButton title="Open Journal" description="Log today's thoughts & trades" icon={<JournalIcon className="h-6 w-6" />} onClick={() => setCurrentPage('journal')} />
                            <QuickActionButton title="Review Playbook" description="Check your 'A+' setups" icon={<BrainIcon className="h-6 w-6" />} onClick={() => setCurrentPage('playbook')} />
                        </div>
                    </div>

                    {/* Trading Rules Widget */}
                    <TradingRulesWidget rules={settings.tradingRules} onEditClick={() => setCurrentPage('settings')} />

                     {/* Recent Trades Feed */}
                    <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                           <ClockIcon className="h-5 w-5" /> Recent Trades
                        </h3>
                        <RecentTradesFeed trades={savedTrades} />
                    </div>
                </div>
            </div>

            {/* All Features Section */}
            <div className="mt-12">
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">All Features</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allFeatures.map(feature => (
                        <AllFeaturesButton 
                            key={feature.page}
                            title={feature.title}
                            description={feature.description}
                            icon={feature.icon}
                            onClick={() => setCurrentPage(feature.page as Page)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;