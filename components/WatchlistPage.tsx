
import React, { useState } from 'react';
import { WatchlistItem } from '../types';
import { ArrowTrendingUpIcon, PlusIcon, TrashIcon } from '../constants';

// --- Main Page Component ---
interface WatchlistPageProps {
  items: WatchlistItem[];
  onAddItem: (item: Omit<WatchlistItem, 'id' | 'created_at' | 'user_id'>) => void;
  onUpdateItem: (item: WatchlistItem) => void;
  onDeleteItem: (id: string) => void;
}

const WatchlistPage: React.FC<WatchlistPageProps> = ({ items, onAddItem, onUpdateItem, onDeleteItem }) => {
    const [newItem, setNewItem] = useState({ symbol: '', notes: '' });
    const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        const symbol = newItem.symbol.trim().toUpperCase();
        if (!symbol) return;
        if (items.some(i => i.symbol === symbol)) {
            alert(`Symbol ${symbol} is already on the watchlist.`);
            return;
        }
        onAddItem(newItem);
        setNewItem({ symbol: '', notes: '' });
    };

    const handleNotesChange = (id: string, notes: string) => {
        setEditingNotes(prev => ({ ...prev, [id]: notes }));
    };
    
    const handleNotesBlur = (item: WatchlistItem) => {
        if (editingNotes[item.id] !== undefined && editingNotes[item.id] !== item.notes) {
            onUpdateItem({ ...item, notes: editingNotes[item.id] });
        }
        // Clean up the editing state for this item
        const newEditingNotes = { ...editingNotes };
        delete newEditingNotes[item.id];
        setEditingNotes(newEditingNotes);
    };

    return (
        <div className="max-w-4xl mx-auto">
             <div className="flex items-center gap-3 mb-6">
                <ArrowTrendingUpIcon className="h-8 w-8 text-brand-blue" />
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Watchlist</h1>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1">Monitor assets and jot down your trading ideas.</p>
                </div>
            </div>

            {/* Add Item Form */}
            <form onSubmit={handleAddItem} className="mb-6 p-4 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                    <label htmlFor="symbol" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Symbol</label>
                    <input 
                        id="symbol"
                        type="text" 
                        value={newItem.symbol}
                        onChange={e => setNewItem({...newItem, symbol: e.target.value.toUpperCase()})}
                        className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm"
                        placeholder="e.g., AAPL, EUR/USD"
                        required
                    />
                </div>
                <div className="flex-[2]">
                     <label htmlFor="notes" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Initial Notes (Optional)</label>
                     <input
                        id="notes"
                        type="text" 
                        value={newItem.notes}
                        onChange={e => setNewItem({...newItem, notes: e.target.value})}
                        className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm"
                        placeholder="e.g., Watching for breakout above 150"
                    />
                </div>
                <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm">
                    <PlusIcon className="h-4 w-4" /> Add to Watchlist
                </button>
            </form>

            {/* Watchlist Table */}
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-200 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 uppercase text-left">
                        <tr>
                            <th className="p-3 w-1/4">Symbol</th>
                            <th className="p-3 w-1/2">Notes</th>
                            <th className="p-3 w-1/4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center p-8 text-gray-500">Your watchlist is empty.</td>
                            </tr>
                        ) : (
                            items.map(item => (
                                <tr key={item.id} className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                                    <td className="p-3 font-bold text-gray-900 dark:text-white">{item.symbol}</td>
                                    <td className="p-3">
                                        <input
                                            type="text"
                                            value={editingNotes[item.id] ?? item.notes}
                                            onChange={e => handleNotesChange(item.id, e.target.value)}
                                            onBlur={() => handleNotesBlur(item)}
                                            className="w-full bg-transparent p-1 rounded-md border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                                            placeholder="Add a note..."
                                        />
                                    </td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => onDeleteItem(item.id)} className="text-gray-500 hover:text-red-500 p-2 rounded-md hover:bg-red-500/10" aria-label={`Remove ${item.symbol}`}>
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WatchlistPage;
