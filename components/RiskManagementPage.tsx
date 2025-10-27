import React, { useState, useEffect, useCallback } from 'react';
import { TradeParams, CalculationResult, AIInsights, SavedTrade } from '../types';
import { DEFAULT_TRADE_PARAMS } from '../constants';
import InputPanel from './InputPanel';
import ResultsPanel from './ResultsPanel';
import AIAssistantPanel from './AIAssistantPanel';
import { calculateRisk } from '../services/calculationService';
import { getAIInsights } from '../services/geminiService';

interface RiskManagementPageProps {
  onSaveTrade: (tradeData: {tradeParams: TradeParams, calculationResult: CalculationResult, aiInsights: AIInsights | null, notes: string}) => void;
  tradeToLoad: SavedTrade | null;
  onTradeLoaded: () => void;
  defaultRiskPercent: number;
  aiEnabled: boolean;
  apiKey: string;
}

const RiskManagementPage: React.FC<RiskManagementPageProps> = ({ onSaveTrade, tradeToLoad, onTradeLoaded, defaultRiskPercent, aiEnabled, apiKey }) => {
    const [tradeParams, setTradeParams] = useState<TradeParams>({...DEFAULT_TRADE_PARAMS, riskPercentage: defaultRiskPercent });
    const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
    const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (tradeToLoad) {
            setTradeParams(tradeToLoad.tradeParams);
            setCalculationResult(tradeToLoad.calculationResult);
            setAiInsights(tradeToLoad.aiInsights);
            setError(null);
            onTradeLoaded();
        }
    }, [tradeToLoad, onTradeLoaded]);
    
    // Update risk percentage if default setting changes and it hasn't been modified
    useEffect(() => {
        setTradeParams(prev => ({...prev, riskPercentage: defaultRiskPercent}));
    }, [defaultRiskPercent]);

    const handleCalculateAndAnalyze = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAiInsights(null); // Clear previous insights

        let result: CalculationResult;
        try {
            result = calculateRisk(tradeParams);
            setCalculationResult(result);
        } catch (e) {
            if (e instanceof Error) setError(e.message);
            else setError('An unknown calculation error occurred.');
            setCalculationResult(null);
            setIsLoading(false);
            return;
        }

        if (!aiEnabled) {
            setIsLoading(false);
            return;
        }

        if (!apiKey) {
            setError("AI analysis requires a Gemini API key. Please add one in the Settings page. The calculation result is still available.");
            setIsLoading(false);
            return;
        }

        // Calculation successful, now try to get AI insights if enabled
        try {
            const insights = await getAIInsights(tradeParams, result, apiKey);
            setAiInsights(insights);
        } catch (e) {
            if (e instanceof Error) {
                if (e.message.includes('API key not valid') || e.message.includes('API_KEY_INVALID') || e.message.includes('Requested entity was not found')) {
                    setError("AI analysis failed: Your Gemini API key is invalid. Please check it in the Settings page. The calculation result is still available.");
                } else {
                    setError(`AI analysis failed: ${e.message}. The calculation result is still available.`);
                }
            } else {
                setError('An unknown error occurred during AI analysis. The calculation result is still available.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [tradeParams, aiEnabled, apiKey]);

    const handleReset = () => {
        setTradeParams({...DEFAULT_TRADE_PARAMS, riskPercentage: defaultRiskPercent });
        setCalculationResult(null);
        setAiInsights(null);
        setError(null);
    };
    
    const handleSave = (notes: string) => {
        if (!calculationResult) return;
        onSaveTrade({
            tradeParams,
            calculationResult,
            aiInsights,
            notes,
        });
        alert('Trade Saved!');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900 dark:text-gray-100">Risk Management {aiEnabled && <span className="text-brand-blue">AI</span>}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">An intelligent assistant to help you manage risk effectively for every trade.</p>
                </div>
                 <button onClick={handleReset} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Refresh">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 013.5 9" /></svg>
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-1">
                    <InputPanel
                        params={tradeParams}
                        setParams={setTradeParams}
                        onCalculate={handleCalculateAndAnalyze}
                        isLoading={isLoading}
                        aiEnabled={aiEnabled}
                    />
                </div>

                <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
                    {error && (
                        <div className="bg-red-500/10 border border-red-700 text-red-700 dark:text-red-200 p-4 rounded-lg">
                            <h3 className="font-bold mb-2">An Error Occurred</h3>
                            <p>{error}</p>
                        </div>
                    )}
                    <ResultsPanel result={calculationResult} isLoading={isLoading && !calculationResult} onSaveTrade={handleSave} />
                    
                    {aiEnabled ? (
                        <AIAssistantPanel insights={aiInsights} isLoading={isLoading && calculationResult !== null} />
                    ) : (
                        <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[300px] shadow-lg">
                            <span className="text-3xl mb-4">🤖</span>
                            <h3 className="text-lg font-bold text-gray-400">AI Risk Assistant is disabled</h3>
                            <p className="text-gray-500">You can enable it in the Settings page.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiskManagementPage;