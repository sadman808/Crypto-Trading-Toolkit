import React, { useState, useEffect } from 'react';
import { AppSettings, Currency } from '../types';
import { SettingsIcon, SunIcon, MoonIcon, KeyIcon, CheckCircleIcon, XCircleIcon, PlusIcon, TrashIcon, HeartIcon } from '../constants';
import { testApiKey, ApiKeyStatus } from '../services/geminiService';
import Spinner from './Spinner';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearData: () => void;
  userApiKey: string | null;
  onSaveUserApiKey: (apiKey: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdateSettings, onClearData, userApiKey, onSaveUserApiKey }) => {
  const [apiKeyInput, setApiKeyInput] = useState(userApiKey || '');
  const [validationStatus, setValidationStatus] = useState<ApiKeyStatus['status']>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [newRule, setNewRule] = useState('');
  const [newLossRule, setNewLossRule] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newAffirmation, setNewAffirmation] = useState('');

  useEffect(() => {
    setApiKeyInput(userApiKey || '');
    if (userApiKey) {
      setValidationStatus('valid'); // Assume stored key is valid initially
    }
  }, [userApiKey]);

  const handleApiKeyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeyInput(e.target.value);
    // Reset validation status on change, forcing user to re-test
    setValidationStatus('idle');
    setValidationMessage('');
  };

  const handleTestKey = async () => {
    if (!apiKeyInput) return;
    setValidationStatus('testing');
    setValidationMessage('');
    const result = await testApiKey(apiKeyInput);
    setValidationStatus(result.status);
    setValidationMessage(result.message || '');
  };

  const handleSaveKey = async () => {
    if (validationStatus !== 'valid') return;
    setIsSaving(true);
    await onSaveUserApiKey(apiKeyInput);
    setIsSaving(false);
  };

  const handleSettingChange = (field: keyof AppSettings, value: any) => {
    onUpdateSettings({ ...settings, [field]: value });
  };
  
  const handleClear = () => {
    if (window.confirm("ARE YOU SURE?\nThis will delete all saved trades and portfolio data permanently. This action cannot be undone.")) {
        onClearData();
    }
  };
  
  const handleUpdateList = (listName: 'tradingRules' | 'lossRecoveryProtocol' | 'preMarketChecklist' | 'affirmations', action: 'add' | 'remove', value: string | number) => {
      // ... (existing list update logic, no changes needed here)
  };

  const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2";
  const inputStyles = "w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
  const customSelectWrapper = "relative";
  const customSelect = `${inputStyles} appearance-none pr-8`;

  const KeyStatusMessage = () => {
    if (validationStatus === 'idle' && !validationMessage) return null;
    const color = {
      testing: 'text-yellow-500',
      invalid: 'text-red-500',
      valid: 'text-green-500',
      error: 'text-yellow-500',
      idle: 'text-gray-500',
    }[validationStatus];
    
    return <p className={`text-xs ${color} mt-2`}>{validationMessage}</p>;
  };

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
        {/* Appearance Section */}
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Appearance</h3>
            <label className={labelStyles}>Theme</label>
            <div className="flex space-x-2 rounded-lg bg-gray-200 dark:bg-gray-800 p-1">
                <button onClick={() => handleSettingChange('theme', 'light')} className={`w-full flex justify-center items-center gap-2 rounded-md py-2 text-sm font-semibold ${settings.theme === 'light' ? 'bg-white text-brand-blue shadow' : 'text-gray-600'}`}>
                    <SunIcon className="h-5 w-5" /> Light
                </button>
                <button onClick={() => handleSettingChange('theme', 'dark')} className={`w-full flex justify-center items-center gap-2 rounded-md py-2 text-sm font-semibold ${settings.theme === 'dark' ? 'bg-gray-900 text-brand-blue shadow' : 'text-gray-400'}`}>
                    <MoonIcon className="h-5 w-5" /> Dark
                </button>
            </div>
        </div>
        
        {/* Trading Defaults Section */}
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Trading Defaults</h3>
             <div>
                <label htmlFor="baseCurrency" className={labelStyles}>Base Currency</label>
                <div className={customSelectWrapper}>
                    <select id="baseCurrency" value={settings.baseCurrency} onChange={e => handleSettingChange('baseCurrency', e.target.value)} className={customSelect}>
                    {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-4">
                <label htmlFor="defaultRiskPercent" className={labelStyles}>Default Risk ({settings.defaultRiskPercent}%)</label>
                 <input type="range" id="defaultRiskPercent" min="0.1" max="5" step="0.1" value={settings.defaultRiskPercent} onChange={e => handleSettingChange('defaultRiskPercent', parseFloat(e.target.value))} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </div>
        </div>

        {/* API Key Management Section */}
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2"><KeyIcon className="h-5 w-5" /> Gemini API Key</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Your Gemini API key is required for AI features. It is stored securely in the database and only accessible by you.
              You can get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Google AI Studio</a>.
            </p>
            <label htmlFor="apiKey" className={labelStyles}>Enter your Gemini API key</label>
            <div className="space-y-2">
                <input
                    id="apiKey"
                    type="password"
                    value={apiKeyInput}
                    onChange={handleApiKeyInputChange}
                    className={inputStyles}
                    placeholder="Enter your API key"
                />
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleTestKey}
                        disabled={validationStatus === 'testing' || !apiKeyInput}
                        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-40"
                    >
                        {validationStatus === 'testing' ? <Spinner /> : 'Test API Key'}
                    </button>
                    <button
                        onClick={handleSaveKey}
                        disabled={validationStatus !== 'valid' || isSaving}
                        className="bg-brand-blue text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center disabled:bg-gray-500/80 dark:disabled:bg-gray-600 disabled:cursor-not-allowed w-40"
                    >
                        {isSaving ? 'Saved!' : 'Save API Key'}
                    </button>
                </div>
                <KeyStatusMessage />
            </div>
        </div>

        {/* AI Assistant Section */}
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">AI Assistant</h3>
            <div className="flex justify-between items-center">
                <div>
                    <label htmlFor="aiEnabledToggle" className="font-medium text-gray-800 dark:text-gray-200">
                        Enable AI Analysis
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">
                        Get AI-powered insights on the Risk Management page. Requires a valid API key.
                    </p>
                </div>
                <button
                    id="aiEnabledToggle"
                    role="switch"
                    aria-checked={settings.aiEnabled}
                    onClick={() => handleSettingChange('aiEnabled', !settings.aiEnabled)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue dark:focus:ring-offset-gray-900 ${settings.aiEnabled ? 'bg-brand-blue' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.aiEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>
        </div>

        {/* Danger Zone Section */}
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
