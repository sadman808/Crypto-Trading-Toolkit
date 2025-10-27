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