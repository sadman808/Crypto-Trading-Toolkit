import React, { useState } from 'react';
import { PlaybookPlay } from '../types';
import { ClipboardDocumentListIcon, PlusIcon, PencilIcon, TrashIcon } from '../constants';

// --- Modal Component ---
interface PlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (play: Omit<PlaybookPlay, 'id' | 'created_at' | 'user_id'> | PlaybookPlay) => void;
  playToEdit: PlaybookPlay | null;
}

const PlayModal: React.FC<PlayModalProps> = ({ isOpen, onClose, onSave, playToEdit }) => {
    const [play, setPlay] = useState({
        name: playToEdit?.name || '',
        description: playToEdit?.description || '',
        category: playToEdit?.category || '',
        tags: playToEdit?.tags || [],
    });
    const [tagInput, setTagInput] = useState('');

    if (!isOpen) return null;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPlay({ ...play, [e.target.name]: e.target.value });
    };

    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!play.tags.includes(tagInput.trim().toLowerCase())) {
                setPlay(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim().toLowerCase()] }));
            }
            setTagInput('');
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        setPlay(prev => ({...prev, tags: prev.tags.filter(t => t !== tagToRemove)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(playToEdit ? { ...playToEdit, ...play } : play);
        onClose();
    };

    const inputStyles = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
    const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">{playToEdit ? 'Edit Play' : 'Add New Play'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className={labelStyles}>Play Name</label>
                        <input type="text" name="name" value={play.name} onChange={handleChange} className={inputStyles} required placeholder="e.g., Bull Flag Breakout" />
                    </div>
                    <div>
                        <label htmlFor="category" className={labelStyles}>Category</label>
                        <input type="text" name="category" value={play.category} onChange={handleChange} className={inputStyles} placeholder="e.g., Continuation Pattern" />
                    </div>
                    <div>
                        <label htmlFor="description" className={labelStyles}>Description / Rules</label>
                        <textarea name="description" value={play.description} onChange={handleChange} rows={4} className={inputStyles} placeholder="Describe the entry criteria, invalidation points, and management rules for this setup." />
                    </div>
                    <div>
                        <label className={labelStyles}>Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {play.tags.map(tag => (
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
                        <button type="submit" className="bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">Save Play</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Page Component ---
interface PlaybookPageProps {
  plays: PlaybookPlay[];
  onAddPlay: (play: Omit<PlaybookPlay, 'id' | 'created_at' | 'user_id'>) => Promise<PlaybookPlay | null>;
  onUpdatePlay: (play: PlaybookPlay) => void;
  onDeletePlay: (id: string) => void;
}

const PlaybookPage: React.FC<PlaybookPageProps> = ({ plays, onAddPlay, onUpdatePlay, onDeletePlay }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [playToEdit, setPlayToEdit] = useState<PlaybookPlay | null>(null);

    const handleEdit = (play: PlaybookPlay) => {
        setPlayToEdit(play);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setPlayToEdit(null);
        setIsModalOpen(true);
    };
    
    return (
        <div className="max-w-7xl mx-auto">
            <PlayModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={playToEdit ? onUpdatePlay : onAddPlay}
                playToEdit={playToEdit}
            />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-brand-blue" />
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Trading Playbook</h1>
                        <p className="text-md text-gray-500 dark:text-gray-400 mt-1">Your library of documented trading setups.</p>
                    </div>
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm">
                    <PlusIcon className="h-4 w-4" /> Add New Play
                </button>
            </div>
            
            {plays.length === 0 ? (
                 <div className="text-center text-gray-500 py-24 bg-gray-100 dark:bg-gray-900/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <p className="text-lg">Your playbook is empty.</p>
                    <p className="text-sm">Click 'Add New Play' to document your first trading setup.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plays.map(play => (
                        <div key={play.id} className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-brand-blue font-semibold uppercase">{play.category || 'Uncategorized'}</p>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{play.name}</h3>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(play)} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"><PencilIcon className="h-4 w-4" /></button>
                                        <button onClick={() => onDeletePlay(play.id)} className="p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 rounded-md"><TrashIcon className="h-4 w-4" /></button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">{play.description}</p>
                            </div>
                            <div className="mt-4">
                                <div className="flex flex-wrap gap-2">
                                    {play.tags.map(tag => <span key={tag} className="text-xs bg-blue-500/10 text-brand-blue font-semibold px-2 py-1 rounded-full">{tag}</span>)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlaybookPage;
