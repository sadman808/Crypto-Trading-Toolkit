import React, { useState, useEffect, useCallback } from 'react';
import { TradeParams, CalculationResult, AIInsights, SavedTrade, AppSettings } from '../types';
import { DEFAULT_TRADE_PARAMS, CheckIcon, SaveIcon } from '../constants';
import InputPanel from './InputPanel';
import ResultsPanel from './ResultsPanel';
import AIAssistantPanel from './AIAssistantPanel';
import { calculateRisk } from '../services/calculationService';
import { getAIInsights } from '../services/geminiService';

const PreTradeChecklistPanel: React.FC<{
  settings: AppSettings;
  notes: string;
  setNotes: (notes: string) => void;
  onConfirm: (preTradeEmotion: number, rulesFollowed: boolean[]) => void;
}> = ({ settings, notes, setNotes, onConfirm }) => {
    const [checkedState, setCheckedState] = useState<boolean[]>(Array(settings.tradingRules.length).fill(false));
    const [emotion, setEmotion] = useState(5);

    const allChecked = checkedState.every(Boolean);

    const handleCheck = (index: number) => {
        const newCheckedState = [...checkedState];
        newCheckedState[index] = !newCheckedState[index];
        setCheckedState(newCheckedState);
    };

    const emotionColor = emotion > 7 ? 'text-green-500' : emotion < 4 ? 'text-red-500' : 'text-yellow-500';

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold font-display text-white mb-4">Pre-Trade Confirmation</h2>
            
            {/* Trading Rules */}
            <div>
                <h3 className="text-md font-semibold text-gray-300 mb-2">My Trading Rules</h3>
                {settings.tradingRules.length > 0 ? (
                    <div className="space-y-3">
                        {settings.tradingRules.map((rule, index) => (
                             <label key={index} htmlFor={`rule-${index}`} className="flex items-center cursor-pointer p-3 bg-gray-800/50 rounded-md hover:bg-gray-800 transition-colors">
                                <div className="relative flex items-center">
                                   <input id={`rule-${index}`} type="checkbox" checked={checkedState[index]} onChange={() => handleCheck(index)} className="appearance-none h-5 w-5 border-2 border-gray-600 rounded bg-gray-900 checked:bg-brand-blue checked:border-brand-blue transition-all" />
                                   {checkedState[index] && <CheckIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />}
                                </div>
                                <span className={`ml-3 text-gray-300 ${checkedState[index] ? 'line-through text-gray-500' : ''}`}>{rule}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">You haven't defined any trading rules. Add some in the Settings page to improve discipline.</p>
                )}
            </div>

            {/* Emotion Logger */}
            <div className="mt-6">
                <label className="block text-md font-semibold text-gray-300 mb-2">Pre-Trade Emotional State: <span className={`font-bold ${emotionColor}`}>{emotion}/10</span></label>
                <p className="text-xs text-gray-500 mb-2">1 = Fearful/Anxious, 5 = Neutral, 10 = Confident/Excited</p>
                <input type="range" min="1" max="10" value={emotion} onChange={e => setEmotion(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </div>

            {/* Notes */}
            <div className="mt-6">
                <label htmlFor="tradeNotes" className="block text-md font-semibold text-gray-300 mb-2">Initial Notes (Optional)</label>
                <textarea 
                  id="tradeNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-sm text-gray-300 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="Add a quick note about your trade setup, rationale, etc."
                />
            </div>

            {/* Save Button */}
            <div className="mt-6">
                 <button 
                    onClick={() => onConfirm(emotion, checkedState)} 
                    disabled={!allChecked && settings.tradingRules.length > 0}
                    className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    <SaveIcon className="h-5 w-5" />
                    Confirm & Save Trade Plan
                </button>
                {(!allChecked && settings.tradingRules.length > 0) && <p className="text-xs text-center mt-2 text-yellow-400">Please confirm all trading rules before saving.</p>}
            </div>
        </div>
    );
};


interface RiskManagementPageProps {
  onSaveTrade: (tradeData: {
      tradeParams: TradeParams, 
      calculationResult: CalculationResult, 
      aiInsights: AIInsights | null, 
      notes: string,
      preTradeEmotionRating: number,
      rulesFollowed: boolean[],
  }) => void;
  tradeToLoad: SavedTrade | null;
  onTradeLoaded: () => void;
  settings: AppSettings;
  aiEnabled: boolean;
  apiKey: string | null;
}

const RiskManagementPage: React.FC<RiskManagementPageProps> = ({ onSaveTrade, tradeToLoad, onTradeLoaded, settings, aiEnabled, apiKey }) => {
    const [tradeParams, setTradeParams] = useState<TradeParams>({...DEFAULT_TRADE_PARAMS, riskPercentage: settings.defaultRiskPercent });
    const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
    const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (tradeToLoad) {
            setTradeParams(tradeToLoad.tradeParams);
            setCalculationResult(tradeToLoad.calculationResult);
            setAiInsights(tradeToLoad.aiInsights);
            setNotes(tradeToLoad.notes || '');
            setError(null);
            onTradeLoaded();
        }
    }, [tradeToLoad, onTradeLoaded]);
    
    useEffect(() => {
        setTradeParams(prev => ({...prev, riskPercentage: settings.defaultRiskPercent}));
    }, [settings.defaultRiskPercent]);

    const handleCalculateAndAnalyze = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAiInsights(null);

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
        
        try {
            const insights = await getAIInsights(tradeParams, result, apiKey);
            setAiInsights(insights);
        } catch (e) {
            if (e instanceof Error) {
                const errorString = String(e.message || '').toLowerCase();
                if (errorString.includes('api key not valid') || 
                    errorString.includes('api_key_invalid') || 
                    errorString.includes('requested entity was not found') ||
                    errorString.includes('permissiondenied')) {
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
        setTradeParams({...DEFAULT_TRADE_PARAMS, riskPercentage: settings.defaultRiskPercent });
        setCalculationResult(null);
        setAiInsights(null);
        setError(null);
        setNotes('');
    };
    
    const handleSave = (preTradeEmotionRating: number, rulesFollowed: boolean[]) => {
        if (!calculationResult) return;
        onSaveTrade({
            tradeParams,
            calculationResult,
            aiInsights,
            notes,
            preTradeEmotionRating,
            rulesFollowed,
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
                    <ResultsPanel result={calculationResult} isLoading={isLoading && !calculationResult} />
                    
                    {aiEnabled && (
                        <AIAssistantPanel insights={aiInsights} isLoading={isLoading && calculationResult !== null} />
                    )}

                    {calculationResult && (
                       <PreTradeChecklistPanel settings={settings} notes={notes} setNotes={setNotes} onConfirm={handleSave} />
                    )}

                    {!aiEnabled && !calculationResult && (
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
