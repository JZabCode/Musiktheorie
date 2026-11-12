import React from 'react';
import { Trophy } from 'lucide-react';

interface QuizResultsProps {
    correctCount: number;
    incorrectCount: number;
    gameDuration: number;
    onBack: () => void;
    onRestart: () => void;
    /** Tailwind accent color name for the button and quote tile. Default: 'indigo' */
    accentColor?: 'indigo' | 'blue' | 'rose' | 'amber' | 'teal';
    /** Subtitle override. Default: "Ergebnis nach X Minute(n)" */
    subtitle?: string;
    /** Module-specific results list rendered between stats grid and buttons */
    children?: React.ReactNode;
}

/** Pre-built color classes to avoid Tailwind JIT purging dynamic class names */
const COLOR_CLASSES = {
    indigo: {
        quoteBg: 'bg-indigo-50',
        quoteBorder: 'border-indigo-100',
        quoteValue: 'text-indigo-600',
        quoteLabel: 'text-indigo-500',
        button: 'bg-indigo-600 hover:bg-indigo-700',
    },
    blue: {
        quoteBg: 'bg-blue-50',
        quoteBorder: 'border-blue-100',
        quoteValue: 'text-blue-600',
        quoteLabel: 'text-blue-500',
        button: 'bg-blue-600 hover:bg-blue-700',
    },
    rose: {
        quoteBg: 'bg-rose-50',
        quoteBorder: 'border-rose-100',
        quoteValue: 'text-rose-600',
        quoteLabel: 'text-rose-500',
        button: 'bg-rose-600 hover:bg-rose-700',
    },
    amber: {
        quoteBg: 'bg-amber-50',
        quoteBorder: 'border-amber-100',
        quoteValue: 'text-amber-600',
        quoteLabel: 'text-amber-500',
        button: 'bg-amber-600 hover:bg-amber-700',
    },
    teal: {
        quoteBg: 'bg-teal-50',
        quoteBorder: 'border-teal-100',
        quoteValue: 'text-teal-600',
        quoteLabel: 'text-teal-500',
        button: 'bg-teal-600 hover:bg-teal-700',
    },
};

/**
 * Shared quiz results screen. Displays stats grid (correct/incorrect/percentage),
 * action buttons, and a slot for the module-specific results list.
 */
const QuizResults: React.FC<QuizResultsProps> = ({
    correctCount,
    incorrectCount,
    gameDuration,
    onBack,
    onRestart,
    accentColor = 'indigo',
    subtitle,
    children,
}) => {
    const total = correctCount + incorrectCount;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const colors = COLOR_CLASSES[accentColor];

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4 pb-12">
            <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                <Trophy size={40} className="mx-auto text-amber-500 mb-2 drop-shadow-md" />
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Zeit abgelaufen</h2>
                <p className="text-sm text-slate-400 mb-4">
                    {subtitle || `Ergebnis nach ${gameDuration / 60} Minute(n)`}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                        <div className="text-xl font-extrabold text-emerald-600">{correctCount}</div>
                        <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Richtig</div>
                    </div>
                    <div className="bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
                        <div className="text-xl font-extrabold text-rose-600">{incorrectCount}</div>
                        <div className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Falsch</div>
                    </div>
                    <div className={`${colors.quoteBg} px-3 py-2 rounded-lg border ${colors.quoteBorder}`}>
                        <div className={`text-xl font-extrabold ${colors.quoteValue}`}>{percentage}%</div>
                        <div className={`text-[10px] ${colors.quoteLabel} font-bold uppercase tracking-wider`}>Quote</div>
                    </div>
                </div>

                {children}

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                        Hauptmenü
                    </button>
                    <button
                        onClick={onRestart}
                        className={`px-6 py-3 rounded-xl ${colors.button} text-white font-bold shadow-lg transition-colors`}
                    >
                        Nochmal spielen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizResults;
