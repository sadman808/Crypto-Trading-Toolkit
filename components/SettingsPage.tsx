import React, { useState, useEffect } from 'react';
import { AppSettings, Currency } from '../types';
import { SettingsIcon, SunIcon, MoonIcon, KeyIcon, CheckCircleIcon, XCircleIcon, PlusIcon, TrashIcon, HeartIcon } from '../constants';
import { testApiKey } from '../services/geminiService';
import Spinner from './Spinner';


interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearData: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdateSettings, onClearData }) => {
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey || '');
  const [keyStatus, setKeyStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>(settings.apiKey ? 'testing' : 'idle');
  const [isSaving, setIsSaving] = useState(false);
  const [newRule, setNewRule] = useState('');
  const [newLossRule, setNewLossRule] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newAffirmation, setNewAffirmation] = useState('');

  // This effect handles both initial validation and debounced user input validation.
  useEffect(() => {
    if (apiKeyInput.trim() === '') {
        setKeyStatus('idle');
        return;
    }
    setKeyStatus('testing');
    const debounceTimer = setTimeout(async () => {
        const isValid = await testApiKey(apiKeyInput);
        setKeyStatus(isValid ? 'valid' : 'invalid');
    }, 600);
    return () => clearTimeout(debounceTimer);
  }, [apiKeyInput]);

  useEffect(() => {
    setApiKeyInput(settings.apiKey || '');
  }, [settings.apiKey]);


  const handleSettingChange = (field: keyof AppSettings, value: any) => {
    onUpdateSettings({ ...settings, [field]: value });
  };
  
  const handleClear = () => {
    if (window.confirm("ARE YOU SURE?\nThis will delete all saved trades and portfolio data permanently. This action cannot be undone.")) {
        onClearData();
    }
  };

  const handleSaveKey = () => {
    if (keyStatus === 'valid') {
        setIsSaving(true);
        onUpdateSettings({ ...settings, apiKey: apiKeyInput });
        setTimeout(() => setIsSaving(false), 2000);
    }
  };
  
  const handleUpdateList = (listName: 'tradingRules' | 'lossRecoveryProtocol' | 'preMarketChecklist' | 'affirmations', action: 'add' | 'remove', value: string | number) => {
      if (listName === 'tradingRules') {
          if (action === 'add' && newRule.trim()) {
              onUpdateSettings({...settings, tradingRules: [...settings.tradingRules, newRule.trim()]});
              setNewRule('');
          } else if (action === 'remove' && typeof value === 'number') {
              onUpdateSettings({...settings, tradingRules: settings.tradingRules.filter((_, i) => i !== value)});
          }
      } else if (listName === 'lossRecoveryProtocol') {
           if (action === 'add' && newLossRule.trim()) {
              onUpdateSettings({...settings, lossRecoveryProtocol: {...settings.lossRecoveryProtocol, rules: [...settings.lossRecoveryProtocol.rules, newLossRule.trim()]}});
              setNewLossRule('');
          } else if (action === 'remove' && typeof value === 'number') {
              onUpdateSettings({...settings, lossRecoveryProtocol: {...settings.lossRecoveryProtocol, rules: settings.lossRecoveryProtocol.rules.filter((_, i) => i !== value)}});
          }
      } else if (listName === 'preMarketChecklist') {
           if (action === 'add' && newChecklistItem.trim()) {
              onUpdateSettings({...settings, routine: {...settings.routine, preMarketChecklist: [...settings.routine.preMarketChecklist, {text: newChecklistItem.trim()}]}});
              setNewChecklistItem('');
          } else if (action === 'remove' && typeof value === 'number') {
               onUpdateSettings({...settings, routine: {...settings.routine, preMarketChecklist: settings.routine.preMarketChecklist.filter((_, i) => i !== value)}});
          }
      } else if (listName === 'affirmations') {
            if (action === 'add' && newAffirmation.trim()) {
              onUpdateSettings({...settings, routine: {...settings.routine, affirmations: [...settings.routine.affirmations, newAffirmation.trim()]}});
              setNewAffirmation('');
          } else if (action === 'remove' && typeof value === 'number') {
               onUpdateSettings({...settings, routine: {...settings.routine, affirmations: settings.routine.affirmations.filter((_, i) => i !== value)}});
          }
      }
  };

  const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2";
  const inputStyles = "w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
  const customSelectWrapper = "relative";
  const customSelect = `${inputStyles} appearance-none pr-8`;

  const KeyStatusMessage = () => {
      if (apiKeyInput.trim() === '') return null;
      switch (keyStatus) {
          case 'testing':
              return <p className="text-xs text-yellow-500 mt-2">Testing key...</p>;
          case 'invalid':
              return <p className="text-xs text-red-500 mt-2">API Key is invalid. Please check the key and try again.</p>;
          case 'valid':
              return <p className="text-xs text-green-500 mt-2">API Key is valid.</p>;
          default:
              return null;
      }
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

        {/* Psychology & Discipline Section */}
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2"><HeartIcon className="h-5 w-5" /> Psychology & Discipline</h3>
            <div className="space-y-6">
                {/* Trading Rules */}
                <div>
                    <label className={labelStyles}>Trading Rules Checklist</label>
                    <p className="text-xs text-gray-500 mb-2">These rules will appear for confirmation before you save a trade.</p>
                    <div className="space-y-2">
                        {settings.tradingRules.map((rule, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <p className="flex-grow bg-white dark:bg-gray-800 p-2 rounded-md text-sm">{rule}</p>
                                <button onClick={() => handleUpdateList('tradingRules', 'remove', i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                        ))}
                    </div>
                     <div className="flex items-center gap-2 mt-2">
                        <input value={newRule} onChange={e => setNewRule(e.target.value)} placeholder="e.g., 'Wait for candle close'" className={`${inputStyles} text-sm`} />
                        <button onClick={() => handleUpdateList('tradingRules', 'add', newRule)} className="p-2 bg-brand-blue text-white rounded-md"><PlusIcon className="h-5 w-5"/></button>
                    </div>
                </div>

                {/* Loss Recovery Protocol */}
                <div>
                    <label className={labelStyles}>Loss Recovery Protocol</label>
                     <p className="text-xs text-gray-500 mb-2">This protocol will be shown after a set number of consecutive losses.</p>
                     <div className="flex items-center gap-4 mb-2">
                        <label className="text-sm">Trigger after</label>
                        <input type="number" value={settings.lossRecoveryProtocol.consecutiveLosses} onChange={e => onUpdateSettings({...settings, lossRecoveryProtocol: {...settings.lossRecoveryProtocol, consecutiveLosses: parseInt(e.target.value, 10) || 1}})} className={`${inputStyles} w-20 text-center`} />
                        <label className="text-sm">consecutive losses.</label>
                     </div>
                     <div className="space-y-2">
                        {settings.lossRecoveryProtocol.rules.map((rule, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <p className="flex-grow bg-white dark:bg-gray-800 p-2 rounded-md text-sm">{rule}</p>
                                <button onClick={() => handleUpdateList('lossRecoveryProtocol', 'remove', i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                        ))}
                    </div>
                     <div className="flex items-center gap-2 mt-2">
                        <input value={newLossRule} onChange={e => setNewLossRule(e.target.value)} placeholder="e.g., 'Stop trading for 24 hours'" className={`${inputStyles} text-sm`} />
                        <button onClick={() => handleUpdateList('lossRecoveryProtocol', 'add', newLossRule)} className="p-2 bg-brand-blue text-white rounded-md"><PlusIcon className="h-5 w-5"/></button>
                    </div>
                </div>

                {/* Trading Routine */}
                <div>
                     <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Trading Routine Planner</h4>
                     {/* Pre-market checklist */}
                     <div>
                        <label className={labelStyles}>Pre-Market Checklist</label>
                         <div className="space-y-2">
                            {settings.routine.preMarketChecklist.map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <p className="flex-grow bg-white dark:bg-gray-800 p-2 rounded-md text-sm">{item.text}</p>
                                    <button onClick={() => handleUpdateList('preMarketChecklist', 'remove', i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                         <div className="flex items-center gap-2 mt-2">
                            <input value={newChecklistItem} onChange={e => setNewChecklistItem(e.target.value)} placeholder="e.g., 'Check economic calendar'" className={`${inputStyles} text-sm`} />
                            <button onClick={() => handleUpdateList('preMarketChecklist', 'add', newChecklistItem)} className="p-2 bg-brand-blue text-white rounded-md"><PlusIcon className="h-5 w-5"/></button>
                        </div>
                     </div>
                      {/* Affirmations */}
                     <div className="mt-4">
                        <label className={labelStyles}>Affirmations</label>
                         <div className="space-y-2">
                            {settings.routine.affirmations.map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <p className="flex-grow bg-white dark:bg-gray-800 p-2 rounded-md text-sm italic">"{item}"</p>
                                    <button onClick={() => handleUpdateList('affirmations', 'remove', i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                         <div className="flex items-center gap-2 mt-2">
                            <input value={newAffirmation} onChange={e => setNewAffirmation(e.target.value)} placeholder="e.g., 'I execute my plan flawlessly'" className={`${inputStyles} text-sm`} />
                            <button onClick={() => handleUpdateList('affirmations', 'add', newAffirmation)} className="p-2 bg-brand-blue text-white rounded-md"><PlusIcon className="h-5 w-5"/></button>
                        </div>
                     </div>
                      {/* Stop Time */}
                      <div className="mt-4">
                         <label htmlFor="stopTime" className={labelStyles}>Stop Trading Time</label>
                         <input type="time" id="stopTime" value={settings.routine.stopTime} onChange={e => onUpdateSettings({...settings, routine: {...settings.routine, stopTime: e.target.value }})} className={`${inputStyles} max-w-xs`} />
                      </div>
                </div>
            </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2"><KeyIcon className="h-5 w-5" /> API Key Management</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Your Gemini API key is required for AI features. It is stored securely in your browser's local storage and never sent to our servers.
              You can get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Google AI Studio</a>.
            </p>
            <label htmlFor="apiKey" className={labelStyles}>Gemini API Key</label>
            <div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full">
                        <input
                            id="apiKey"
                            type="password"
                            value={apiKeyInput}
                            onChange={e => setApiKeyInput(e.target.value)}
                            className={`${inputStyles} pr-10`}
                            placeholder="Enter your API key"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            {keyStatus === 'testing' && <Spinner />}
                            {keyStatus === 'valid' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                            {keyStatus === 'invalid' && apiKeyInput.trim() !== '' && <XCircleIcon className="h-5 w-5 text-red-500" />}
                        </div>
                    </div>
                    <button
                        onClick={handleSaveKey}
                        disabled={keyStatus !== 'valid' || isSaving}
                        className="bg-brand-blue text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center disabled:bg-gray-500/80 dark:disabled:bg-gray-600 disabled:cursor-not-allowed w-32"
                    >
                        {isSaving ? 'Saved!' : 'Save Key'}
                    </button>
                </div>
                <KeyStatusMessage />
            </div>
        </div>

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