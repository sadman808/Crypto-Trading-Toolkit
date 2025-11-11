import React, { useState } from 'react';
import { BacktestStrategy } from '../types';
import BacktestManager from './BacktestManager';
import BacktestSheet from './BacktestSheet';

interface BacktestPageProps {
  strategies: BacktestStrategy[];
  onAddStrategy: (strategy: Omit<BacktestStrategy, 'id' | 'created_at' | 'user_id'>) => Promise<BacktestStrategy | null>;
  onUpdateStrategy: (strategy: BacktestStrategy) => void;
  onDeleteStrategy: (id: string) => void;
}

const BacktestPage: React.FC<BacktestPageProps> = ({ strategies, onAddStrategy, onUpdateStrategy, onDeleteStrategy }) => {
    const [activeStrategy, setActiveStrategy] = useState<BacktestStrategy | null>(null);

    const handleSelectStrategy = (strategy: BacktestStrategy) => {
        setActiveStrategy(strategy);
    };

    const handleBack = () => {
        setActiveStrategy(null);
    };
    
    const handleUpdateAndGoBack = (strategy: BacktestStrategy) => {
        onUpdateStrategy(strategy);
        // Optimistically update the local state for a smoother UX
        const updatedStrategies = strategies.map(s => s.id === strategy.id ? strategy : s);
        // Find the specific strategy object from the updated list to set as active
        const updatedActiveStrategy = updatedStrategies.find(s => s.id === strategy.id) || null;
        setActiveStrategy(updatedActiveStrategy);
    };

    if (activeStrategy) {
        return (
            <BacktestSheet
                strategy={activeStrategy}
                onBack={handleBack}
                onSave={handleUpdateAndGoBack}
                onDelete={onDeleteStrategy}
            />
        );
    }

    return (
        <BacktestManager
            strategies={strategies}
            onSelectStrategy={handleSelectStrategy}
            onAddStrategy={onAddStrategy}
            onDeleteStrategy={onDeleteStrategy}
        />
    );
};

export default BacktestPage;
