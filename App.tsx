

import React, { useState, useEffect, useCallback } from 'react';
import { SavedTrade, TradeOutcome, TradeParams, CalculationResult, AIInsights, AppSettings, PortfolioAsset, Currency, BacktestStrategy } from './types';
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
  const [strategies, setStrategies] = useState<BacktestStrategy[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  const [tradeToLoad, setTradeToLoad] = useState<SavedTrade | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

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
  
  // Effect to apply theme when settings change
  useEffect(() => {
      if (settings.theme === 'light') {
          document.documentElement.classList.remove('dark');
      } else {
          document.documentElement.classList.add('dark');
      }
  }, [settings.theme]);

  const handleDbError = (error: any, context: string): boolean => {
      // Check for common "table not found" errors from PostgreSQL and PostgREST
      const isMissingTableError = error && (
          String(error.code) === '42P01' || // undefined_table from postgres
          String(error.code) === 'PGRST205'  // Not Found from PostgREST
      );

      if (isMissingTableError) {
          let tableName = '';
          // Try to extract table name from different message formats
          if (error.message && typeof error.message === 'string') {
              const relationMatch = error.message.match(/relation "public\.(.*?)" does not exist/);
              const tableMatch = error.message.match(/Could not find the table 'public\.(.*?)'/);
              const foundName = (relationMatch && relationMatch[1]) || (tableMatch && tableMatch[1]);
              if (foundName) {
                  tableName = foundName;
              }
          }
          
          // Provide a specific message if we found the table name, otherwise a general one.
          const specificMessage = tableName 
            ? `The table '${tableName}' appears to be missing.`
            : 'A required table is missing from your database.';
          
          setDbError(`Database setup needed: ${specificMessage} Please go to your Supabase project's SQL Editor and run the setup script to create the necessary tables ('trades', 'settings', 'portfolio', 'strategies').`);
          return true; // Indicates a DB setup error was handled
      }

      if (error) {
          console.error(`Error ${context}:`, error);
      }
      return false;
  };

  // --- Data Fetching Functions ---
  const fetchSettings = async () => {
    if (!session) return;
    const { data, error } = await supabase.from('settings').select('*').eq('user_id', session.user.id).single();
    if (error) {
        if (handleDbError(error, 'fetching settings')) {
            setSettings(DEFAULT_SETTINGS); // Fallback to default
            return;
        }
        if (error.code !== 'PGRST116') { // PGRST116 means no rows found
             console.error('Error fetching settings:', error.message);
        } else {
            setSettings(DEFAULT_SETTINGS); // No settings exist for user, use default
        }
    } else if (data) {
        setSettings({
            theme: data.theme || 'dark',
            baseCurrency: data.base_currency || 'USD',
            defaultRiskPercent: data.default_risk_percent || 1,
            aiEnabled: data.ai_enabled !== false, // default to true
            apiKey: data.api_key || '',
        });
    } else {
        setSettings(DEFAULT_SETTINGS);
    }
  };

  const fetchTrades = async () => {
    if (!session) return;
    const { data, error } = await supabase.from('trades').select('trade_data').eq('user_id', session.user.id).order('created_at', { ascending: false });
    if (handleDbError(error, 'fetching trades')) {
        setSavedTrades([]); // Fallback to empty
        return;
    }
    if (data) setSavedTrades(data.map((d: any) => d.trade_data));
  };
  
  const fetchPortfolio = async () => {
    if (!session) return;
    const { data, error } = await supabase.from('portfolio').select('*').eq('user_id', session.user.id);
    if (handleDbError(error, 'fetching portfolio')) {
        setPortfolio([]); // Fallback to empty
        return;
    }
    if (data) {
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

  const fetchStrategies = async () => {
    if (!session) return;
    const { data, error } = await supabase.from('strategies').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    if (handleDbError(error, 'fetching strategies')) {
        setStrategies([]);
        return;
    }
    if (data) setStrategies(data);
  };


  // Effect to fetch data when a session is available
  useEffect(() => {
    if (session) {
      setDbError(null); // Clear previous errors on session change/re-fetch
      fetchSettings();
      fetchTrades();
      fetchPortfolio();
      fetchStrategies();
    } else {
      // Clear data on logout
      setSavedTrades([]);
      setPortfolio([]);
      setStrategies([]);
      setSettings(DEFAULT_SETTINGS);
      setDbError(null);
    }
  }, [session]);


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
    if (handleDbError(error, 'saving settings')) return;
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
    if (handleDbError(error, 'saving trade')) {
        setSavedTrades(savedTrades.filter(t => t.id !== newSave.id)); // Revert
        return;
    }
  };
  
  const updateTrade = async (updatedTrade: SavedTrade) => {
    setSavedTrades(savedTrades.map(t => t.id === updatedTrade.id ? updatedTrade : t)); // Optimistic
    const { error } = await supabase.from('trades').update({ trade_data: updatedTrade }).eq('id', updatedTrade.id);
    if (handleDbError(error, 'updating trade')) {
        fetchTrades(); // Re-fetch to correct state
        return;
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
    if (handleDbError(error, 'deleting trade')) {
        fetchTrades(); // Re-fetch
        return;
    }
  };

  const handleClearAllTrades = async () => {
    if (window.confirm("Are you sure you want to delete all saved trades? This action cannot be undone.")) {
      const originalTrades = [...savedTrades];
      setSavedTrades([]); // Optimistic
      const { error } = await supabase.from('trades').delete().eq('user_id', session!.user.id);
      if (handleDbError(error, 'clearing trades')) {
          setSavedTrades(originalTrades); // Revert
          return;
      }
    }
  };
  
  const updatePortfolio = async (newPortfolio: PortfolioAsset[]) => {
      if (!session) return;
      const originalPortfolio = [...portfolio];
      setPortfolio(newPortfolio); // Optimistic

      const { error: deleteError } = await supabase.from('portfolio').delete().eq('user_id', session.user.id);
      if (handleDbError(deleteError, 'clearing old portfolio')) {
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
          if (handleDbError(insertError, 'saving new portfolio')) {
              setPortfolio(originalPortfolio); // Revert
          }
      }
  };

  const addStrategy = async (strategy: Omit<BacktestStrategy, 'id' | 'created_at' | 'user_id'>) => {
    if (!session) return;
    const { data, error } = await supabase.from('strategies').insert({ ...strategy, user_id: session.user.id }).select();
    if (handleDbError(error, 'adding strategy')) return null;
    if (data) {
        setStrategies([data[0], ...strategies]);
        return data[0];
    }
    return null;
  };

  const updateStrategy = async (strategy: BacktestStrategy) => {
      if (!session) return;
      setStrategies(strategies.map(s => s.id === strategy.id ? strategy : s)); // Optimistic
      const { error } = await supabase.from('strategies').update(strategy).eq('id', strategy.id);
      if (handleDbError(error, 'updating strategy')) fetchStrategies();
  };

  const deleteStrategy = async (id: string) => {
      if (!session) return;
      setStrategies(strategies.filter(s => s.id !== id)); // Optimistic
      const { error } = await supabase.from('strategies').delete().eq('id', id);
      if (handleDbError(error, 'deleting strategy')) fetchStrategies();
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
      case 'backtest': return <BacktestPage strategies={strategies} onAddStrategy={addStrategy} onUpdateStrategy={updateStrategy} onDeleteStrategy={deleteStrategy} />;
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
        
        {isDisclaimerOpen && <DisclaimerModal onAccept={handleDisclaimerAccept} />}
        
        {dbError && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md my-4" role="alert">
                <p className="font-bold">Database Configuration Error</p>
                <p>{dbError}</p>
            </div>
        )}
        
        <main>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}