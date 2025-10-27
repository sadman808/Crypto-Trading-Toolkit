import React, { useState, useEffect } from 'react';
import { AppSettings, Currency } from '../types';
import { SettingsIcon, SunIcon, MoonIcon } from '../constants';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearData: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdateSettings, onClearData }) => {
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  const handleSettingChange = (field: keyof AppSettings, value: any) => {
    const newSettings = { ...currentSettings, [field]: value };
    setCurrentSettings(newSettings);
    onUpdateSettings(newSettings);
  };
  
  const handleClear = () => {
    if (window.confirm("ARE YOU SURE?\nThis will delete all saved trades and portfolio data permanently. This action cannot be undone.")) {
        onClearData();
    }
  };

  const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2";
  const inputStyles = "w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
  const customSelectWrapper = "relative";
  const customSelect = `${inputStyles} appearance-none pr-8`;
  const customSelectIcon = "absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-8 w-8 text-brand-blue" />
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Customize your toolkit experience.</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Appearance</h3>
            <label className={labelStyles}>Theme</label>
            <div className="flex space-x-2 rounded-lg bg-gray-200 dark:bg-gray-800 p-1">
                <button onClick={() => handleSettingChange('theme', 'light')} className={`w-full flex justify-center items-center gap-2 rounded-md py-2 text-sm font-semibold ${currentSettings.theme === 'light' ? 'bg-white text-brand-blue shadow' : 'text-gray-600'}`}>
                    <SunIcon className="h-5 w-5" /> Light
                </button>
                <button onClick={() => handleSettingChange('theme', 'dark')} className={`w-full flex justify-center items-center gap-2 rounded-md py-2 text-sm font-semibold ${currentSettings.theme === 'dark' ? 'bg-gray-900 text-brand-blue shadow' : 'text-gray-400'}`}>
                    <MoonIcon className="h-5 w-5" /> Dark
                </button>
            </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Trading Defaults</h3>
             <div>
                <label htmlFor="baseCurrency" className={labelStyles}>Base Currency</label>
                <div className={customSelectWrapper}>
                    <select id="baseCurrency" value={currentSettings.baseCurrency} onChange={e => handleSettingChange('baseCurrency', e.target.value)} className={customSelect}>
                    {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-4">
                <label htmlFor="defaultRiskPercent" className={labelStyles}>Default Risk ({currentSettings.defaultRiskPercent}%)</label>
                 <input type="range" id="defaultRiskPercent" min="0.1" max="5" step="0.1" value={currentSettings.defaultRiskPercent} onChange={e => handleSettingChange('defaultRiskPercent', parseFloat(e.target.value))} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </div>
        </div>

        <div className="bg-red-500/10 border border-red-700 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2 text-red-800 dark:text-red-300">Danger Zone</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mb-4">These actions cannot be undone. Be certain before proceeding.</p>
            <button onClick={handleClear} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm">Clear All Local Data</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;