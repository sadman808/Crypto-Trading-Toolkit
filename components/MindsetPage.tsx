import React, { useState, useEffect } from 'react';
import { AppSettings, DailyReflection } from '../types';
import { HeartIcon, PlusIcon, SaveIcon } from '../constants';

// --- Trading Routine Component ---
const TradingRoutine: React.FC<{ settings: AppSettings }> = ({ settings }) => {
    const [checklist, setChecklist] = useState(
        settings.routine.preMarketChecklist.map(item => ({ ...item, isDone: false }))
    );
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        const calculateTimeRemaining = () => {
            if (!settings.routine.stopTime) return;
            
            const now = new Date();
            const [hours, minutes] = settings.routine.stopTime.split(':');
            const stopTime = new Date();
            stopTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            if (now > stopTime) {
                setTimeRemaining('Trading session has ended.');
                return;
            }

            const diff = stopTime.getTime() - now.getTime();
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeRemaining(`${h}h ${m}m ${s}s remaining in session.`);
        };
        
        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);
        return () => clearInterval(interval);

    }, [settings.routine.stopTime]);

    const handleCheck = (index: number) => {
        const newChecklist = [...checklist];
        newChecklist[index].isDone = !newChecklist[index].isDone;
        setChecklist(newChecklist);
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Daily Trading Routine</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pre-Market Checklist */}
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Pre-Market Checklist</h4>
                    <div className="space-y-2">
                         {checklist.map((item, index) => (
                             <label key={index} className="flex items-center gap-2 cursor-pointer text-sm">
                                <input type="checkbox" checked={item.isDone} onChange={() => handleCheck(index)} className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
                                <span className={item.isDone ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}>{item.text}</span>
                             </label>
                         ))}
                         {checklist.length === 0 && <p className="text-xs text-gray-500">No checklist items defined in Settings.</p>}
                    </div>
                </div>
                {/* Affirmations & Timer */}
                <div className="space-y-4">
                     <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Affirmations</h4>
                        <div className="space-y-1">
                             {settings.routine.affirmations.map((aff, i) => (
                                 <p key={i} className="text-sm italic text-gray-600 dark:text-gray-400">"{aff}"</p>
                             ))}
                             {settings.routine.affirmations.length === 0 && <p className="text-xs text-gray-500">No affirmations defined in Settings.</p>}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Session Timer</h4>
                        <p className="text-sm font-semibold text-brand-blue">{timeRemaining}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Daily Reflection Component ---
const DailyReflectionJournal: React.FC<{
    reflections: DailyReflection[];
    onSave: (reflection: Omit<DailyReflection, 'id' | 'user_id'>) => void;
}> = ({ reflections, onSave }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const hasReflectedToday = reflections.some(r => r.date === todayStr);

    const [isWriting, setIsWriting] = useState(false);
    const [newReflection, setNewReflection] = useState({
        date: todayStr,
        followedPlan: '',
        emotionalState: '',
        lessonsLearned: '',
    });

    const handleSave = () => {
        onSave(newReflection);
        setIsWriting(false);
    };

    if (isWriting) {
        return (
             <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4">
                 <h3 className="font-bold text-lg text-gray-900 dark:text-white">Reflection for {new Date(todayStr + 'T00:00:00').toDateString()}</h3>
                 <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Did I follow my trading plan today? Why or why not?</label>
                    <textarea value={newReflection.followedPlan} onChange={e => setNewReflection({...newReflection, followedPlan: e.target.value})} rows={3} className="mt-1 w-full text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2" />
                 </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">How was my emotional state? Did I trade impulsively?</label>
                    <textarea value={newReflection.emotionalState} onChange={e => setNewReflection({...newReflection, emotionalState: e.target.value})} rows={3} className="mt-1 w-full text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2" />
                 </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">What is the #1 lesson I learned today?</label>
                    <textarea value={newReflection.lessonsLearned} onChange={e => setNewReflection({...newReflection, lessonsLearned: e.target.value})} rows={2} className="mt-1 w-full text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2" />
                 </div>
                 <div className="flex justify-end gap-2">
                    <button onClick={() => setIsWriting(false)} className="text-sm font-semibold py-2 px-4 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
                    <button onClick={handleSave} className="text-sm font-semibold py-2 px-4 rounded-md bg-brand-blue text-white hover:bg-blue-600 flex items-center gap-2"><SaveIcon className="h-4 w-4" /> Save Reflection</button>
                 </div>
             </div>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Daily Reflection Journal</h3>
                {!hasReflectedToday && (
                    <button onClick={() => setIsWriting(true)} className="text-sm font-semibold py-2 px-4 rounded-md bg-blue-500/10 text-brand-blue hover:bg-blue-500/20 flex items-center gap-2">
                        <PlusIcon className="h-4 w-4" /> Add Today's Reflection
                    </button>
                )}
            </div>
             <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {reflections.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(r => (
                     <div key={r.id} className="p-3 bg-white dark:bg-gray-800/50 rounded-md">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{new Date(r.date + 'T00:00:00').toDateString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Lesson: {r.lessonsLearned}</p>
                    </div>
                ))}
                {reflections.length === 0 && <p className="text-sm text-center text-gray-500 py-8">No reflections yet.</p>}
            </div>
        </div>
    );
};


interface MindsetPageProps {
  settings: AppSettings;
  reflections: DailyReflection[];
  onSaveReflection: (reflection: Omit<DailyReflection, 'id' | 'user_id'>) => void;
}

const MindsetPage: React.FC<MindsetPageProps> = ({ settings, reflections, onSaveReflection }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <HeartIcon className="h-8 w-8 text-brand-blue" />
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Mindset & Psychology</h1>
          <p className="text-md text-gray-500 dark:text-gray-400 mt-1">Tools to build discipline, manage emotions, and improve performance.</p>
        </div>
      </div>

      <div className="space-y-6">
        <TradingRoutine settings={settings} />
        <DailyReflectionJournal reflections={reflections} onSave={onSaveReflection} />
      </div>
    </div>
  );
};

export default MindsetPage;