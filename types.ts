import { Session } from '@supabase/supabase-js';

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  JPY = 'JPY',
  GBP = 'GBP',
  AUD = 'AUD',
  CAD = 'CAD',
  CHF = 'CHF',
  CNY = 'CNY',
  BDT = 'BDT',
}

export enum Direction {
  Long = 'Long',
  Short = 'Short',
}

export enum Timeframe {
  Scalp = 'Scalp',
  Intraday = 'Intraday',
  Swing = 'Swing',
  Position = 'Position',
  All = 'All',
}

export enum RiskMethod {
  FixedPercentage = 'Fixed %',
  FixedAmount = 'Fixed Amount',
  KellyCriterion = 'Kelly Criterion',
}

export interface TradeParams {
  symbol: string;
  accountCurrency: Currency;
  accountBalance: number;
  entryPrice: number;
  stopLossPrice: number;
  targetPrice: number;
  direction: Direction;
  timeframe: Timeframe;
  riskMethod: RiskMethod;
  riskPercentage: number;
  fixedRiskAmount: number;
  winProbability: number;
  winLossRatio: number;
  leverage: number;
}

export interface CalculationResult {
  positionSizeAsset: number;
  positionSizeFiat: number;
  notionalValue: number;
  maxLossFiat: number;
  maxLossPercent: number;
  rewardRiskRatio: number;
  takeProfitLevels: {
    rr: number;
    price: number;
    profit: number;
  }[];
  assetName: string;
  accountCurrency: Currency;
}

export enum Recommendation {
    Proceed = 'Proceed',
    ReduceSize = 'Reduce Size',
    Skip = 'Skip',
}

export interface AIInsights {
  recommendation: Recommendation;
  suitabilityScore: number;
  summary: string;
  warnings: string[];
  checklist: {
      text: string;
      checked: boolean;
  }[];
}

export enum TradeOutcome {
    Planned = 'Planned',
    Win = 'Win',
    Loss = 'Loss',
}

export interface SavedTrade {
  id: string;
  timestamp: string;
  tradeParams: TradeParams;
  calculationResult: CalculationResult;
  aiInsights: AIInsights | null;
  outcome: TradeOutcome;
  notes: string;
  preTradeEmotionRating: number; // 1-10
  postTradeEmotionRating: number; // 1-10
  rulesFollowed: (boolean | null)[];
  tags: string[];
  tradingRules: string[];
}

export interface AppSettings {
    theme: 'light' | 'dark';
    baseCurrency: Currency | string;
    defaultRiskPercent: number;
    aiEnabled: boolean;
    apiKey: string;
    tradingRules: string[];
    lossRecoveryProtocol: {
        consecutiveLosses: number;
        rules: string[];
    };
    routine: {
        preMarketChecklist: { text: string }[];
        affirmations: string[];
        stopTime: string;
    };
}

export interface PortfolioAsset {
    id: string; // e.g., 'BTC'
    name: string; // e.g., 'Bitcoin'
    quantity: number;
    avgBuyPrice: number;
    currentPrice: number; // User-defined current price
}

// --- Backtest Sheet System Types ---

export enum BacktestTradeDirection {
    Long = 'Long',
    Short = 'Short',
}

export enum BacktestSession {
    London = 'London',
    NewYork = 'New York',
    Tokyo = 'Tokyo',
    Sydney = 'Sydney',
}

export enum BacktestDay {
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday',
    Sunday = 'Sunday',
}

export interface BacktestTrade {
  id: string;
  date: string;
  time: string;
  day: BacktestDay;
  direction: BacktestTradeDirection;
  entry: number;
  sl: number;
  tp: number;
  result: number; // P/L in currency
  rr: number;
  session: BacktestSession;
  note: string;
  win: boolean;
}

export type BacktestTimeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D';

export interface BacktestStrategy {
  id: string;
  user_id?: string;
  name: string;
  description: string;
  pair: string;
  timeframe: BacktestTimeframe;
  initial_capital: number;
  risk_percent: number;
  created_at: string;
  tags: string[];
  trades: BacktestTrade[];
}

// --- Automated Backtest Types ---
export interface BacktestParams {
    symbol: string;
    timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D' | '1W';
    startDate: string;
    endDate: string;
    initialBalance: number;
    strategyRules: string;
    stopLossPercent: number;
    takeProfitPercent: number;
}

export interface Candle {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface BacktestResultTrade {
    entryTimestamp: number;
    exitTimestamp: number;
    entryPrice: number;
    exitPrice: number;
    profit: number;
    returnPercent: number;
}

export interface BacktestResult {
    netProfitPercent: number;
    winRate: number;
    totalTrades: number;
    maxDrawdown: number;
    trades: BacktestResultTrade[];
    balanceHistory: { balance: number }[];
}

export interface BacktestAIInsights {
    aiStrategyScore: number;
    marketConditionAnalysis: string;
    strategyStrengths: string;
    strategyWeaknesses: string;
    improvementSuggestions: string[];
}


// --- Compounding Plan Types ---
export interface CompoundingParams {
    initialCapital: number;
    targetProfitPercent: number;
    periodType: 'Daily' | 'Weekly' | 'Monthly';
    periods: number;
    reinvestmentRate: number; // 0-100
}

export interface CompoundingPeriodResult {
    period: number;
    startCapital: number;
    targetProfit: number;
    endCapital: number;
}

export interface CompoundingAIInsights {
    feasibilityScore: number; // 1-10
    summary: string;
    potentialRisks: string[];
    recommendations: string[];
}

// --- Psychology & Mindset Types ---
export interface DailyReflection {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  followedPlan: string;
  emotionalState: string;
  lessonsLearned: string;
}

// --- Education Hub Types ---
export interface CourseVideo {
    id: string;
    user_id?: string;
    course_id: string;
    title: string;
    link: string;
    description: string;
    timestamp?: string; // e.g. a specific point in a longer video
    created_at: string;
}

export interface EducationCourse {
    id: string;
    user_id?: string;
    title: string;
    platform: string;
    link: string;
    category: string;
    progress: number; // 0-100
    created_at: string;
}

export interface EducationNote {
    id: string;
    user_id?: string;
    course_id: string | null; // Can be null for personal notes
    video_id?: string | null; // New field, optional and nullable
    type: 'course' | 'personal'; // New field
    video_title: string; // Kept for backwards compatibility
    video_link: string; // Kept for backwards compatibility
    timestamp: string; // Kept for backwards compatibility
    note_text: string;
    created_at: string;
}

// --- Playbook Types ---
export interface PlaybookPlay {
    id: string;
    user_id?: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    created_at: string;
}

// --- Watchlist Types ---
export interface WatchlistItem {
    id: string;
    user_id?: string;
    symbol: string;
    notes: string;
    created_at: string;
}