
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

// --- Backtest AI Feature Types ---

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StrategyRule {
    type: 'BUY' | 'SELL';
    indicator: 'RSI';
    operator: '<' | '>';
    value: number;
}

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

export interface BacktestTrade {
  entryTimestamp: number;
  entryPrice: number;
  exitTimestamp: number;
  exitPrice: number;
  size: number; // in asset
  profit: number;
  returnPercent: number;
  durationHours: number;
}

export interface BacktestResult {
  params: BacktestParams;
  trades: BacktestTrade[];
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  netProfit: number;
  netProfitPercent: number;
  maxDrawdown: number;
  avgTradeDuration: number; // in hours
  finalBalance: number;
  balanceHistory: { timestamp: number, balance: number }[];
}

export interface BacktestAIInsights {
  marketConditionAnalysis: string;
  strategyStrengths: string;
  strategyWeaknesses: string;
  improvementSuggestions: string[];
  aiStrategyScore: number;
}