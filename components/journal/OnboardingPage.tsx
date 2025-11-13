import React, { useState } from 'react';
import { JournalOnetime, UserLevel } from '../../types';

interface OnboardingPageProps {
  onSave: (data: Omit<JournalOnetime, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  onComplete: () => void;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onSave, onComplete }) => {
  const [formData, setFormData] = useState<Omit<JournalOnetime, 'id' | 'user_id' | 'created_at'>>({
    why_text: '',
    meaning_text: '',
    time_commitment: '',
    current_level: UserLevel.Beginner,
    strengths: '',
    weaknesses: '',
    motivation: '',
    commitment: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.commitment) {
      alert('You must commit to journaling daily to proceed.');
      return;
    }
    setLoading(true);
    await onSave(formData);
    setLoading(false);
    onComplete();
  };
  
  const inputStyles = "w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
  const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

  return (
    <div className="max-w-2xl mx-auto bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8">
      <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Welcome to Your Trading Journal</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">Let's build your foundation. Answer these questions once to set your baseline.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="why_text" className={labelStyles}>Why do you want to become a trader?</label>
          <textarea id="why_text" name="why_text" value={formData.why_text} onChange={handleChange} rows={3} className={inputStyles} required />
        </div>
        <div>
          <label htmlFor="meaning_text" className={labelStyles}>What does trading mean to you?</label>
          <textarea id="meaning_text" name="meaning_text" value={formData.meaning_text} onChange={handleChange} rows={3} className={inputStyles} required />
        </div>
        <div>
          <label htmlFor="time_commitment" className={labelStyles}>How much time can you commit daily?</label>
          <input id="time_commitment" name="time_commitment" type="text" value={formData.time_commitment} onChange={handleChange} className={inputStyles} placeholder="e.g., 2 hours" required />
        </div>
        <div>
          <label htmlFor="current_level" className={labelStyles}>What is your current level?</label>
          <select id="current_level" name="current_level" value={formData.current_level} onChange={handleChange} className={`${inputStyles} appearance-none`}>
            {Object.values(UserLevel).map(level => <option key={level} value={level}>{level}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="strengths" className={labelStyles}>What are your strengths & weaknesses?</label>
          <textarea id="strengths" name="strengths" value={formData.strengths} onChange={handleChange} rows={3} className={inputStyles} placeholder="Strengths..." />
          <textarea id="weaknesses" name="weaknesses" value={formData.weaknesses} onChange={handleChange} rows={3} className={`${inputStyles} mt-2`} placeholder="Weaknesses..." />
        </div>
        <div>
            <label htmlFor="motivation" className={labelStyles}>What is your biggest motivation? (Quotes, images, etc.)</label>
            <textarea id="motivation" name="motivation" value={formData.motivation} onChange={handleChange} rows={3} className={inputStyles} placeholder="e.g., 'The goal of a successful trader is to make the best trades. Money is secondary.' - Alexander Elder" />
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <label htmlFor="commitment" className="flex items-center gap-3 cursor-pointer">
                <input id="commitment" name="commitment" type="checkbox" checked={formData.commitment} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">I commit to journal daily and follow my rules.</span>
            </label>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-500">
            {loading ? 'Saving...' : 'Begin My Journal'}
        </button>
      </form>
    </div>
  );
};

export default OnboardingPage;
