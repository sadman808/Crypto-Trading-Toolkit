
import React from 'react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-lg w-full shadow-2xl">
        <h2 className="text-2xl font-bold font-display text-white mb-4">Disclaimer</h2>
        <p className="text-gray-400 mb-6">
          This tool is for educational and informational purposes only. It is not financial, investment, or trading advice. All calculations and AI-generated insights are based on the data you provide and should not be considered a recommendation to buy or sell any asset. Cryptocurrency trading is highly volatile and carries significant risk. You are solely responsible for your own trading decisions.
        </p>
        <button onClick={onAccept} className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition-colors">
          I Understand and Accept
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
