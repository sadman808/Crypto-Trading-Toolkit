import React, { useState, useEffect } from 'react';
import { ToolsIcon } from '../constants';

interface PositionSizerPageProps {
  defaultRiskPercent: number;
}

const PositionSizerPage: React.FC<PositionSizerPageProps> = ({ defaultRiskPercent }) => {
    const [inputs, setInputs] = useState({
        accountBalance: '1000',
        entryPrice: '',
        stopLoss: '',
        riskPercent: defaultRiskPercent.toString()
    });
    const [result, setResult] = useState<{
        positionSize: number;
        riskAmount: number;
        positionValue: number;
    } | null>(null);
    
    useEffect(() => {
        setInputs(prev => ({ ...prev, riskPercent: defaultRiskPercent.toString() }));
    }, [defaultRiskPercent]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const calculate = () => {
        const accountBalance = parseFloat(inputs.accountBalance);
        const entryPrice = parseFloat(inputs.entryPrice);
        const stopLoss = parseFloat(inputs.stopLoss);
        const riskPercent = parseFloat(inputs.riskPercent);

        if (isNaN(accountBalance) || isNaN(entryPrice) || isNaN(stopLoss) || isNaN(riskPercent) || accountBalance <= 0 || entryPrice <= 0 || stopLoss <= 0) {
            alert("Please enter valid positive numbers for all fields.");
            return;
        }
        
        const riskDistance = Math.abs(entryPrice - stopLoss);
        if (riskDistance === 0) {
            alert("Entry and Stop-Loss prices cannot be the same.");
            return;
        }

        const riskAmount = accountBalance * (riskPercent / 100);
        const positionSize = riskAmount / riskDistance;
        const positionValue = positionSize * entryPrice;

        setResult({ positionSize, riskAmount, positionValue });
    };

    const inputStyles = "w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
    const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";
    
    return (
        <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <ToolsIcon className="h-8 w-8 text-brand-yellow" />
                <div>
                    <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Position Size Calculator</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Calculate position size based on your risk tolerance.</p>
                </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4">
                <div>
                    <label htmlFor="accountBalance" className={labelStyles}>Account Balance ($)</label>
                    <input type="number" name="accountBalance" value={inputs.accountBalance} onChange={handleChange} className={inputStyles} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="entryPrice" className={labelStyles}>Entry Price</label>
                        <input type="number" name="entryPrice" value={inputs.entryPrice} onChange={handleChange} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="stopLoss" className={labelStyles}>Stop-Loss Price</label>
                        <input type="number" name="stopLoss" value={inputs.stopLoss} onChange={handleChange} className={inputStyles} />
                    </div>
                </div>
                <div>
                    <label htmlFor="riskPercent" className={labelStyles}>Risk ({inputs.riskPercent}%)</label>
                    <input type="range" id="riskPercent" name="riskPercent" min="0.1" max="10" step="0.1" value={inputs.riskPercent} onChange={handleChange} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                </div>
                <button onClick={calculate} className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition-colors">Calculate Position Size</button>
            </div>

            {result && (
                <div className="mt-6 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-3">
                    <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white mb-2">Sizing Result</h3>
                    <MetricRow label="Position Size (Units)" value={result.positionSize.toFixed(8)} />
                    <MetricRow label="Position Value" value={`$${result.positionValue.toFixed(2)}`} />
                    <MetricRow label="Risk Amount" value={<span className="text-red-500">${result.riskAmount.toFixed(2)}</span>} />
                </div>
            )}
        </div>
    );
};

const MetricRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2 last:border-b-0">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-mono font-semibold text-gray-800 dark:text-white">{value}</span>
  </div>
);

export default PositionSizerPage;