import React, { useState, useEffect, useCallback } from 'react';
import { SavedTrade, TradeOutcome, TradeParams, CalculationResult, AIInsights, AppSettings, PortfolioAsset, Currency, BacktestStrategy, DailyReflection } from './types';
import { SettingsIcon, HomeIcon, JournalIcon, ToolsIcon, BrainIcon, SignOutIcon, ChartBarIcon, HeartIcon } from './constants';
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
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import EducationPage from './components/EducationPage';
import CompoundingPage from './components/CompoundingPage';
import MindsetPage from './components/MindsetPage';
import LossProtocolModal from './components/LossProtocolModal';
import Spinner from './components/Spinner';
import DatabaseSetupMessage from './components/DatabaseSetupMessage';


export type Page = 'home' | 'risk' | 'journal' | 'profit' | 'sizer' | 'portfolio' | 'log' | 'settings' | 'backtest' | 'education' | 'compound' | 'mindset';

const DEFAULT_SETTINGS: AppSettings = { 
    theme: 'dark', 
    baseCurrency: Currency.USD, 
    defaultRiskPercent: 1, 
    aiEnabled: true, 
    apiKey: '',
    tradingRules: [
        "Is the trade with the trend?",
        "Is there a clear invalidation point?",
        "Does the R:R meet my minimum of 1.5:1?"
    ],
    lossRecoveryProtocol: {
        consecutiveLosses: 3,
        rules: [
            "Stop trading for the rest of the day.",
            "Review the last 5 trades to find mistakes.",
            "Reduce position size by 50% for the next trade."
        ]
    },
    routine: {
        preMarketChecklist: [
            { text: "Check economic calendar for high-impact news." },
            { text: "Review key market levels (support/resistance)." },
            { text: "State my bias for the day (bullish/bearish/neutral)." }
        ],
        affirmations: [
            "I will stick to my trading plan.",
            "I am disciplined and patient."
        ],
        stopTime: "16:00"
    }
};

const Header: React.FC<{ currentPage: Page; setCurrentPage: (page: Page) => void; session: Session | null }> = ({ currentPage, setCurrentPage, session }) => {
    const navItems: { page: Page; label: string; icon: React.ReactNode; }[] = [
        { page: 'home', label: 'Home', icon: <HomeIcon className="h-5 w-5" /> },
        { page: 'log', label: 'Trades', icon: <JournalIcon className="h-5 w-5" /> },
        { page: 'mindset', label: 'Mindset', icon: <HeartIcon className="h-5 w-5" /> },
        { page: 'backtest', label: 'Backtest', icon: <BrainIcon className="h-5 w-5" /> },
        { page: 'compound', label: 'Compound', icon: <ChartBarIcon className="h-5 w-5" /> },
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
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);
  
  const [savedTrades, setSavedTrades] = useState<SavedTrade[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [strategies, setStrategies] = useState<BacktestStrategy[]>([]);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  const [tradeToLoad, setTradeToLoad] = useState<SavedTrade | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isLossProtocolModalOpen, setIsLossProtocolModalOpen] = useState(false);

  useEffect(() => {
    // Check disclaimer on first load regardless of mode
    const disclaimerAccepted = localStorage.getItem('disclaimerAccepted');
    if (!disclaimerAccepted) setIsDisclaimerOpen(true);

    if (isSupabaseConfigured) {
        // SUPABASE MODE: Check auth state
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setAuthLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    } else {
        // LOCAL-ONLY MODE: Load from localStorage
        try {
            const localSettings = localStorage.getItem('trading-toolkit-settings');
            setSettings(localSettings ? JSON.parse(localSettings) : DEFAULT_SETTINGS);
            const localTrades = localStorage.getItem('trading-toolkit-trades');
            setSavedTrades(localTrades ? JSON.parse(localTrades) : []);
            const localPortfolio = localStorage.getItem('trading-toolkit-portfolio');
            setPortfolio(localPortfolio ? JSON.parse(localPortfolio) : []);
            const localStrategies = localStorage.getItem('trading-toolkit-strategies');
            setStrategies(localStrategies ? JSON.parse(localStrategies) : []);
            const localReflections = localStorage.getItem('trading-toolkit-reflections');
            setReflections(localReflections ? JSON.parse(localReflections) : []);
        } catch (e) {
            console.error("Error loading data from localStorage", e);
        }
    }
  }, []);
  
  const handleDbError = useCallback((error: any, context: string): boolean => {
      if (!error || !isSupabaseConfigured) return false;
      const errorMessage = String(error.message || '').toLowerCase();
      if (errorMessage.includes('invalid api key') || errorMessage.includes('jwt') || errorMessage.includes('fetch failed')) {
          setDbError(`Database Connection Error: Could not connect. Please check your Supabase credentials in the code and network connection.`);
          return true;
      }
      if (String(error.code) === '42P01' || (errorMessage.includes('relation') && errorMessage.includes('does not exist'))) {
          setDbError('missing_table');
          return true;
      }
      console.error(`Error ${context}:`, error.message || error);
      return false;
  }, []);

  const fetchDbData = useCallback(async () => {
    if (!session || !isSupabaseConfigured) return;
    setDbError(null);
    
    const [settingsRes, tradesRes, portfolioRes, strategiesRes, reflectionsRes] = await Promise.all([
        supabase.from('settings').select('*').eq('user_id', session.user.id).single(),
        supabase.from('trades').select('trade_data').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('portfolio').select('*').eq('user_id', session.user.id),
        supabase.from('strategies').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('reflections').select('*').eq('user_id', session.user.id).order('date', { ascending: false })
    ]);

    if (settingsRes.error && settingsRes.error.code !== 'PGRST116') handleDbError(settingsRes.error, 'fetching settings');
    if (settingsRes.data) setSettings(prev => ({...prev, ...settingsRes.data, baseCurrency: settingsRes.data.base_currency, defaultRiskPercent: settingsRes.data.default_risk_percent, aiEnabled: settingsRes.data.ai_enabled !== false })); else setSettings(DEFAULT_SETTINGS);
    
    if (handleDbError(tradesRes.error, 'fetching trades')) setSavedTrades([]); else if(tradesRes.data) setSavedTrades(tradesRes.data.map((d: any) => d.trade_data));
    if (handleDbError(portfolioRes.error, 'fetching portfolio')) setPortfolio([]); else if(portfolioRes.data) setPortfolio(portfolioRes.data.map((a: any) => ({ ...a, avgBuyPrice: a.avg_buy_price, currentPrice: a.current_price })));
    if (handleDbError(strategiesRes.error, 'fetching strategies')) setStrategies([]); else if(strategiesRes.data) setStrategies(strategiesRes.data);
    if (handleDbError(reflectionsRes.error, 'fetching reflections')) setReflections([]); else if(reflectionsRes.data) setReflections(reflectionsRes.data);

  }, [session, handleDbError]);
  
  useEffect(() => {
    if (isSupabaseConfigured && session) {
      fetchDbData();
    } else if (!isSupabaseConfigured) {
        // This logic is now in the initial useEffect
    } else {
      // Clear data when user logs out
      setSavedTrades([]); setPortfolio([]); setStrategies([]); setReflections([]); setSettings(DEFAULT_SETTINGS);
    }
  }, [session, isSupabaseConfigured, fetchDbData]);

  useEffect(() => {
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (isSupabaseConfigured) {
        if (!session) return;
        const { error } = await supabase.from('settings').upsert({ user_id: session.user.id, theme: newSettings.theme, base_currency: newSettings.baseCurrency, default_risk_percent: newSettings.defaultRiskPercent, ai_enabled: newSettings.aiEnabled, api_key: newSettings.apiKey, trading_rules: newSettings.tradingRules, loss_recovery_protocol: newSettings.lossRecoveryProtocol, routine: newSettings.routine });
        handleDbError(error, 'saving settings');
    } else {
        localStorage.setItem('trading-toolkit-settings', JSON.stringify(newSettings));
    }
  };

  const handleSaveTrade = async (tradeData: {tradeParams: TradeParams, calculationResult: CalculationResult, aiInsights: AIInsights | null, notes: string, preTradeEmotionRating: number, rulesFollowed: boolean[]}) => {
    const newSave: SavedTrade = { 
        id: new Date().toISOString(), 
        timestamp: new Date().toLocaleString(), 
        ...tradeData, 
        outcome: TradeOutcome.Planned, 
        postTradeEmotionRating: 5, 
        tags: [],
        tradingRules: settings.tradingRules,
    };
    const updatedTrades = [newSave, ...savedTrades];
    setSavedTrades(updatedTrades);
    if (isSupabaseConfigured) {
        if (!session) return;
        const { error } = await supabase.from('trades').insert({ id: newSave.id, user_id: session.user.id, trade_data: newSave });
        if (handleDbError(error, 'saving trade')) setSavedTrades(savedTrades.filter(t => t.id !== newSave.id));
    } else {
        localStorage.setItem('trading-toolkit-trades', JSON.stringify(updatedTrades));
    }
  };
  
  const checkLossStreak = (updatedTrade: SavedTrade, allTrades: SavedTrade[]) => {
      if (updatedTrade.outcome !== TradeOutcome.Loss) return;
      const completedTrades = allTrades.filter(t => t.outcome === TradeOutcome.Win || t.outcome === TradeOutcome.Loss).sort((a,b) => new Date(a.id).getTime() - new Date(b.id).getTime());
      const tradeIndex = completedTrades.findIndex(t => t.id === updatedTrade.id);
      if (tradeIndex === -1) return;
      const streakLimit = settings.lossRecoveryProtocol.consecutiveLosses;
      if (tradeIndex + 1 < streakLimit) return;
      let consecutiveLosses = 0;
      for (let i = tradeIndex; i >= 0 && i > tradeIndex - streakLimit; i--) {
          if (completedTrades[i].outcome === TradeOutcome.Loss) consecutiveLosses++; else break; 
      }
      if (consecutiveLosses >= streakLimit) setIsLossProtocolModalOpen(true);
  };

  const updateTrade = async (updatedTrade: SavedTrade) => {
    const newTrades = savedTrades.map(t => t.id === updatedTrade.id ? updatedTrade : t);
    setSavedTrades(newTrades);
    checkLossStreak(updatedTrade, newTrades);
    if (isSupabaseConfigured) {
        if (!session) return;
        const { error } = await supabase.from('trades').update({ trade_data: updatedTrade }).eq('id', updatedTrade.id);
        if (handleDbError(error, 'updating trade')) fetchDbData();
    } else {
        localStorage.setItem('trading-toolkit-trades', JSON.stringify(newTrades));
    }
  };

  const handleDeleteTrade = async (id: string) => {
    const newTrades = savedTrades.filter(t => t.id !== id);
    setSavedTrades(newTrades);
    if (isSupabaseConfigured) {
        if (!session) return;
        const { error } = await supabase.from('trades').delete().eq('id', id);
        if (handleDbError(error, 'deleting trade')) fetchDbData();
    } else {
        localStorage.setItem('trading-toolkit-trades', JSON.stringify(newTrades));
    }
  };

  const handleClearAllTrades = async () => {
    if (window.confirm("Are you sure you want to delete all saved trades? This cannot be undone.")) {
      const originalTrades = [...savedTrades];
      setSavedTrades([]);
      if (isSupabaseConfigured) {
          if (!session) return;
          const { error } = await supabase.from('trades').delete().eq('user_id', session.user.id);
          if (handleDbError(error, 'clearing trades')) setSavedTrades(originalTrades);
      } else {
          localStorage.removeItem('trading-toolkit-trades');
      }
    }
  };
  
  const updatePortfolio = async (newPortfolio: PortfolioAsset[]) => {
      setPortfolio(newPortfolio);
      if (isSupabaseConfigured) {
          if (!session) return;
          const { error: deleteError } = await supabase.from('portfolio').delete().eq('user_id', session.user.id);
          if (handleDbError(deleteError, 'clearing old portfolio')) { fetchDbData(); return; }
          if (newPortfolio.length > 0) {
              const newRows = newPortfolio.map(a => ({ user_id: session.user.id, asset_id: a.id, name: a.name, quantity: a.quantity, avg_buy_price: a.avgBuyPrice, current_price: a.currentPrice }));
              const { error: insertError } = await supabase.from('portfolio').insert(newRows);
              if (handleDbError(insertError, 'saving new portfolio')) fetchDbData();
          }
      } else {
          localStorage.setItem('trading-toolkit-portfolio', JSON.stringify(newPortfolio));
      }
  };

  const addStrategy = async (strategy: Omit<BacktestStrategy, 'id' | 'created_at' | 'user_id'>) => {
    if (isSupabaseConfigured) {
        if (!session) return null;
        const { data, error } = await supabase.from('strategies').insert({ ...strategy, user_id: session.user.id }).select();
        if (handleDbError(error, 'adding strategy')) return null;
        if (data) { setStrategies([data[0], ...strategies]); return data[0]; }
        return null;
    } else {
        const newStrategy = { ...strategy, id: new Date().toISOString(), created_at: new Date().toISOString() };
        const newStrategies = [newStrategy, ...strategies];
        setStrategies(newStrategies);
        localStorage.setItem('trading-toolkit-strategies', JSON.stringify(newStrategies));
        return newStrategy;
    }
  };

  const updateStrategy = async (strategy: BacktestStrategy) => {
      const newStrategies = strategies.map(s => s.id === strategy.id ? strategy : s);
      setStrategies(newStrategies);
      if (isSupabaseConfigured) {
          if (!session) return;
          const { error } = await supabase.from('strategies').update(strategy).eq('id', strategy.id);
          if (handleDbError(error, 'updating strategy')) fetchDbData();
      } else {
          localStorage.setItem('trading-toolkit-strategies', JSON.stringify(newStrategies));
      }
  };

  const deleteStrategy = async (id: string) => {
      const newStrategies = strategies.filter(s => s.id !== id);
      setStrategies(newStrategies);
      if (isSupabaseConfigured) {
          if (!session) return;
          const { error } = await supabase.from('strategies').delete().eq('id', id);
          if (handleDbError(error, 'deleting strategy')) fetchDbData();
      } else {
          localStorage.setItem('trading-toolkit-strategies', JSON.stringify(newStrategies));
      }
  };
  
  const saveReflection = async (reflection: Omit<DailyReflection, 'id' | 'user_id'>) => {
      if (isSupabaseConfigured) {
          if (!session) return;
          const { data, error } = await supabase.from('reflections').insert({...reflection, user_id: session.user.id }).select();
          if (handleDbError(error, 'saving reflection')) return;
          if (data) setReflections([data[0], ...reflections]);
      } else {
          const newReflection = { ...reflection, id: new Date().toISOString(), user_id: 'local' };
          const newReflections = [newReflection, ...reflections];
          setReflections(newReflections);
          localStorage.setItem('trading-toolkit-reflections', JSON.stringify(newReflections));
      }
  };

  const handleDisclaimerAccept = () => { localStorage.setItem('disclaimerAccepted', 'true'); setIsDisclaimerOpen(false); };
  const handleLoadTrade = (trade: SavedTrade) => { setTradeToLoad(trade); setCurrentPage('risk'); };
  const handleTradeLoaded = () => setTradeToLoad(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'risk': return <RiskManagementPage onSaveTrade={handleSaveTrade} tradeToLoad={tradeToLoad} onTradeLoaded={handleTradeLoaded} settings={settings} aiEnabled={settings.aiEnabled} apiKey={settings.apiKey} />;
      case 'journal': return <TradeJournalPage savedTrades={savedTrades} onUpdateTrade={updateTrade} />;
      case 'profit': return <ProfitCalculatorPage />;
      case 'sizer': return <PositionSizerPage defaultRiskPercent={settings.defaultRiskPercent} />;
      case 'portfolio': return <PortfolioTrackerPage portfolio={portfolio} onUpdatePortfolio={updatePortfolio} baseCurrency={String(settings.baseCurrency)} />;
      case 'log': return <SavedTradesListPage savedTrades={savedTrades} onLoad={handleLoadTrade} onDelete={handleDeleteTrade} onClearAll={handleClearAllTrades} onUpdateTrade={updateTrade} />;
      case 'settings': return <SettingsPage settings={settings} onUpdateSettings={updateSettings} onClearData={() => { handleClearAllTrades(); updatePortfolio([]); }} />;
      case 'backtest': return <BacktestPage strategies={strategies} onAddStrategy={addStrategy} onUpdateStrategy={updateStrategy} onDeleteStrategy={deleteStrategy} />;
      case 'education': return <EducationPage apiKey={settings.apiKey} />;
      case 'compound': return <CompoundingPage apiKey={settings.apiKey} baseCurrency={String(settings.baseCurrency)} />;
      case 'mindset': return <MindsetPage settings={settings} reflections={reflections} onSaveReflection={saveReflection} />;
      case 'home': default: return <HomePage setCurrentPage={setCurrentPage} savedTrades={savedTrades} portfolio={portfolio} baseCurrency={String(settings.baseCurrency)} />;
    }
  };

  if (authLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Spinner />
          </div>
      );
  }
  
  if (isSupabaseConfigured && !session) {
      return <AuthPage />;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} session={session} />
        <DisclaimerModal isOpen={isDisclaimerOpen} onAccept={handleDisclaimerAccept} />
        <LossProtocolModal isOpen={isLossProtocolModalOpen} onClose={() => setIsLossProtocolModalOpen(false)} settings={settings} />
        
        {dbError === 'missing_table' ? <DatabaseSetupMessage /> : dbError ? (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md my-4" role="alert">
                <p className="font-bold">Database Configuration Error</p>
                <p>{dbError}</p>
            </div>
        ) : null}
        
        <main>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}