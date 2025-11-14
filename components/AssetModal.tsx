import React, { useState, useEffect } from 'react';
import { Asset, AssetBias, AssetKeyLevel, AssetLink } from '../types';
import { PlusIcon, TrashIcon } from '../constants';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Omit<Asset, 'id' | 'created_at' | 'user_id'> | Asset) => void;
  assetToEdit: Asset | null;
}

const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose, onSave, assetToEdit }) => {
    const [asset, setAsset] = useState({
        symbol: '', name: '', category: '',
        fundamental_analysis: '', technical_analysis: '',
        bias: AssetBias.Neutral, tags: [] as string[],
        key_levels: [] as AssetKeyLevel[], links: [] as AssetLink[],
    });
    
    const [tagInput, setTagInput] = useState('');
    const [newLevel, setNewLevel] = useState({ label: '', price: '' });
    const [newLink, setNewLink] = useState({ label: '', url: '' });

    useEffect(() => {
        if (assetToEdit) {
            setAsset({
                ...assetToEdit,
                key_levels: assetToEdit.key_levels || [],
                links: assetToEdit.links || [],
                tags: assetToEdit.tags || [],
            });
        } else {
            setAsset({
                symbol: '', name: '', category: '',
                fundamental_analysis: '', technical_analysis: '',
                bias: AssetBias.Neutral, tags: [],
                key_levels: [], links: [],
            });
        }
    }, [assetToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setAsset({ ...asset, [e.target.name]: e.target.value });
    };

    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!asset.tags.includes(tagInput.trim().toLowerCase())) {
                setAsset(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim().toLowerCase()] }));
            }
            setTagInput('');
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        setAsset(prev => ({...prev, tags: prev.tags.filter(t => t !== tagToRemove)}));
    };
    
    const handleAddLevel = () => {
        if (!newLevel.label.trim() || !newLevel.price.trim()) return;
        setAsset(prev => ({ ...prev, key_levels: [...prev.key_levels, { label: newLevel.label, price: parseFloat(newLevel.price) }] }));
        setNewLevel({ label: '', price: '' });
    };

    const handleRemoveLevel = (index: number) => {
        setAsset(prev => ({ ...prev, key_levels: prev.key_levels.filter((_, i) => i !== index) }));
    };
    
    const handleAddLink = () => {
        if (!newLink.label.trim() || !newLink.url.trim()) return;
        setAsset(prev => ({ ...prev, links: [...prev.links, newLink] }));
        setNewLink({ label: '', url: '' });
    };

    const handleRemoveLink = (index: number) => {
        setAsset(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(assetToEdit ? { ...assetToEdit, ...asset } : asset);
        onClose();
    };

    const inputStyles = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
    const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">{assetToEdit ? 'Edit Asset' : 'Add New Asset'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label htmlFor="symbol" className={labelStyles}>Symbol</label>
                            <input type="text" name="symbol" value={asset.symbol} onChange={e => setAsset({...asset, symbol: e.target.value.toUpperCase()})} className={inputStyles} required placeholder="e.g., BTC/USD" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="name" className={labelStyles}>Name</label>
                            <input type="text" name="name" value={asset.name} onChange={handleChange} className={inputStyles} required placeholder="e.g., Bitcoin" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className={labelStyles}>Category</label>
                            <input type="text" name="category" value={asset.category} onChange={handleChange} className={inputStyles} placeholder="e.g., Cryptocurrency" />
                        </div>
                        <div>
                            <label htmlFor="bias" className={labelStyles}>Long-Term Bias</label>
                            <select name="bias" value={asset.bias} onChange={handleChange} className={`${inputStyles} appearance-none`}>
                                {Object.values(AssetBias).map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="fundamental_analysis" className={labelStyles}>Fundamental Analysis</label>
                        <textarea name="fundamental_analysis" value={asset.fundamental_analysis} onChange={handleChange} rows={4} className={inputStyles} placeholder="Describe the asset's fundamentals, value proposition, recent news..." />
                    </div>
                    <div>
                        <label htmlFor="technical_analysis" className={labelStyles}>Technical Analysis</label>
                        <textarea name="technical_analysis" value={asset.technical_analysis} onChange={handleChange} rows={4} className={inputStyles} placeholder="Describe the current market structure, key trends, chart patterns..." />
                    </div>
                    
                    {/* Key Levels */}
                    <div>
                        <label className={labelStyles}>Key Levels</label>
                        <div className="space-y-2">
                            {asset.key_levels.map((level, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold p-2 bg-gray-100 dark:bg-gray-800 rounded-l-md">{level.label}</span>
                                    <span className="flex-grow p-2 bg-gray-100 dark:bg-gray-800">{level.price}</span>
                                    <button type="button" onClick={() => handleRemoveLevel(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-r-md"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                         <div className="flex items-end gap-2 mt-2">
                            <input type="text" value={newLevel.label} onChange={e => setNewLevel({...newLevel, label: e.target.value})} placeholder="Level Name (e.g., Support)" className={`${inputStyles} text-sm`} />
                            <input type="number" value={newLevel.price} onChange={e => setNewLevel({...newLevel, price: e.target.value})} placeholder="Price" className={`${inputStyles} text-sm`} />
                            <button type="button" onClick={handleAddLevel} className="p-2 bg-blue-500/10 text-brand-blue rounded-md hover:bg-blue-500/20"><PlusIcon className="h-5 w-5"/></button>
                        </div>
                    </div>

                     {/* Links */}
                    <div>
                        <label className={labelStyles}>Relevant Links</label>
                         <div className="space-y-2">
                            {asset.links.map((link, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold p-2 bg-gray-100 dark:bg-gray-800 rounded-l-md">{link.label}</span>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-grow p-2 bg-gray-100 dark:bg-gray-800 truncate hover:underline">{link.url}</a>
                                    <button type="button" onClick={() => handleRemoveLink(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-r-md"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-end gap-2 mt-2">
                            <input type="text" value={newLink.label} onChange={e => setNewLink({...newLink, label: e.target.value})} placeholder="Label (e.g., Whitepaper)" className={`${inputStyles} text-sm`} />
                            <input type="url" value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} placeholder="https://..." className={`${inputStyles} text-sm`} />
                            <button type="button" onClick={handleAddLink} className="p-2 bg-blue-500/10 text-brand-blue rounded-md hover:bg-blue-500/20"><PlusIcon className="h-5 w-5"/></button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className={labelStyles}>Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {asset.tags.map(tag => (
                                <span key={tag} className="bg-blue-500/10 text-brand-blue text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 text-blue-400 hover:text-blue-600">&times;</button>
                                </span>
                            ))}
                        </div>
                        <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagInput} className={inputStyles} placeholder="Add a tag and press Enter" />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="text-gray-600 dark:text-gray-400 font-semibold py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
                        <button type="submit" className="bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">Save Asset</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssetModal;