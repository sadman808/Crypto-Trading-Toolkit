import React, { useState } from 'react';
import { CalculatorIcon } from '../constants';

const ProfitCalculatorPage: React.FC = () => {
    const [inputs, setInputs] = useState({
        buyPrice: '',
        sellPrice: '',
        quantity: '',
        feePercent: '0.1'
    });
    const [result, setResult] = useState<{
        totalBuy: number;
        totalSell: number;
        fees: number;
        netProfit: number;
        profitPercent: number;
    } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const calculate = () => {
        const buyPrice = parseFloat(inputs.buyPrice);
        const sellPrice = parseFloat(inputs.sellPrice);
        const quantity = parseFloat(inputs.quantity);
        const feePercent = parseFloat(inputs.feePercent);

        if (isNaN(buyPrice) || isNaN(sellPrice) || isNaN(quantity) || isNaN(feePercent) || buyPrice <= 0 || quantity <= 0) {
            alert("Please enter valid positive numbers for all fields.");
            return;
        }

        const totalBuy = buyPrice * quantity;
        const totalSell = sellPrice * quantity;
        const fees = (totalBuy + totalSell) * (feePercent / 100);
        const netProfit = totalSell - totalBuy - fees;
        const profitPercent = (netProfit / totalBuy) * 100;

        setResult({ totalBuy, totalSell, fees, netProfit, profitPercent });
    };

    const inputStyles = "w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
    const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";
    
    return (
        <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <CalculatorIcon className="h-8 w-8 text-brand-blue" />
                <div>
                    <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Profit Calculator</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Estimate the potential profit or loss from a trade.</p>
                </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="buyPrice" className={labelStyles}>Buy Price</label>
                        <input type="number" name="buyPrice" value={inputs.buyPrice} onChange={handleChange} className={inputStyles} placeholder="100" />
                    </div>
                    <div>
                        <label htmlFor="sellPrice" className={labelStyles}>Sell Price</label>
                        <input type="number" name="sellPrice" value={inputs.sellPrice} onChange={handleChange} className={inputStyles} placeholder="120" />
                    </div>
                </div>
                <div>
                    <label htmlFor="quantity" className={labelStyles}>Quantity</label>
                    <input type="number" name="quantity" value={inputs.quantity} onChange={handleChange} className={inputStyles} placeholder="10" />
                </div>
                 <div>
                    <label htmlFor="feePercent" className={labelStyles}>Trading Fee (%)</label>
                    <input type="number" name="feePercent" value={inputs.feePercent} onChange={handleChange} className={inputStyles} placeholder="0.1" />
                </div>
                <button onClick={calculate} className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition-colors">Calculate</button>
            </div>

            {result && (
                <div className="mt-6 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-3">
                    <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white mb-2">Calculation Results</h3>
                    <MetricRow label="Total Buy Value" value={`$${result.totalBuy.toFixed(2)}`} />
                    <MetricRow label="Total Sell Value" value={`$${result.totalSell.toFixed(2)}`} />
                    <MetricRow label="Trading Fees" value={`$${result.fees.toFixed(2)}`} />
                    <MetricRow 
                        label="Net Profit" 
                        value={
                            <span className={result.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {result.netProfit >= 0 ? '+' : ''}${result.netProfit.toFixed(2)}
                            </span>
                        } 
                    />
                    <MetricRow 
                        label="Profit %" 
                        value={
                            <span className={result.profitPercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {result.profitPercent.toFixed(2)}%
                            </span>
                        } 
                    />
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

export default ProfitCalculatorPage;