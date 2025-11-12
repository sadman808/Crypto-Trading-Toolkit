import React, { useState, useCallback } from 'react';
import { BacktestParams, BacktestResult, BacktestAIInsights, Candle } from '../types';
import BacktestInputPanel from './BacktestInputPanel';
import BacktestResultsPanel from './BacktestResultsPanel';
import { getBacktestAIInsights } from '../services/geminiService';
import { BoltIcon } from '../constants';

interface AutomatedBacktestPageProps {
    apiKey: string;
}

const AutomatedBacktestPage: React.FC<AutomatedBacktestPageProps> = ({ apiKey }) => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

    const [params, setParams] = useState<BacktestParams>({
        symbol: 'BTC/USDT',
        timeframe: '1h',
        startDate: thirtyDaysAgo,
        endDate: today,
        initialBalance: 10000,
        strategyRules: 'BUY when RSI < 30\nSELL when RSI > 70',
        stopLossPercent: 2,
        takeProfitPercent: 4,
    });
    const [result, setResult] = useState<BacktestResult | null>(null);
    const [aiInsights, setAiInsights] = useState<BacktestAIInsights | null>(null);
    const [candleData, setCandleData] = useState<Candle[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const generateMockCandles = (start: string, end: string): Candle[] => {
        const candles: Candle[] = [];
        let currentDate = new Date(start);
        const endDate = new Date(end);
        let currentPrice = 50000 + Math.random() * 10000;

        while (currentDate <= endDate) {
            const open = currentPrice;
            const high = open + Math.random() * (open * 0.02);
            const low = open - Math.random() * (open * 0.02);
            const close = low + Math.random() * (high - low);
            
            candles.push({ timestamp: currentDate.getTime(), open, high, low, close });

            // Move to next candle
            currentPrice = close + (Math.random() - 0.49) * (close * 0.03); // Add some trend drift
            currentDate.setHours(currentDate.getHours() + 1); // Assuming 1h timeframe for simplicity
        }
        return candles;
    };

    const calculateRSI = (candles: Candle[], period: number = 14): (number | null)[] => {
        const rsiValues: (number | null)[] = Array(candles.length).fill(null);
        if (candles.length < period) return rsiValues;

        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= period; i++) {
            const change = candles[i].close - candles[i-1].close;
            if (change > 0) gains += change;
            else losses -= change;
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        rsiValues[period] = 100 - (100 / (1 + (avgGain / avgLoss)));

        for (let i = period + 1; i < candles.length; i++) {
            const change = candles[i].close - candles[i-1].close;
            let currentGain = 0;
            let currentLoss = 0;
            if (change > 0) currentGain = change;
            else currentLoss = -change;

            avgGain = (avgGain * (period - 1) + currentGain) / period;
            avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

            if (avgLoss === 0) {
                 rsiValues[i] = 100;
            } else {
                 const rs = avgGain / avgLoss;
                 rsiValues[i] = 100 - (100 / (1 + rs));
            }
        }
        return rsiValues;
    };
    
    const runBacktest = useCallback((candles: Candle[], rsi: (number | null)[], p: typeof params) => {
        let balance = p.initialBalance;
        const balanceHistory = [{ balance }];
        const trades: BacktestResult['trades'] = [];
        let inPosition = false;

        const buyRuleMatch = p.strategyRules.match(/BUY when RSI < (\d+)/i);
        const sellRuleMatch = p.strategyRules.match(/SELL when RSI > (\d+)/i);
        const buyThreshold = buyRuleMatch ? parseInt(buyRuleMatch[1], 10) : null;
        const sellThreshold = sellRuleMatch ? parseInt(sellRuleMatch[1], 10) : null;
        
        for (let i = 1; i < candles.length; i++) {
            if (inPosition) continue;

            const currentRsi = rsi[i];
            if (currentRsi === null) continue;
            
            let entryPrice: number | null = null;
            let takeProfit: number | null = null;
            let stopLoss: number | null = null;

            if (buyThreshold !== null && currentRsi < buyThreshold) {
                entryPrice = candles[i].close;
                takeProfit = entryPrice * (1 + p.takeProfitPercent / 100);
                stopLoss = entryPrice * (1 - p.stopLossPercent / 100);
            }
            
            if (entryPrice && takeProfit && stopLoss) {
                inPosition = true;
                const entryTimestamp = candles[i].timestamp;
                // Look ahead for exit
                for (let j = i + 1; j < candles.length; j++) {
                    if (candles[j].high >= takeProfit) { // Win
                        const exitPrice = takeProfit;
                        const profit = (exitPrice - entryPrice) / entryPrice * balance * 0.1; // simplified profit
                        balance += profit;
                        trades.push({ entryTimestamp, exitTimestamp: candles[j].timestamp, entryPrice, exitPrice, profit, returnPercent: (profit/balance)*100 });
                        balanceHistory.push({ balance });
                        inPosition = false;
                        i = j;
                        break;
                    }
                    if (candles[j].low <= stopLoss) { // Loss
                         const exitPrice = stopLoss;
                         const profit = (exitPrice - entryPrice) / entryPrice * balance * 0.1; // simplified profit
                         balance += profit;
                         trades.push({ entryTimestamp, exitTimestamp: candles[j].timestamp, entryPrice, exitPrice, profit, returnPercent: (profit/balance)*100 });
                         balanceHistory.push({ balance });
                         inPosition = false;
                         i = j;
                         break;
                    }
                }
            }
        }
        
        const netProfit = balance - p.initialBalance;
        const netProfitPercent = (netProfit / p.initialBalance) * 100;
        const wins = trades.filter(t => t.profit > 0).length;
        const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
        
        // Simplified drawdown calculation
        let peak = p.initialBalance;
        let maxDrawdown = 0;
        balanceHistory.forEach(h => {
            if (h.balance > peak) peak = h.balance;
            const drawdown = ((peak - h.balance) / peak) * 100;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        });

        return { netProfitPercent, winRate, totalTrades: trades.length, maxDrawdown, trades, balanceHistory };
    }, []);

    const handleRunBacktest = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        setAiInsights(null);
        setCandleData([]);

        try {
            // 1. Generate Data
            const candles = generateMockCandles(params.startDate, params.endDate);
            if (candles.length === 0) throw new Error("Could not generate data for the selected period.");
            setCandleData(candles);

            // 2. Run Backtest
            const rsi = calculateRSI(candles);
            const backtestResult = runBacktest(candles, rsi, params);
            setResult(backtestResult);

            // 3. Get AI Insights
            if (!apiKey) {
                throw new Error("AI analysis requires a Gemini API key. Please add one in the Settings page.");
            }
            const insights = await getBacktestAIInsights(params, backtestResult, apiKey);
            setAiInsights(insights);

        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }

    }, [params, apiKey, runBacktest]);


    return (
        <div>
             <div className="flex items-center gap-3 mb-6">
                <BoltIcon className="h-8 w-8 text-brand-blue" />
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">AI Backtester</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Test your strategies against historical data with AI-powered analysis.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-1">
                    <BacktestInputPanel
                        params={params}
                        setParams={setParams}
                        onRunBacktest={handleRunBacktest}
                        isLoading={isLoading}
                    />
                </div>

                <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
                     {error && (
                        <div className="bg-red-500/10 border border-red-700 text-red-700 dark:text-red-200 p-4 rounded-lg">
                            <h3 className="font-bold mb-2">An Error Occurred</h3>
                            <p>{error}</p>
                        </div>
                    )}
                    <BacktestResultsPanel
                        result={result}
                        aiInsights={aiInsights}
                        candleData={candleData}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default AutomatedBacktestPage;
