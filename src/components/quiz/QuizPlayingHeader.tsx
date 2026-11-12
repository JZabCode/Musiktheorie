import React from 'react';
import { Timer, Check, X, XCircle } from 'lucide-react';
import { formatTime } from '../../lib/utils';

interface QuizPlayingHeaderProps {
    timeLeft: number;
    correctCount: number;
    incorrectCount: number;
    onCancel: () => void;
}

/**
 * Shared header bar shown during quiz gameplay.
 * Displays timer, correct/incorrect counts, and a cancel button.
 */
const QuizPlayingHeader: React.FC<QuizPlayingHeaderProps> = ({
    timeLeft,
    correctCount,
    incorrectCount,
    onCancel,
}) => (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <button
            onClick={onCancel}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
            <XCircle size={20} /> Abbrechen
        </button>
        <div className="flex gap-6">
            <div className={`flex items-center gap-2 font-bold text-lg ${timeLeft < 10 ? 'text-rose-500' : 'text-slate-700'}`}>
                <Timer size={20} /> {formatTime(timeLeft)}
            </div>
            <div className="flex items-center gap-2 font-bold text-lg text-emerald-500">
                <Check size={20} /> {correctCount}
            </div>
            <div className="flex items-center gap-2 font-bold text-lg text-rose-400">
                <X size={20} /> {incorrectCount}
            </div>
        </div>
    </div>
);

export default QuizPlayingHeader;
