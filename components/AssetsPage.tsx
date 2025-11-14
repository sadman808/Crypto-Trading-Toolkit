import React, { useState, useMemo } from 'react';
import { Asset, AssetBias } from '../types';
import { CubeIcon, PlusIcon, PencilIcon, TrashIcon, LinkIcon } from '../constants';
import AssetModal from './AssetModal';

interface AssetsPageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id' | 'created_at' | 'user_id'>) => Promise<Asset | null>;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
}

// --- Asset Card Component ---
const AssetCard: React.FC<{ asset: Asset, onEdit: (asset: Asset) => void, onDelete: (id: string) => void }> = ({ asset, onEdit, onDelete }) => {
    const biasColor = {
        [AssetBias.Bullish]: 'bg-green-500/10 text-green-400 border-green-500/20',
        [AssetBias.Bearish]: 'bg-red-500/10 text-red-400 border-red-500/20',
        [AssetBias.Neutral]: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    }[asset.bias];

    return (
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col justify-between transition-shadow hover:shadow-lg">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs text-brand-blue font-semibold uppercase">{asset.category || 'Uncategorized'}</p>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{asset.name} ({asset.symbol})</h3>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => onEdit(asset)} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"><PencilIcon className="h-4 w-4" /></button>
                        <button onClick={() => onDelete(asset.id)} className="p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 rounded-md"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                </div>
                
                <div className="mt-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${biasColor}`}>
                        {asset.bias}
                    </span>
                </div>

                <details className="mt-4 text-sm">
                    <summary className="cursor-pointer text-gray-600 dark:text-gray-400 font-semibold">Details</summary>
                    <div className="mt-2 space-y-3">
                        {asset.technical_analysis && <div><strong className="text-gray-800 dark:text-gray-200">Technical:</strong><p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{asset.technical_analysis}</p></div>}
                        {asset.fundamental_analysis && <div><strong className="text-gray-800 dark:text-gray-200">Fundamental:</strong><p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{asset.fundamental_analysis}</p></div>}
                        {asset.key_levels?.length > 0 && (
                            <div>
                                <strong className="text-gray-800 dark:text-gray-200">Key Levels:</strong>
                                <ul className="list-disc list-inside">
                                    {asset.key_levels.map((level, i) => <li key={i}>{level.label}: {level.price}</li>)}
                                </ul>
                            </div>
                        )}
                         {asset.links?.length > 0 && (
                            <div>
                                <strong className="text-gray-800 dark:text-gray-200">Links:</strong>
                                <ul className="list-disc list-inside">
                                    {asset.links.map((link, i) => <li key={i}><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline flex items-center gap-1">{link.label} <LinkIcon className="h-3 w-3" /></a></li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </details>

            </div>
            <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                    {asset.tags.map(tag => <span key={tag} className="text-xs bg-blue-500/10 text-brand-blue font-semibold px-2 py-1 rounded-full">{tag}</span>)}
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
const AssetsPage: React.FC<AssetsPageProps> = ({ assets, onAddAsset, onUpdateAsset, onDeleteAsset }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAssets = useMemo(() => {
        return assets.filter(asset => 
            asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [assets, searchTerm]);

    const handleEdit = (asset: Asset) => {
        setAssetToEdit(asset);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setAssetToEdit(null);
        setIsModalOpen(true);
    };
    
    return (
        <div className="max-w-7xl mx-auto">
            <AssetModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={assetToEdit ? onUpdateAsset : onAddAsset}
                assetToEdit={assetToEdit}
            />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <CubeIcon className="h-8 w-8 text-brand-blue" />
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Asset Library</h1>
                        <p className="text-md text-gray-500 dark:text-gray-400 mt-1">Your personal research database for trading instruments.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <input 
                        type="search"
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full sm:w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-sm focus:ring-brand-blue focus:border-brand-blue"
                    />
                    <button onClick={handleAdd} className="flex-shrink-0 flex items-center gap-2 bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm">
                        <PlusIcon className="h-4 w-4" /> Add Asset
                    </button>
                </div>
            </div>
            
            {assets.length === 0 ? (
                 <div className="text-center text-gray-500 py-24 bg-gray-100 dark:bg-gray-900/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <p className="text-lg">Your asset library is empty.</p>
                    <p className="text-sm">Click 'Add Asset' to start your research collection.</p>
                </div>
            ) : filteredAssets.length === 0 ? (
                 <div className="text-center text-gray-500 py-24">
                    <p>No assets found for "{searchTerm}".</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssets.map(asset => (
                       <AssetCard key={asset.id} asset={asset} onEdit={handleEdit} onDelete={onDeleteAsset} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssetsPage;