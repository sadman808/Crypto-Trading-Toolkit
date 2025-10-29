import React from 'react';
import { Page } from '../App';
import { SavedTrade, PortfolioAsset, TradeOutcome } from '../types';
import { CalculatorIcon, FolderIcon, JournalIcon, ToolsIcon, ArrowTrendingUpIcon, ChartPieIcon, ListIcon, BrainIcon, CheckIcon } from '../constants';

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
  savedTrades: SavedTrade[];
  portfolio: PortfolioAsset[];
  baseCurrency: string;
}

const StatCard = ({ title, value, change, icon, changeColor }: { title: string, value: string, change?: string, icon: React.ReactNode, changeColor?: string }) => (
    <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-center">
        <div className="p-3 rounded-full bg-blue-500/10 text-brand-blue mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{value}</p>
            {change && <p className={`text-xs font-semibold ${changeColor}`}>{change}</p>}
        </div>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage, savedTrades, portfolio, baseCurrency }) => {
    
    const completedTrades = savedTrades.filter(t => t.outcome === TradeOutcome.Win || t.outcome === TradeOutcome.Loss);
    const totalWins = completedTrades.filter(t => t.outcome === TradeOutcome.Win).length;
    const winRate = completedTrades.length > 0 ? (totalWins / completedTrades.length) * 100 : 0;
    
    const totalPL = completedTrades.reduce((acc, trade) => {
        const pnl = trade.outcome === TradeOutcome.Win
            ? trade.calculationResult.maxLossFiat * trade.calculationResult.rewardRiskRatio
            : -trade.calculationResult.maxLossFiat;
        return acc + pnl;
    }, 0);

    const portfolioValue = portfolio.reduce((acc, asset) => acc + (asset.quantity * asset.currentPrice), 0);

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: baseCurrency }).format(value);

    const tools = [
        { page: 'risk', title: 'Risk Management AI', description: 'Calculate position size and get AI-powered insights.', icon: <ArrowTrendingUpIcon className="h-8 w-8 text-brand-blue" /> },
        { page: 'backtest', title: 'Backtest AI', description: 'Simulate your trading strategies on historical market data.', icon: <BrainIcon className="h-8 w-8 text-teal-500" /> },
        { page: 'profit', title: 'Profit Calculator', description: 'Quickly calculate potential profit or loss for a trade.', icon: <CalculatorIcon className="h-8 w-8 text-green-500" /> },
        { page: 'sizer', title: 'Position Sizer', description: 'Determine the correct position size based on your risk.', icon: <ToolsIcon className="h-8 w-8 text-yellow-500" /> },
        { page: 'portfolio', title: 'Portfolio Tracker', description: 'Monitor your holdings and overall performance.', icon: <ChartPieIcon className="h-8 w-8 text-indigo-500" /> },
        { page: 'log', title: 'Saved Trades Log', description: 'A detailed, filterable log of all your past trades.', icon: <ListIcon className="h-8 w-8 text-purple-500" /> },
        { page: 'journal', title: 'Trade Journal', description: 'Analyze performance with charts and qualitative notes.', icon: <JournalIcon className="h-8 w-8 text-pink-500" /> },
    ];

  return (
    <div>
      <div className="text-left mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-md text-gray-500 dark:text-gray-400 mt-1">Your all-in-one smart trading suite.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total P/L" value={formatCurrency(totalPL)} change={`${totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)} vs Start`} icon={<FolderIcon className="h-6 w-6" />} changeColor={totalPL >= 0 ? 'text-green-500' : 'text-red-500'} />
          <StatCard title="Portfolio Value" value={formatCurrency(portfolioValue)} icon={<ChartPieIcon className="h-6 w-6" />} />
          <StatCard title="Win Rate" value={`${winRate.toFixed(1)}%`} change={`${totalWins} Wins / ${completedTrades.length - totalWins} Losses`} icon={<CheckIcon className="h-6 w-6" />} changeColor="text-gray-500" />
          <StatCard title="Saved Trades" value={savedTrades.length.toString()} icon={<ListIcon className="h-6 w-6" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => (
            <ToolCard
                key={tool.page}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                onClick={() => setCurrentPage(tool.page as Page)}
            />
        ))}
      </div>
    </div>
  );
};

interface ToolCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-left hover:border-brand-blue hover:scale-[1.03] transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950"
    >
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
    </button>
);

export default HomePage;