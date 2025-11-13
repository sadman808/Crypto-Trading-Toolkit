import React, { useState } from 'react';
import { CompoundingParams, CompoundingPeriodResult, CompoundingAIInsights } from '../types';
import { getCompoundingAIInsights } from '../services/geminiService';
import { ChartBarIcon, BrainIcon } from '../constants';
import Spinner from './Spinner';

interface CompoundingPageProps {
  apiKey: string | null;
  baseCurrency: string;
}

// Chart Component
const GrowthChart: React.FC<{ data: CompoundingPeriodResult[], currency: string }> = ({ data, currency }) => {
    if (data.length < 2) return null;

    const width = 500, height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 70 };
    const values = data.map(d => d.endCapital);
    const minY = data[0].startCapital;
    const maxY = values[values.length - 1];
    const range = maxY - minY === 0 ? 1 : maxY - minY;

    const getX = (i: number) => padding.left + ((i + 1) / data.length) * (width - padding.left - padding.right);
    const getY = (v: number) => (height - padding.bottom) - ((v - minY) / range) * (height - padding.top - padding.bottom);

    const path = data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.endCapital)}`).join(' ');
    const initialPoint = `M ${padding.left} ${getY(data[0].startCapital)}`;
    const fullPath = `${initialPoint} ${path}`;

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(value);

    const yAxisLabels = [minY, minY + range / 2, maxY].map(val => ({ value: formatCurrency(val), y: getY(val) }));

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="chart-title">
            <title id="chart-title">Compounding growth over time</title>
            {yAxisLabels.map(({ value, y }, i) => (
                <g key={i}>
                    <text x={padding.left - 10} y={y} dy="0.32em" textAnchor="end" className="text-xs fill-current text-gray-500 dark:text-gray-400">{value}</text>
                    <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="stroke-current text-gray-300 dark:text-gray-700" strokeDasharray="2" />
                </g>
            ))}
            <path d={fullPath} fill="none" stroke="#00b894" strokeWidth="2" />
        </svg>
    );
};


const CompoundingPage: React.FC<CompoundingPageProps> = ({ apiKey, baseCurrency }) => {
    const [params, setParams] = useState<CompoundingParams>({
        initialCapital: 1000,
        targetProfitPercent: 2,
        periodType: 'Daily',
        periods: 30,
        reinvestmentRate: 100,
    });
    const [results, setResults] = useState<CompoundingPeriodResult[]>([]);
    const [aiInsights, setAiInsights] = useState<CompoundingAIInsights | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleParamChange = (field: keyof CompoundingParams, value: any) => {
        setParams(prev => ({ ...prev, [field]: value }));
    };

    const calculateProjections = () => {
        setIsLoading(true);
        setError(null);
        setResults([]);
        setAiInsights(null);

        const newResults: CompoundingPeriodResult[] = [];
        let currentCapital = params.initialCapital;

        for (let i = 1; i <= params.periods; i++) {
            const startCapital = currentCapital;
            const targetProfit = startCapital * (params.targetProfitPercent / 100);
            const reinvestedProfit = targetProfit * (params.reinvestmentRate / 100);
            const endCapital = startCapital + reinvestedProfit;
            
            newResults.push({ period: i, startCapital, targetProfit, endCapital });
            currentCapital = endCapital;
        }
        
        setResults(newResults);
        fetchAIInsights(newResults);
    };
    
    const fetchAIInsights = async (currentResults: CompoundingPeriodResult[]) => {
        if (!apiKey) {
            setError("AI analysis requires a Gemini API key. Please add one in the Settings page.");
            setIsLoading(false);
            return;
        }
        try {
            const insights = await getCompoundingAIInsights(params, currentResults, apiKey);
            setAiInsights(insights);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: baseCurrency }).format(value);
    
    const inputStyles = "w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
    const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";
    
    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <ChartBarIcon className="h-8 w-8 text-brand-blue" />
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Compounding Plan Tracker</h1>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1">Project your account growth and analyze the feasibility of your plan.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Panel */}
                <div className="lg:col-span-1 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4 h-fit sticky top-24">
                    <h2 className="text-xl font-bold font-display text-gray-800 dark:text-white">Plan Parameters</h2>
                     <div>
                        <label htmlFor="initialCapital" className={labelStyles}>Initial Capital ({baseCurrency})</label>
                        <input type="number" id="initialCapital" value={params.initialCapital} onChange={e => handleParamChange('initialCapital', parseFloat(e.target.value) || 0)} className={inputStyles} />
                    </div>
                     <div>
                        <label htmlFor="targetProfitPercent" className={labelStyles}>Target {params.periodType} Profit ({params.targetProfitPercent}%)</label>
                        <input type="range" id="targetProfitPercent" min="0.1" max="20" step="0.1" value={params.targetProfitPercent} onChange={e => handleParamChange('targetProfitPercent', parseFloat(e.target.value))} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="periodType" className={labelStyles}>Period Type</label>
                            <select id="periodType" value={params.periodType} onChange={e => handleParamChange('periodType', e.target.value)} className={`${inputStyles} appearance-none`}>
                                <option>Daily</option>
                                <option>Weekly</option>
                                <option>Monthly</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="periods" className={labelStyles}># of Periods</label>
                            <input type="number" id="periods" value={params.periods} onChange={e => handleParamChange('periods', parseInt(e.target.value, 10) || 0)} className={inputStyles} />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="reinvestmentRate" className={labelStyles}>Reinvestment Rate ({params.reinvestmentRate}%)</label>
                        <input type="range" id="reinvestmentRate" min="0" max="100" step="1" value={params.reinvestmentRate} onChange={e => handleParamChange('reinvestmentRate', parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <button onClick={calculateProjections} disabled={isLoading} className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center disabled:bg-gray-500/80 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? <Spinner /> : 'Calculate & Analyze'}
                    </button>
                </div>
                
                {/* Results Panel */}
                <div className="lg:col-span-2 space-y-6">
                     {error && <div className="text-red-500 bg-red-500/10 p-4 rounded-md border border-red-700">{error}</div>}
                    {results.length === 0 && !isLoading && (
                        <div className="bg-gray-100 dark:bg-gray-900/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[400px]">
                            <ChartBarIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Your projection will appear here</h3>
                            <p className="text-gray-500 dark:text-gray-500">Set your parameters and click "Calculate & Analyze".</p>
                        </div>
                    )}
                     {isLoading && results.length === 0 && (
                        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[400px]">
                            <Spinner />
                            <p className="mt-4 text-gray-500 dark:text-gray-400">Calculating projections...</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <>
                            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-bold font-display text-gray-800 dark:text-white mb-4">Growth Projection</h2>
                                <GrowthChart data={results} currency={baseCurrency} />
                                <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                    Starting with <strong className="text-gray-800 dark:text-white">{formatCurrency(params.initialCapital)}</strong>, your account could grow to <strong className="text-green-500">{formatCurrency(results[results.length - 1].endCapital)}</strong> in {params.periods} {params.periodType.toLowerCase()}s.
                                </div>
                            </div>

                            {aiInsights && (
                                <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <BrainIcon className="h-6 w-6 text-brand-blue" />
                                        <h2 className="text-xl font-bold font-display text-gray-800 dark:text-white">AI Psychologist Analysis</h2>
                                    </div>
                                    <div className="text-center bg-gray-200 dark:bg-gray-800/50 p-4 rounded-lg mb-6">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Plan Feasibility Score</p>
                                        <p className={`text-6xl font-bold font-display ${aiInsights.feasibilityScore > 7 ? 'text-green-500' : aiInsights.feasibilityScore < 4 ? 'text-red-500' : 'text-yellow-500'}`}>{aiInsights.feasibilityScore}<span className="text-3xl text-gray-400 dark:text-gray-600">/10</span></p>
                                    </div>
                                    <div className="space-y-4 text-sm">
                                        <div><strong className="text-gray-700 dark:text-gray-300">Summary:</strong><p className="text-gray-600 dark:text-gray-400">{aiInsights.summary}</p></div>
                                        <div>
                                            <strong className="text-yellow-600 dark:text-yellow-400">Potential Risks:</strong>
                                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 mt-1">
                                                {aiInsights.potentialRisks.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <strong className="text-green-600 dark:text-green-400">Recommendations:</strong>
                                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 mt-1">
                                                {aiInsights.recommendations.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                             {isLoading && aiInsights === null && (
                                 <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                                    <Spinner />
                                    <p className="mt-4 text-gray-500 dark:text-gray-400">Analyzing psychological factors...</p>
                                </div>
                            )}

                            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-bold font-display text-gray-800 dark:text-white mb-4">Projection Table</h2>
                                <div className="overflow-x-auto max-h-96">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-200 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 uppercase sticky top-0">
                                            <tr>
                                                <th className="p-3">Period</th>
                                                <th className="p-3">Start Capital</th>
                                                <th className="p-3">Target Profit</th>
                                                <th className="p-3">End Capital</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                            {results.map(r => (
                                                <tr key={r.period}>
                                                    <td className="p-3 font-medium text-gray-800 dark:text-white">{r.period}</td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">{formatCurrency(r.startCapital)}</td>
                                                    <td className="p-3 text-green-500">{formatCurrency(r.targetProfit)}</td>
                                                    <td className="p-3 font-semibold text-gray-800 dark:text-white">{formatCurrency(r.endCapital)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompoundingPage;
