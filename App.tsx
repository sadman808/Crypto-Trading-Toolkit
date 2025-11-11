
import React, { useState, useEffect, useCallback } from 'react';
import { SavedTrade, TradeOutcome, TradeParams, CalculationResult, AIInsights, AppSettings, PortfolioAsset, Currency } from './types';
import { SettingsIcon, HomeIcon, JournalIcon, ToolsIcon, PlusIcon, BrainIcon, SignOutIcon } from './constants';
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
import AuthPage from './components/AuthPage';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import EducationPage from './components/EducationPage';


export type Page = 'home' | 'risk' | 'journal' | 'profit' | 'sizer' | 'portfolio' | 'log' | 'settings' | 'backtest' | 'education';

const DEFAULT_SETTINGS: AppSettings = { theme: 'dark', baseCurrency: Currency.USD, defaultRiskPercent: 1, aiEnabled: true, apiKey: '' };

const Header: React.FC<{ currentPage: Page; setCurrentPage: (page: Page) => void; session: Session | null }> = ({ currentPage, setCurrentPage, session }) => {
    const navItems: { page: Page; label: string; icon: React.ReactNode; }[] = [
        { page: 'home', label: 'Home', icon: <HomeIcon className="h-5 w-5" /> },
        { page: 'log', label: 'Trades', icon: <JournalIcon className="h-5 w-5" /> },
        { page: 'portfolio', label: 'Portfolio', icon: <ToolsIcon className="h-5 w-5" /> },
        { page: 'backtest', label: 'Backtest', icon: <BrainIcon className="h-5 w-5" /> },
        { page: 'education', label: 'Education', icon: <JournalIcon className="h-5 w-5" /> },
        { page: 'settings', label: 'Settings', icon: <SettingsIcon className="h-5 w-5" /> },
    ];

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
      <header className="sticky top-0 z-30 bg-gray-100/80 dark:bg-gray-950/80 backdrop-blur-sm shadow-md mb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 max-w-7xl mx-auto">
              <button onClick={() => setCurrentPage('home')} className="flex items-center gap-3 group">
                  <span className="text-2xl">🛠️</span>
                  <h1 className="hidden sm:block text-xl font-display font-bold text-gray-800 dark:text-gray-100 group-hover:text-brand-blue transition-colors">
                      Trading Toolkit
                  </h1>
              </button>
              <div className="flex items-center gap-2">
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
                {session && (
                    <button 
                        onClick={handleSignOut} 
                        className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Sign Out"
                    >
                        <SignOutIcon className="h-5 w-5" />
                    </button>
                )}
              </div>
          </div>
      </header>
    );
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);
  
  const [savedTrades, setSavedTrades] = useState<SavedTrade[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  const [tradeToLoad, setTradeToLoad] = useState<SavedTrade | null>(null);

  useEffect(() => {
    // Check for active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Show disclaimer on first visit
    const disclaimerAccepted = localStorage.getItem('disclaimerAccepted');
    if (!disclaimerAccepted) setIsDisclaimerOpen(true);

    return () => subscription.unsubscribe();
  }, []);

  // Effect to fetch data when a session is available
  useEffect(() => {
    if (session) {
      fetchSettings();
      fetchTrades();
      fetchPortfolio();
    } else {
      // Clear data on logout
      setSavedTrades([]);
      setPortfolio([]);
      setSettings(DEFAULT_SETTINGS);
    }
  }, [session]);
  
  // Effect to apply theme when settings change
  useEffect(() => {
      if (settings.theme === 'light') {
          document.documentElement.classList.remove('dark');
      } else {
          document.documentElement.classList.add('dark');
      }
  }, [settings.theme]);

  // --- Data Fetching Functions ---
  const fetchSettings = async () => {
    if (!session) return;
    const { data, error } = await supabase.from('settings').select('*').eq('user_id', session.user.id).single();
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching settings:', error.message);
    } else if (data) {
        setSettings({
            theme: data.theme || 'dark',
            baseCurrency: data.base_currency || 'USD',
            defaultRiskPercent: data.default_risk_percent || 1,
            aiEnabled: data.ai_enabled !== false, // default to true
            apiKey: data.api_key || '',
        });
    } else {
        // No settings found, can create default ones if needed
        setSettings(DEFAULT_SETTINGS);
    }
  };

  const fetchTrades = async () => {
    if (!session) return;
    const { data, error } = await supabase.from('trades').select('trade_data').eq('user_id', session.user.id).order('created_at', { ascending: false });
    if (error) console.error("Error fetching trades:", error);
    else setSavedTrades(data.map((d: any) => d.trade_data));
  };
  
  const fetchPortfolio = async () => {
    if (!session) return;
    const { data, error } = await supabase.from('portfolio').select('*').eq('user_id', session.user.id);
    if (error) console.error("Error fetching portfolio:", error);
    else {
        const mappedPortfolio: PortfolioAsset[] = data.map((asset: any) => ({
            id: asset.asset_id,
            name: asset.name,
            quantity: asset.quantity,
            avgBuyPrice: asset.avg_buy_price,
            currentPrice: asset.current_price,
        }));
        setPortfolio(mappedPortfolio);
    }
  };


  // --- Data Modification Functions ---
  const updateSettings = async (newSettings: AppSettings) => {
    if (!session) return;
    setSettings(newSettings);
    const { error } = await supabase.from('settings').upsert({
        user_id: session.user.id,
        theme: newSettings.theme,
        base_currency: newSettings.baseCurrency,
        default_risk_percent: newSettings.defaultRiskPercent,
        ai_enabled: newSettings.aiEnabled,
        api_key: newSettings.apiKey
    });
    if (error) console.error("Error saving settings:", error.message);
  };

  const handleDisclaimerAccept = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setIsDisclaimerOpen(false);
  };

  const handleSaveTrade = async (tradeData: {tradeParams: TradeParams, calculationResult: CalculationResult, aiInsights: AIInsights | null, notes: string}) => {
    if (!session) return;
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
    
    setSavedTrades([newSave, ...savedTrades]); // Optimistic update
    const { error } = await supabase.from('trades').insert({
        id: newSave.id,
        user_id: session.user.id,
        trade_data: newSave
    });
    if (error) {
        console.error("Error saving trade:", error);
        alert("Failed to save trade to the database.");
        setSavedTrades(savedTrades.filter(t => t.id !== newSave.id)); // Revert
    }
  };
  
  const updateTrade = async (updatedTrade: SavedTrade) => {
    setSavedTrades(savedTrades.map(t => t.id === updatedTrade.id ? updatedTrade : t)); // Optimistic
    const { error } = await supabase.from('trades').update({ trade_data: updatedTrade }).eq('id', updatedTrade.id);
    if (error) {
        console.error("Error updating trade:", error);
        alert("Failed to update trade.");
        fetchTrades(); // Re-fetch to correct state
    }
  };

  const handleLoadTrade = (trade: SavedTrade) => {
    setTradeToLoad(trade);
    setCurrentPage('risk');
  };
  
  const handleTradeLoaded = () => setTradeToLoad(null);

  const handleDeleteTrade = async (id: string) => {
    setSavedTrades(savedTrades.filter(t => t.id !== id)); // Optimistic
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (error) {
        console.error("Error deleting trade:", error);
        alert("Failed to delete trade.");
        fetchTrades(); // Re-fetch
    }
  };

  const handleClearAllTrades = async () => {
    if (window.confirm("Are you sure you want to delete all saved trades? This action cannot be undone.")) {
      const originalTrades = [...savedTrades];
      setSavedTrades([]); // Optimistic
      const { error } = await supabase.from('trades').delete().eq('user_id', session!.user.id);
      if (error) {
          console.error("Error clearing trades:", error);
          alert("Failed to clear all trades.");
          setSavedTrades(originalTrades); // Revert
      }
    }
  };
  
  const updatePortfolio = async (newPortfolio: PortfolioAsset[]) => {
      if (!session) return;
      const originalPortfolio = [...portfolio];
      setPortfolio(newPortfolio); // Optimistic

      const { error: deleteError } = await supabase.from('portfolio').delete().eq('user_id', session.user.id);
      if (deleteError) {
          console.error("Error clearing old portfolio:", deleteError);
          setPortfolio(originalPortfolio); // Revert
          return;
      }
      
      if (newPortfolio.length > 0) {
          const newRows = newPortfolio.map(asset => ({
              user_id: session.user.id,
              asset_id: asset.id,
              name: asset.name,
              quantity: asset.quantity,
              avg_buy_price: asset.avgBuyPrice,
              current_price: asset.currentPrice
          }));
          const { error: insertError } = await supabase.from('portfolio').insert(newRows);
          if (insertError) {
              console.error("Error saving new portfolio:", insertError);
              setPortfolio(originalPortfolio); // Revert
          }
      }
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
      case 'education': return <EducationPage apiKey={settings.apiKey} />;
      case 'home':
      default: return <HomePage setCurrentPage={setCurrentPage} savedTrades={savedTrades} portfolio={portfolio} baseCurrency={settings.baseCurrency} />;
    }
  };
  
  if (!session) {
      return <AuthPage />;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} session={session} />
        
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