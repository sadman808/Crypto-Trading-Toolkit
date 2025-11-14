import React, { useState, useEffect, useCallback } from 'react';
import { SavedTrade, TradeOutcome, TradeParams, CalculationResult, AIInsights, AppSettings, PortfolioAsset, Currency, BacktestStrategy, DailyReflection, EducationCourse, EducationNote, PlaybookPlay, WatchlistItem, CourseVideo, JournalOnetime, TradingRule, DailyJournal, JournalTrade, WeeklyReview, RuleCheck, Asset } from './types';
import { SettingsIcon, HomeIcon, JournalIcon, ToolsIcon, BrainIcon, SignOutIcon, ChartBarIcon, HeartIcon, ClipboardDocumentListIcon, ArrowTrendingUpIcon, CubeIcon } from './constants';
import DisclaimerModal from './components/DisclaimerModal';
import HomePage from './components/HomePage';
import RiskManagementPage from './components/RiskManagementPage';
import JournalPage from './components/journal/JournalPage';
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
import PlaybookPage from './components/PlaybookPage';
import WatchlistPage from './components/WatchlistPage';
import AssetsPage from './components/AssetsPage';


export type Page = 'home' | 'risk' | 'journal' | 'profit' | 'sizer' | 'portfolio' | 'log' | 'settings' | 'backtest' | 'education' | 'compound' | 'mindset' | 'playbook' | 'watchlist' | 'assets';

// A placeholder for the toolkit's default key.
// In a real application, this would be managed securely.
const DEFAULT_API_KEY = "YOUR_DEFAULT_TOOLKIT_API_KEY_HERE"; 

const DEFAULT_SETTINGS: AppSettings = { 
    theme: 'dark', 
    baseCurrency: Currency.USD, 
    defaultRiskPercent: 1, 
    aiEnabled: true,
    useDefaultApiKey: true,
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
        { page: 'journal', label: 'Journal', icon: <JournalIcon className="h-5 w-5" /> },
        { page: 'log', label: 'Trades', icon: <ClipboardDocumentListIcon className="h-5 w-5" /> },
        { page: 'assets', label: 'Assets', icon: <CubeIcon className="h-5 w-5" /> },
        { page: 'playbook', label: 'Playbook', icon: <ClipboardDocumentListIcon className="h-5 w-5" /> },
        { page: 'watchlist', label: 'Watchlist', icon: <ArrowTrendingUpIcon className="h-5 w-5" /> },
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
  const [courses, setCourses] = useState<EducationCourse[]>([]);
  const [notes, setNotes] = useState<EducationNote[]>([]);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [playbook, setPlaybook] = useState<PlaybookPlay[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [userApiKey, setUserApiKey] = useState<string | null>(null);


  // New Journal State
  const [onetimeReflection, setOnetimeReflection] = useState<JournalOnetime | null>(null);
  const [tradingRules, setTradingRules] = useState<TradingRule[]>([]);
  const [dailyJournals, setDailyJournals] = useState<DailyJournal[]>([]);
  const [journalTrades, setJournalTrades] = useState<JournalTrade[]>([]);
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>([]);
  const [ruleChecks, setRuleChecks] = useState<RuleCheck[]>([]);

  
  const [tradeToLoad, setTradeToLoad] = useState<SavedTrade | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isLossProtocolModalOpen, setIsLossProtocolModalOpen] = useState(false);

  useEffect(() => {
    const disclaimerAccepted = localStorage.getItem('disclaimerAccepted');
    if (!disclaimerAccepted) setIsDisclaimerOpen(true);

    if (isSupabaseConfigured) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setAuthLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    } else {
        // Local storage logic for existing features
    }
  }, []);
  
  const handleDbError = useCallback((error: any, context: string): boolean => {
      if (!error || !isSupabaseConfigured) return false;
      const errorMessage = String(error.message || '').toLowerCase();
      if (errorMessage.includes('invalid api key') || errorMessage.includes('jwt')) {
          setDbError(`Database Connection Error: Could not connect. Please check your Supabase credentials in the code and network connection.`);
          return true;
      }
      if (errorMessage.includes('failed to fetch')) {
        setDbError(`Database Connection Error: Failed to connect. Please check: 1) Your network connection. 2) The 'supabaseUrl' in supabaseClient.ts is correct. 3) 'localhost' is listed in your Supabase project's CORS settings (under Authentication > URL Configuration).`);
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
    
    const [
        settingsRes, tradesRes, portfolioRes, strategiesRes, reflectionsRes, coursesRes, notesRes, videosRes, playbookRes, watchlistRes, assetsRes, apiKeyRes,
        onetimeRes, rulesRes, dailyJournalsRes, journalTradesRes, weeklyReviewsRes, ruleChecksRes
    ] = await Promise.all([
        supabase.from('settings').select('*').eq('user_id', session.user.id).single(),
        supabase.from('trades').select('trade_data').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('portfolio').select('*').eq('user_id', session.user.id),
        supabase.from('strategies').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('reflections').select('*').eq('user_id', session.user.id).order('date', { ascending: false }),
        supabase.from('courses').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('course_videos').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('playbook').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('watchlist').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('assets').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('user_api_keys').select('gemini_key').eq('user_id', session.user.id).single(),
        // New Journal Data
        supabase.from('journal_onetime').select('*').eq('user_id', session.user.id).single(),
        supabase.from('trading_rules').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true }),
        supabase.from('journal_daily').select('*').eq('user_id', session.user.id).order('date', { ascending: false }),
        supabase.from('journal_trades').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('weekly_reviews').select('*').eq('user_id', session.user.id).order('week_start', { ascending: false }),
        supabase.from('rule_checks').select('*').eq('user_id', session.user.id),
    ]);

    // Existing data handling
    if (settingsRes.error && settingsRes.error.code !== 'PGRST116') handleDbError(settingsRes.error, 'fetching settings');
    if (settingsRes.data) {
        setSettings(prev => ({
            ...prev, 
            ...settingsRes.data, 
            baseCurrency: settingsRes.data.base_currency, 
            defaultRiskPercent: settingsRes.data.default_risk_percent, 
            aiEnabled: settingsRes.data.ai_enabled !== false,
            useDefaultApiKey: settingsRes.data.use_default_api_key !== false,
        })); 
    } else { setSettings(DEFAULT_SETTINGS); }

    if (apiKeyRes.error && apiKeyRes.error.code !== 'PGRST116') handleDbError(apiKeyRes.error, 'fetching api key'); else if (apiKeyRes.data) setUserApiKey(apiKeyRes.data.gemini_key);
    
    if (handleDbError(tradesRes.error, 'fetching trades')) setSavedTrades([]); else if(tradesRes.data) setSavedTrades(tradesRes.data.map((d: any) => d.trade_data));
    if (handleDbError(portfolioRes.error, 'fetching portfolio')) setPortfolio([]); else if(portfolioRes.data) setPortfolio(portfolioRes.data.map((a: any) => ({ ...a, avgBuyPrice: a.avg_buy_price, currentPrice: a.current_price })));
    if (handleDbError(strategiesRes.error, 'fetching strategies')) setStrategies([]); else if(strategiesRes.data) setStrategies(strategiesRes.data);
    if (handleDbError(reflectionsRes.error, 'fetching reflections')) setReflections([]); else if(reflectionsRes.data) setReflections(reflectionsRes.data);
    if (handleDbError(coursesRes.error, 'fetching courses')) setCourses([]); else if(coursesRes.data) setCourses(coursesRes.data);
    if (handleDbError(notesRes.error, 'fetching notes')) setNotes([]); else if(notesRes.data) setNotes(notesRes.data);
    if (handleDbError(videosRes.error, 'fetching videos')) setVideos([]); else if(videosRes.data) setVideos(videosRes.data);
    if (handleDbError(playbookRes.error, 'fetching playbook')) setPlaybook([]); else if(playbookRes.data) setPlaybook(playbookRes.data);
    if (handleDbError(watchlistRes.error, 'fetching watchlist')) setWatchlist([]); else if(watchlistRes.data) setWatchlist(watchlistRes.data);
    if (handleDbError(assetsRes.error, 'fetching assets')) setAssets([]); else if(assetsRes.data) setAssets(assetsRes.data);

    // New Journal Data Handling
    if (onetimeRes.error && onetimeRes.error.code !== 'PGRST116') handleDbError(onetimeRes.error, 'fetching one-time reflection'); else setOnetimeReflection(onetimeRes.data);
    if (handleDbError(rulesRes.error, 'fetching trading rules')) setTradingRules([]); else setTradingRules(rulesRes.data || []);
    if (handleDbError(dailyJournalsRes.error, 'fetching daily journals')) setDailyJournals([]); else setDailyJournals(dailyJournalsRes.data || []);
    if (handleDbError(journalTradesRes.error, 'fetching journal trades')) setJournalTrades([]); else setJournalTrades(journalTradesRes.data || []);
    if (handleDbError(weeklyReviewsRes.error, 'fetching weekly reviews')) setWeeklyReviews([]); else setWeeklyReviews(weeklyReviewsRes.data || []);
    if (handleDbError(ruleChecksRes.error, 'fetching rule checks')) setRuleChecks([]); else setRuleChecks(ruleChecksRes.data || []);

  }, [session, handleDbError]);
  
  useEffect(() => {
    if (isSupabaseConfigured && session) {
      fetchDbData();
    } else if (!isSupabaseConfigured) {
        // This logic is now in the initial useEffect
    } else {
      // Clear data when user logs out
      setSavedTrades([]); setPortfolio([]); setStrategies([]); setReflections([]); setSettings(DEFAULT_SETTINGS); setCourses([]); setNotes([]); setVideos([]); setPlaybook([]); setWatchlist([]); setAssets([]); setUserApiKey(null);
      setOnetimeReflection(null); setTradingRules([]); setDailyJournals([]); setJournalTrades([]); setWeeklyReviews([]); setRuleChecks([]);
    }
  }, [session, isSupabaseConfigured, fetchDbData]);

  useEffect(() => {
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // Existing update functions...
  const updateSettings = async (newSettings: AppSettings) => {
    // Optimistically update local state for instant UI feedback
    setSettings(newSettings);

    if (!session || !isSupabaseConfigured) return;

    // Prepare data for Supabase (snake_case)
    const settingsData = {
        user_id: session.user.id,
        theme: newSettings.theme,
        base_currency: newSettings.baseCurrency,
        default_risk_percent: newSettings.defaultRiskPercent,
        ai_enabled: newSettings.aiEnabled,
        use_default_api_key: newSettings.useDefaultApiKey,
        trading_rules: newSettings.tradingRules,
        loss_recovery_protocol: newSettings.lossRecoveryProtocol,
        routine: newSettings.routine,
    };

    const { error } = await supabase.from('settings').upsert(settingsData, { onConflict: 'user_id' });

    handleDbError(error, 'updating settings');
  };
  const handleSaveTrade = async (tradeData: {tradeParams: TradeParams, calculationResult: CalculationResult, aiInsights: AIInsights | null, notes: string, preTradeEmotionRating: number, rulesFollowed: boolean[]}) => { /* ... existing code ... */ };
  const checkLossStreak = (updatedTrade: SavedTrade, allTrades: SavedTrade[]) => { /* ... existing code ... */ };
  const updateTrade = async (updatedTrade: SavedTrade) => { /* ... existing code ... */ };
  const handleDeleteTrade = async (id: string) => { /* ... existing code ... */ };
  const handleClearAllTrades = async () => { /* ... existing code ... */ };
  const updatePortfolio = async (newPortfolio: PortfolioAsset[]) => { /* ... existing code ... */ };
  const addStrategy = async (strategy: Omit<BacktestStrategy, 'id' | 'created_at' | 'user_id'>) => { /* ... existing code ... */ };
  const updateStrategy = async (strategy: BacktestStrategy) => { /* ... existing code ... */ };
  const deleteStrategy = async (id: string) => { /* ... existing code ... */ };
  const saveReflection = async (reflection: Omit<DailyReflection, 'id' | 'user_id'>) => { /* ... existing code ... */ };
  const addCourse = async (course: Omit<EducationCourse, 'id' | 'created_at' | 'user_id'>) => { /* ... existing code ... */ };
  const updateCourse = async (course: EducationCourse) => { /* ... existing code ... */ };
  const deleteCourse = async (id: string) => { /* ... existing code ... */ };
  const addNote = async (note: Omit<EducationNote, 'id' | 'created_at' | 'user_id'>) => { /* ... existing code ... */ };
  const updateNote = async (note: EducationNote) => { /* ... existing code ... */ };
  const deleteNote = async (id: string) => { /* ... existing code ... */ };
  const addVideo = async (video: Omit<CourseVideo, 'id' | 'created_at' | 'user_id'>) => { /* ... existing code ... */ };
  const updateVideo = async (video: CourseVideo) => { /* ... existing code ... */ };
  const deleteVideo = async (id: string) => { /* ... existing code ... */ };
  const addPlay = async (play: Omit<PlaybookPlay, 'id' | 'created_at' | 'user_id'>) => { /* ... existing code ... */ };
  const updatePlay = async (play: PlaybookPlay) => { /* ... existing code ... */ };
  const deletePlay = async (id: string) => { /* ... existing code ... */ };
  const addWatchlistItem = async (item: Omit<WatchlistItem, 'id' | 'created_at' | 'user_id'>) => { /* ... existing code ... */ };
  const updateWatchlistItem = async (item: WatchlistItem) => { /* ... existing code ... */ };
  const deleteWatchlistItem = async (id: string) => { /* ... existing code ... */ };

  // --- ASSETS CRUD ---
  const addAsset = async (asset: Omit<Asset, 'id' | 'created_at' | 'user_id'>) => {
    if (!session) return null;
    const { data, error } = await supabase.from('assets').insert({ ...asset, user_id: session.user.id }).select().single();
    if (handleDbError(error, 'adding asset')) return null;
    if (data) setAssets(prev => [data, ...prev].sort((a, b) => a.symbol.localeCompare(b.symbol)));
    return data;
  };
  const updateAsset = async (asset: Asset) => {
    if (!session) return;
    const { id, ...updateData } = asset;
    const { data, error } = await supabase.from('assets').update(updateData).eq('id', id).select().single();
    if (!handleDbError(error, 'updating asset') && data) {
        setAssets(prev => prev.map(a => a.id === asset.id ? data : a));
    }
  };
  const deleteAsset = async (id: string) => {
    if (!session) return;
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (!handleDbError(error, 'deleting asset')) {
        setAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  const saveUserApiKey = async (apiKey: string) => {
    if (!session) return;
    const { error } = await supabase.from('user_api_keys').upsert(
        { user_id: session.user.id, gemini_key: apiKey },
        { onConflict: 'user_id' }
    );
    if (!handleDbError(error, 'saving API key')) {
        setUserApiKey(apiKey);
    }
  };

  // --- NEW JOURNAL CRUD FUNCTIONS ---
  const journalDb = {
    saveOnetime: async (data: Omit<JournalOnetime, 'id' | 'user_id' | 'created_at'>) => {
        if (!session) return;
        const { data: result, error } = await supabase.from('journal_onetime').upsert({ ...data, user_id: session.user.id }).select().single();
        if (!handleDbError(error, 'saving one-time journal')) setOnetimeReflection(result);
    },
    saveRules: async (rules: Omit<TradingRule, 'id' | 'user_id' | 'created_at'>[]) => {
        if (!session) return;
        // Simple approach: delete all and insert new. Good for small sets.
        const { error: deleteError } = await supabase.from('trading_rules').delete().eq('user_id', session.user.id);
        if (handleDbError(deleteError, 'deleting old rules')) return;
        const { data, error } = await supabase.from('trading_rules').insert(rules.map(r => ({ ...r, user_id: session.user.id }))).select();
        if (!handleDbError(error, 'saving new rules')) setTradingRules(data || []);
    },
    saveRuleChecks: async (checks: { rule_id: string; date: string; followed: boolean }[]) => {
        if (!session) return;
        const { data, error } = await supabase.from('rule_checks').upsert(checks.map(c => ({...c, user_id: session.user.id })), { onConflict: 'user_id,rule_id,date' }).select();
        if (!handleDbError(error, 'saving rule checks')) fetchDbData(); // refetch to update state
    },
    saveDailyJournal: async (journal: Partial<DailyJournal> & { date: string }) => {
        if (!session) return null;
        const { data, error } = await supabase.from('journal_daily').upsert({ ...journal, user_id: session.user.id }, { onConflict: 'user_id,date' }).select().single();
        if (handleDbError(error, 'saving daily journal')) return null;
        setDailyJournals(prev => {
            const index = prev.findIndex(d => d.date === data.date);
            if (index > -1) {
                const newJournals = [...prev];
                newJournals[index] = data;
                return newJournals;
            }
            return [data, ...prev];
        });
        return data;
    },
    addJournalTrade: async (trade: Omit<JournalTrade, 'id' | 'user_id' | 'created_at' | 'rr'>) => {
        if (!session) return null;
        // Calculate RR server-side or here before insert for consistency
        const rr = (trade.target - trade.entry_price) / (trade.entry_price - trade.sl);
        const { data, error } = await supabase.from('journal_trades').insert({ ...trade, user_id: session.user.id, rr: rr }).select().single();
        if (handleDbError(error, 'adding journal trade')) return null;
        setJournalTrades(prev => [data, ...prev]);
        return data;
    },
    saveWeeklyReview: async (review: Omit<WeeklyReview, 'id'|'user_id'|'created_at'>) => {
      if(!session) return null;
      const { data, error } = await supabase.from('weekly_reviews').upsert({...review, user_id: session.user.id}, { onConflict: 'user_id,week_start'}).select().single();
      if(handleDbError(error, 'saving weekly review')) return null;
      fetchDbData(); // refetch
      return data;
    }
  };


  const handleDisclaimerAccept = () => { localStorage.setItem('disclaimerAccepted', 'true'); setIsDisclaimerOpen(false); };
  const handleLoadTrade = (trade: SavedTrade) => { setTradeToLoad(trade); setCurrentPage('risk'); };
  const handleTradeLoaded = () => setTradeToLoad(null);

  // Determine which API key to use
  const activeApiKey = settings.useDefaultApiKey ? DEFAULT_API_KEY : userApiKey;

  const renderPage = () => {
    switch (currentPage) {
      case 'risk': return <RiskManagementPage onSaveTrade={handleSaveTrade} tradeToLoad={tradeToLoad} onTradeLoaded={handleTradeLoaded} settings={settings} aiEnabled={settings.aiEnabled} apiKey={activeApiKey} />;
      case 'journal': return <JournalPage 
                                onetimeReflection={onetimeReflection}
                                tradingRules={tradingRules}
                                dailyJournals={dailyJournals}
                                journalTrades={journalTrades}
                                weeklyReviews={weeklyReviews}
                                ruleChecks={ruleChecks}
                                onSaveOnetime={journalDb.saveOnetime}
                                onSaveRules={journalDb.saveRules}
                                onSaveRuleChecks={journalDb.saveRuleChecks}
                                onSaveDailyJournal={journalDb.saveDailyJournal}
                                onAddJournalTrade={journalDb.addJournalTrade}
                                onSaveWeeklyReview={journalDb.saveWeeklyReview}
                              />;
      case 'profit': return <ProfitCalculatorPage />;
      case 'sizer': return <PositionSizerPage defaultRiskPercent={settings.defaultRiskPercent} />;
      case 'portfolio': return <PortfolioTrackerPage portfolio={portfolio} onUpdatePortfolio={updatePortfolio} baseCurrency={String(settings.baseCurrency)} />;
      case 'log': return <SavedTradesListPage savedTrades={savedTrades} onLoad={handleLoadTrade} onDelete={handleDeleteTrade} onClearAll={handleClearAllTrades} onUpdateTrade={updateTrade} />;
      case 'settings': return <SettingsPage settings={settings} onUpdateSettings={updateSettings} onClearData={() => { handleClearAllTrades(); updatePortfolio([]); }} userApiKey={userApiKey} onSaveUserApiKey={saveUserApiKey} />;
      case 'backtest': return <BacktestPage strategies={strategies} onAddStrategy={addStrategy} onUpdateStrategy={updateStrategy} onDeleteStrategy={deleteStrategy} />;
      case 'education': return <EducationPage courses={courses} notes={notes} videos={videos} onAddCourse={addCourse} onUpdateCourse={updateCourse} onDeleteCourse={deleteCourse} onAddNote={addNote} onUpdateNote={updateNote} onDeleteNote={deleteNote} onAddVideo={addVideo} onUpdateVideo={updateVideo} onDeleteVideo={deleteVideo} />;
      case 'compound': return <CompoundingPage apiKey={activeApiKey} baseCurrency={String(settings.baseCurrency)} />;
      case 'mindset': return <MindsetPage settings={settings} reflections={reflections} onSaveReflection={saveReflection} />;
      case 'playbook': return <PlaybookPage plays={playbook} onAddPlay={addPlay} onUpdatePlay={updatePlay} onDeletePlay={deletePlay} />;
      case 'watchlist': return <WatchlistPage items={watchlist} onAddItem={addWatchlistItem} onUpdateItem={updateWatchlistItem} onDeleteItem={deleteWatchlistItem} />;
      case 'assets': return <AssetsPage assets={assets} onAddAsset={addAsset} onUpdateAsset={updateAsset} onDeleteAsset={deleteAsset} />;
      case 'home': default: return <HomePage setCurrentPage={setCurrentPage} savedTrades={savedTrades} portfolio={portfolio} baseCurrency={String(settings.baseCurrency)} settings={settings} />;
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