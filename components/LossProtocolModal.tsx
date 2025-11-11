import React from 'react';
import { AppSettings } from '../types';

interface LossProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

const LossProtocolModal: React.FC<LossProtocolModalProps> = ({ isOpen, onClose, settings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-yellow-700 rounded-lg p-8 max-w-lg w-full shadow-2xl">
        <div className="text-center">
            <span className="text-5xl" role="img" aria-label="Warning">⚠️</span>
            <h2 className="text-2xl font-bold font-display text-yellow-300 mt-4 mb-2">Loss Streak Detected</h2>
            <p className="text-gray-400 mb-6">
              You've logged {settings.lossRecoveryProtocol.consecutiveLosses} consecutive losses. It's time to take a break and follow your protocol to protect your capital and mindset.
            </p>
        </div>
        
        <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="font-semibold text-white mb-3">Your Loss Recovery Protocol:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
                {settings.lossRecoveryProtocol.rules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                ))}
            </ul>
             {settings.lossRecoveryProtocol.rules.length === 0 && (
                 <p className="text-sm text-gray-500">You have not defined any recovery rules. Consider adding some in the Settings page.</p>
             )}
        </div>
        
        <button onClick={onClose} className="mt-8 w-full bg-yellow-600 text-white font-bold py-3 px-4 rounded-md hover:bg-yellow-700 transition-colors">
          I Understand
        </button>
      </div>
    </div>
  );
};

export default LossProtocolModal;