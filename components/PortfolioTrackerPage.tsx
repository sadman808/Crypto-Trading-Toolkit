import React, { useState } from 'react';
import { PortfolioAsset } from '../types';
import { ChartPieIcon, TrashIcon, PlusIcon } from '../constants';

const COLORS = ["#0070f3", "#00b894", "#fdcb6e", "#d63031", "#6c5ce7", "#e84393"];

const PieChart = ({ data }: { data: { name: string; value: number }[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return <div className="flex items-center justify-center h-48 w-48 bg-gray-200 dark:bg-gray-800 rounded-full"><p className="text-sm text-gray-500">No data</p></div>;
    }
    
    let cumulative = 0;
    const segments = data.map((item, index) => {
        const percentage = item.value / total;
        const startAngle = (cumulative / total) * 360;
        cumulative += item.value;
        const endAngle = (cumulative / total) * 360;
        const largeArcFlag = percentage > 0.5 ? 1 : 0;

        const startX = 50 + 45 * Math.cos(Math.PI * (startAngle - 90) / 180);
        const startY = 50 + 45 * Math.sin(Math.PI * (startAngle - 90) / 180);
        const endX = 50 + 45 * Math.cos(Math.PI * (endAngle - 90) / 180);
        const endY = 50 + 45 * Math.sin(Math.PI * (endAngle - 90) / 180);
        
        return <path key={item.name} d={`M 50 50 L ${startX} ${startY} A 45 45 0 ${largeArcFlag} 1 ${endX} ${endY} Z`} fill={COLORS[index % COLORS.length]} />;
    });

    return <svg viewBox="0 0 100 100" className="w-48 h-48">{segments}</svg>;
};


interface PortfolioTrackerPageProps {
  portfolio: PortfolioAsset[];
  onUpdatePortfolio: (portfolio: PortfolioAsset[]) => void;
  baseCurrency: string;
}

const PortfolioTrackerPage: React.FC<PortfolioTrackerPageProps> = ({ portfolio, onUpdatePortfolio, baseCurrency }) => {
    const [newAsset, setNewAsset] = useState({ id: '', name: '', quantity: '', avgBuyPrice: '', currentPrice: '' });
    const [isAdding, setIsAdding] = useState(false);

    const totalValue = portfolio.reduce((sum, asset) => sum + asset.quantity * asset.currentPrice, 0);
    const totalCost = portfolio.reduce((sum, asset) => sum + asset.quantity * asset.avgBuyPrice, 0);
    const unrealizedPL = totalValue - totalCost;

    const handleAddAsset = () => {
        const id = newAsset.id.toUpperCase();
        if (portfolio.find(a => a.id === id)) {
            alert("Asset already exists.");
            return;
        }
        const parsedAsset = {
            id,
            name: newAsset.name || id,
            quantity: parseFloat(newAsset.quantity),
            avgBuyPrice: parseFloat(newAsset.avgBuyPrice),
            currentPrice: parseFloat(newAsset.currentPrice)
        };
        if (id && !Object.values(parsedAsset).some(isNaN)) {
            onUpdatePortfolio([...portfolio, parsedAsset]);
            setNewAsset({ id: '', name: '', quantity: '', avgBuyPrice: '', currentPrice: '' });
            setIsAdding(false);
        } else {
            alert("Please fill all fields with valid numbers.");
        }
    };
    
    const handleUpdateAsset = (id: string, field: keyof PortfolioAsset, value: string) => {
        const updatedPortfolio = portfolio.map(asset => 
            asset.id === id ? { ...asset, [field]: parseFloat(value) || 0 } : asset
        );
        onUpdatePortfolio(updatedPortfolio);
    };

    const handleDeleteAsset = (id: string) => {
        onUpdatePortfolio(portfolio.filter(a => a.id !== id));
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: baseCurrency }).format(value);
    
    const chartData = portfolio.map(asset => ({ name: asset.id, value: asset.quantity * asset.currentPrice }));

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Portfolio Tracker</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manually track your crypto holdings and performance.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                     <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Portfolio Value</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white">{formatCurrency(totalValue)}</p>
                        <p className={`text-sm font-semibold ${unrealizedPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(unrealizedPL)} ({totalCost > 0 ? (unrealizedPL / totalCost * 100).toFixed(2) : 0}%)
                        </p>
                    </div>
                     <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                        <h3 className="font-bold mb-4 text-gray-800 dark:text-white">Allocation</h3>
                        <div className="flex items-center gap-4">
                            <PieChart data={chartData} />
                            <div className="space-y-1 text-xs">
                                {chartData.map((item, i) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                                        <span className="text-gray-500 dark:text-gray-400">({(item.value / totalValue * 100 || 0).toFixed(1)}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                    <h3 className="font-bold mb-4 text-gray-800 dark:text-white">Assets</h3>
                    <div className="space-y-3">
                    {portfolio.map(asset => (
                        <div key={asset.id} className="grid grid-cols-3 sm:grid-cols-5 gap-2 items-center">
                            <strong className="sm:col-span-1 col-span-3 text-gray-900 dark:text-white">{asset.name} ({asset.id})</strong>
                            <input type="number" value={asset.quantity} onChange={e => handleUpdateAsset(asset.id, 'quantity', e.target.value)} className="w-full text-sm p-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"/>
                            <input type="number" value={asset.avgBuyPrice} onChange={e => handleUpdateAsset(asset.id, 'avgBuyPrice', e.target.value)} className="w-full text-sm p-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"/>
                            <input type="number" value={asset.currentPrice} onChange={e => handleUpdateAsset(asset.id, 'currentPrice', e.target.value)} className="w-full text-sm p-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"/>
                            <div className="flex justify-end">
                                <button onClick={() => handleDeleteAsset(asset.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                        </div>
                    ))}
                    </div>
                    {isAdding ? (
                         <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <input value={newAsset.id} onChange={e => setNewAsset({...newAsset, id: e.target.value})} placeholder="Symbol (BTC)" className="w-full text-sm p-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"/>
                            <input value={newAsset.quantity} onChange={e => setNewAsset({...newAsset, quantity: e.target.value})} type="number" placeholder="Quantity" className="w-full text-sm p-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"/>
                            <input value={newAsset.avgBuyPrice} onChange={e => setNewAsset({...newAsset, avgBuyPrice: e.target.value})} type="number" placeholder="Avg Buy Price" className="w-full text-sm p-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"/>
                            <input value={newAsset.currentPrice} onChange={e => setNewAsset({...newAsset, currentPrice: e.target.value})} type="number" placeholder="Current Price" className="w-full text-sm p-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"/>
                            <div className="flex justify-end gap-1">
                                <button onClick={handleAddAsset} className="text-green-500 hover:text-green-700 p-1">Add</button>
                                <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-gray-700 p-1">Cancel</button>
                            </div>
                        </div>
                    ) : (
                         <button onClick={() => setIsAdding(true)} className="mt-4 w-full flex items-center justify-center gap-2 text-sm bg-blue-500/10 text-brand-blue font-semibold py-2 px-4 rounded-md hover:bg-blue-500/20 transition-colors">
                            <PlusIcon className="h-4 w-4" /> Add Asset
                         </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PortfolioTrackerPage;