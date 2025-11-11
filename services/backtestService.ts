import { Candle, BacktestParams, BacktestResult, BacktestTrade, StrategyRule } from '../types';

// MOCK DATA GENERATION
export function generateMockCandleData(startDateStr: string, endDateStr: string, timeframe: BacktestParams['timeframe']): Candle[] {
  const candles: Candle[] = [];
  let currentTime = new Date(startDateStr).getTime();
  const endDate = new Date(endDateStr).getTime();

  const timeframeMinutes = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '4h': 240,
    '1D': 1440,
    '1W': 10080
  }[timeframe];
  const timeStep = timeframeMinutes * 60 * 1000;

  let lastClose = 100 + Math.random() * 20; // More generic starting price

  while (currentTime <= endDate) {
    const open = lastClose;
    const change = (Math.random() - 0.49) * open * 0.02; // Reduced volatility
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * open * 0.01;
    const low = Math.min(open, close) - Math.random() * open * 0.01;
    const volume = 100 + Math.random() * 1000;

    candles.push({ timestamp: currentTime, open, high, low, close, volume });

    lastClose = close;
    currentTime += timeStep;
  }
  return candles;
}

// TECHNICAL INDICATOR CALCULATION
export function calculateRSI(candles: Candle[], period: number = 14): number[] {
  const rsi: number[] = [];
  let gains: number[] = [];
  let losses: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i-1].close;
    if (change > 0) {
      gains.push(change);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(change));
    }

    if (i >= period) {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    } else {
      rsi.push(NaN); // Not enough data
    }
  }
  return [NaN, ...rsi]; // align with candle array
}

// STRATEGY PARSING
function parseStrategyRules(rulesStr: string): StrategyRule[] {
    const rules: StrategyRule[] = [];
    const lines = rulesStr.split('\n');
    for (const line of lines) {
        const match = line.match(/(BUY|SELL) when (RSI) (<|>) (\d+)/);
        if (match) {
            rules.push({
                type: match[1] as 'BUY' | 'SELL',
                indicator: match[2] as 'RSI',
                operator: match[3] as '<' | '>',
                value: parseInt(match[4], 10),
            });
        }
    }
    return rules;
}


// BACKTESTING ENGINE
export function runBacktest(params: BacktestParams, candles: Candle[]): BacktestResult {
    const { initialBalance, stopLossPercent, takeProfitPercent } = params;
    
    let balance = initialBalance;
    const balanceHistory: { timestamp: number; balance: number }[] = [{ timestamp: candles[0].timestamp, balance }];
    const trades: BacktestTrade[] = [];
    const rsi = calculateRSI(candles);
    const rules = parseStrategyRules(params.strategyRules);
    
    let inPosition = false;
    let entryPrice = 0;
    let positionSize = 0; // in asset
    let stopLossPrice = 0;
    let takeProfitPrice = 0;
    let entryTimestamp = 0;

    const buyRule = rules.find(r => r.type === 'BUY');
    const sellRule = rules.find(r => r.type === 'SELL');

    if (!buyRule || !sellRule) {
        throw new Error("Invalid strategy rules. Both a BUY and a SELL rule are required.");
    }

    for (let i = 1; i < candles.length; i++) {
        const candle = candles[i];
        const currentRsi = rsi[i];

        // Check for exits first
        if (inPosition) {
            let exitPrice: number | null = null;
            if (candle.low <= stopLossPrice) exitPrice = stopLossPrice;
            else if (candle.high >= takeProfitPrice) exitPrice = takeProfitPrice;
            else if (sellRule.operator === '>' && currentRsi > sellRule.value) exitPrice = candle.close;
            else if (sellRule.operator === '<' && currentRsi < sellRule.value) exitPrice = candle.close;
            
            if (exitPrice) {
                const profit = (exitPrice - entryPrice) * positionSize;
                balance += profit;
                trades.push({
                    entryTimestamp,
                    entryPrice,
                    exitTimestamp: candle.timestamp,
                    exitPrice,
                    size: positionSize,
                    profit,
                    returnPercent: (profit / (entryPrice * positionSize)) * 100,
                    durationHours: (candle.timestamp - entryTimestamp) / (1000 * 3600),
                });
                inPosition = false;
            }
        }
        
        // Check for entries
        if (!inPosition) {
            let shouldBuy = false;
            if (buyRule.operator === '<' && currentRsi < buyRule.value) shouldBuy = true;
            else if (buyRule.operator === '>' && currentRsi > buyRule.value) shouldBuy = true;

            if(shouldBuy){
                entryPrice = candle.close;
                positionSize = balance / entryPrice; // Use full balance for simplicity
                stopLossPrice = entryPrice * (1 - stopLossPercent / 100);
                takeProfitPrice = entryPrice * (1 + takeProfitPercent / 100);
                inPosition = true;
                entryTimestamp = candle.timestamp;
            }
        }
        balanceHistory.push({ timestamp: candle.timestamp, balance: inPosition ? (entryPrice * positionSize) + ((candle.close - entryPrice) * positionSize) : balance });
    }

    // --- METRICS CALCULATION ---
    const finalBalance = balance;
    const netProfit = finalBalance - initialBalance;
    const netProfitPercent = (netProfit / initialBalance) * 100;
    const winningTrades = trades.filter(t => t.profit > 0).length;
    const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
    
    // Max Drawdown
    let peak = initialBalance;
    let maxDrawdown = 0;
    for (const point of balanceHistory) {
        peak = Math.max(peak, point.balance);
        const drawdown = (peak - point.balance) / peak;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }
    
    const avgTradeDuration = trades.length > 0 ? trades.reduce((sum, t) => sum + t.durationHours, 0) / trades.length : 0;
    
    return {
        params,
        trades,
        totalTrades: trades.length,
        winningTrades,
        losingTrades: trades.length - winningTrades,
        winRate,
        netProfit,
        netProfitPercent,
        maxDrawdown: maxDrawdown * 100,
        avgTradeDuration,
        finalBalance,
        balanceHistory
    };
}