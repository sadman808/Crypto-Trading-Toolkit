import React, { useState, useCallback } from 'react';
import { BacktestParams, BacktestResult, BacktestAIInsights, Candle } from '../types';
import { DEFAULT_BACKTEST_PARAMS, BrainIcon } from '../constants';
import { runBacktest, generateMockCandleData } from '../services/backtestService';
import { getBacktestAIInsights } from '../services/geminiService';
import BacktestInputPanel from './BacktestInputPanel';
import BacktestResultsPanel from './BacktestResultsPanel';

interface BacktestPageProps {
  apiKey: string;
}

const BacktestPage: React.FC<BacktestPageProps> = ({ apiKey }) => {
    const [params, setParams] = useState<BacktestParams>(DEFAULT_BACKTEST_PARAMS);
    const [result, setResult] = useState<BacktestResult | null>(null);
    const [aiInsights, setAiInsights] = useState<BacktestAIInsights | null>(null);
    const [candleData, setCandleData] = useState<Candle[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleRunBacktest = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        setAiInsights(null);

        try {
            // Step 1: Generate mock historical data
            const candles = generateMockCandleData(params.startDate, params.endDate, params.timeframe);
            if (candles.length < 20) { // Need enough data for indicators
                throw new Error("Date range is too short to generate sufficient data for backtesting.");
            }
            setCandleData(candles);

            // Step 2: Run the backtest simulation
            const backtestResult = runBacktest(params, candles);
            setResult(backtestResult);

            // Step 3: Get AI insights if API key is available
            if (apiKey) {
                const insights = await getBacktestAIInsights(backtestResult, apiKey);
                setAiInsights(insights);
            } else {
                 setAiInsights({
                    aiStrategyScore: 0,
                    marketConditionAnalysis: "API Key needed for AI analysis.",
                    strategyStrengths: "Please add your Gemini API Key in the settings page to enable AI-powered insights for your backtests.",
                    strategyWeaknesses: "",
                    improvementSuggestions: []
                });
            }

        } catch (e) {
            if (e instanceof Error) setError(e.message);
            else setError('An unknown error occurred during the backtest.');
        } finally {
            setIsLoading(false);
        }
    }, [params, apiKey]);

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <BrainIcon className="h-8 w-8 text-brand-blue" />
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Backtest AI</h1>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1">Simulate your trading strategies on historical market data.</p>
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
                <div className="lg:col-span-2">
                    {error && (
                        <div className="bg-red-500/10 border border-red-700 text-red-700 dark:text-red-200 p-4 rounded-lg mb-6">
                            <h3 className="font-bold mb-2">Backtest Error</h3>
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

export default BacktestPage;
