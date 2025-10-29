import React, { useState, useEffect, useCallback } from 'react';
import { SavedTrade, TradeOutcome, TradeParams, CalculationResult, AIInsights, AppSettings, PortfolioAsset } from './types';
import { SettingsIcon, HomeIcon, JournalIcon, ToolsIcon, PlusIcon, BrainIcon } from './constants';
import DisclaimerModal from './components/DisclaimerModal';
import HomePage from './components/HomePage';
import RiskManagementPage from './components/RiskManagementPage';
import TradeJournalPage from './components/TradeJournalPage';
import ProfitCalculatorPage from './components/ProfitCalculatorPage';
import PositionSizerPage from './components/PositionSizerPage';
import PortfolioTrackerPage from './components/PortfolioTrackerPage';
import SavedTradesListPage from './components/SavedTradesListPage';
import SettingsPage from './components/SettingsPage';
import BacktestPage from './components/BacktestPage';

export type Page = 'home' | 'risk' | 'journal' | 'profit' | 'sizer' | 'portfolio' | 'log' | 'settings' | 'backtest';
const LOCAL_STORAGE_TRADES_KEY = 'cryptoToolkitTrades';
const LOCAL_STORAGE_SETTINGS_KEY = 'cryptoToolkitSettings';
const LOCAL_STORAGE_PORTFOLIO_KEY = 'cryptoToolkitPortfolio';

const Header: React.FC<{ currentPage: Page; setCurrentPage: (page: Page) => void; }> = ({ currentPage, setCurrentPage }) => {
    const navItems: { page: Page; label: string; icon: React.ReactNode; }[] = [
        { page: 'home', label: 'Home', icon: <HomeIcon className="h-5 w-5" /> },
        { page: 'log', label: 'Trades', icon: <JournalIcon className="h-5 w-5" /> },
        { page: 'portfolio', label: 'Portfolio', icon: <ToolsIcon className="h-5 w-5" /> },
        { page: 'backtest', label: 'Backtest', icon: <BrainIcon className="h-5 w-5" /> },
        { page: 'settings', label: 'Settings', icon: <SettingsIcon className="h-5 w-5" /> },
    ];

    return (
      <header className="sticky top-0 z-30 bg-gray-100/80 dark:bg-gray-950/80 backdrop-blur-sm shadow-md mb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 max-w-7xl mx-auto">
              <button onClick={() => setCurrentPage('home')} className="flex items-center gap-3 group">
                  <span className="text-2xl">🛠️</span>
                  <h1 className="hidden sm:block text-xl font-display font-bold text-gray-800 dark:text-gray-100 group-hover:text-brand-blue transition-colors">
                      Crypto Trading Toolkit
                  </h1>
              </button>
              <nav className="flex items-center space-x-1 sm:space-x-2">
                  {navItems.map(item => (
                      <button 
                        key={item.page}
                        onClick={() => setCurrentPage(item.page)} 
                        className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === item.page ? 'text-brand-blue bg-blue-500/10' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'}`} 
                        aria-label={item.label}
                      >
                          {item.icon}
                          <span className="hidden sm:inline">{item.label}</span>
                      </button>
                  ))}
              </nav>
          </div>
      </header>
    );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);
  
  const [savedTrades, setSavedTrades] = useState<SavedTrade[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ theme: 'dark', baseCurrency: 'USD', defaultRiskPercent: 1, aiEnabled: true, apiKey: '' });
  
  const [tradeToLoad, setTradeToLoad] = useState<SavedTrade | null>(null);

  useEffect(() => {
    // Load settings and apply theme
    try {
      const storedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        if (typeof parsedSettings.aiEnabled === 'undefined') {
          parsedSettings.aiEnabled = true;
        }
        if (typeof parsedSettings.apiKey === 'undefined') {
          parsedSettings.apiKey = '';
        }
        setSettings(parsedSettings);
        if (parsedSettings.theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
        }
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    
    // Show disclaimer
    const disclaimerAccepted = localStorage.getItem('disclaimerAccepted');
    if (!disclaimerAccepted) setIsDisclaimerOpen(true);
    
    // Load trades
    try {
      const storedTrades = localStorage.getItem(LOCAL_STORAGE_TRADES_KEY);
      if (storedTrades) {
        const parsedTrades: SavedTrade[] = JSON.parse(storedTrades);
        const migratedTrades = parsedTrades.map(t => ({
          ...t,
          outcome: t.outcome || TradeOutcome.Planned,
          emotionRating: t.emotionRating || 5,
          tags: t.tags || [],
          notes: t.notes || '',
        }));
        setSavedTrades(migratedTrades);
      }
    } catch (e) { console.error("Failed to load saved trades:", e); }

    // Load portfolio
    try {
        const storedPortfolio = localStorage.getItem(LOCAL_STORAGE_PORTFOLIO_KEY);
        if (storedPortfolio) setPortfolio(JSON.parse(storedPortfolio));
    } catch (e) { console.error("Failed to load portfolio:", e); }
  }, []);

  const updateSettings = (newSettings: AppSettings) => {
      setSettings(newSettings);
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));
      if (newSettings.theme === 'light') {
          document.documentElement.classList.remove('dark');
      } else {
          document.documentElement.classList.add('dark');
      }
  };

  const handleDisclaimerAccept = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setIsDisclaimerOpen(false);
  };

  const handleSaveTrade = (tradeData: {tradeParams: TradeParams, calculationResult: CalculationResult, aiInsights: AIInsights | null, notes: string}) => {
    const newSave: SavedTrade = {
      id: new Date().toISOString(),
      timestamp: new Date().toLocaleString(),
      tradeParams: tradeData.tradeParams,
      calculationResult: tradeData.calculationResult,
      aiInsights: tradeData.aiInsights,
      outcome: TradeOutcome.Planned,
      emotionRating: 5,
      tags: [],
      notes: tradeData.notes
    };
    const updatedTrades = [newSave, ...savedTrades];
    setSavedTrades(updatedTrades);
    localStorage.setItem(LOCAL_STORAGE_TRADES_KEY, JSON.stringify(updatedTrades));
  };
  
  const updateTrade = (updatedTrade: SavedTrade) => {
    const updatedTrades = savedTrades.map(t => t.id === updatedTrade.id ? updatedTrade : t);
    setSavedTrades(updatedTrades);
    localStorage.setItem(LOCAL_STORAGE_TRADES_KEY, JSON.stringify(updatedTrades));
  };

  const handleLoadTrade = (trade: SavedTrade) => {
    setTradeToLoad(trade);
    setCurrentPage('risk');
  };
  
  const handleTradeLoaded = () => setTradeToLoad(null);

  const handleDeleteTrade = (id: string) => {
    const updatedTrades = savedTrades.filter(t => t.id !== id);
    setSavedTrades(updatedTrades);
    localStorage.setItem(LOCAL_STORAGE_TRADES_KEY, JSON.stringify(updatedTrades));
  };

  const handleClearAllTrades = () => {
    if (window.confirm("Are you sure you want to delete all saved trades? This action cannot be undone.")) {
      setSavedTrades([]);
      localStorage.removeItem(LOCAL_STORAGE_TRADES_KEY);
    }
  };
  
  const updatePortfolio = (newPortfolio: PortfolioAsset[]) => {
      setPortfolio(newPortfolio);
      localStorage.setItem(LOCAL_STORAGE_PORTFOLIO_KEY, JSON.stringify(newPortfolio));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'risk': return <RiskManagementPage onSaveTrade={handleSaveTrade} tradeToLoad={tradeToLoad} onTradeLoaded={handleTradeLoaded} defaultRiskPercent={settings.defaultRiskPercent} aiEnabled={settings.aiEnabled} apiKey={settings.apiKey} />;
      case 'journal': return <TradeJournalPage savedTrades={savedTrades} onUpdateTrade={updateTrade} />;
      case 'profit': return <ProfitCalculatorPage />;
      case 'sizer': return <PositionSizerPage defaultRiskPercent={settings.defaultRiskPercent} />;
      case 'portfolio': return <PortfolioTrackerPage portfolio={portfolio} onUpdatePortfolio={updatePortfolio} baseCurrency={settings.baseCurrency} />;
      case 'log': return <SavedTradesListPage savedTrades={savedTrades} onLoad={handleLoadTrade} onDelete={handleDeleteTrade} onClearAll={handleClearAllTrades} onUpdateTrade={updateTrade} />;
      case 'settings': return <SettingsPage settings={settings} onUpdateSettings={updateSettings} onClearData={() => { handleClearAllTrades(); updatePortfolio([]); }} />;
      case 'backtest': return <BacktestPage apiKey={settings.apiKey} />;
      case 'home':
      default: return <HomePage setCurrentPage={setCurrentPage} savedTrades={savedTrades} portfolio={portfolio} baseCurrency={settings.baseCurrency} />;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
        
        <main className="mt-4">
          {renderPage()}
        </main>

        <footer className="text-center mt-12 text-gray-500 dark:text-gray-600 text-sm">
          This is not financial advice. All tools are for educational purposes only.
        </footer>
      </div>

      <button
        onClick={() => setCurrentPage('risk')}
        className="fixed bottom-6 right-6 bg-brand-blue text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 dark:focus:ring-offset-gray-950"
        aria-label="New Trade"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      <DisclaimerModal isOpen={isDisclaimerOpen} onAccept={handleDisclaimerAccept} />
    </div>
  );
}