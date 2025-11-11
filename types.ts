

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
  emotionRating: number; // 1-10
  tags: string[];
}

export interface AppSettings {
    theme: 'light' | 'dark';
    baseCurrency: Currency | string;
    defaultRiskPercent: number;
    aiEnabled: boolean;
    apiKey: string;
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

export interface BacktestTrade {
  id: string;
  date: string;
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
// Fix: Add missing type definitions for automated backtesting feature
// --- Automated Backtest System Types ---

export interface BacktestParams {
  symbol: string;
  timeframe: string;
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

export interface BacktestResult {
  netProfitPercent: number;
  winRate: number;
  totalTrades: number;
  maxDrawdown: number;
  trades: Array<{
    entryTimestamp: number;
    exitTimestamp: number;
    entryPrice: number;
    exitPrice: number;
    profit: number;
    returnPercent: number;
  }>;
  balanceHistory: Array<{
    balance: number;
  }>;
}

export interface BacktestAIInsights {
  aiStrategyScore: number;
  marketConditionAnalysis: string;
  strategyStrengths: string;
  strategyWeaknesses: string;
  improvementSuggestions: string[];
}
