import React from 'react';
import { Timer } from 'lucide-react';

interface QuizSetupProps {
    title: string;
    subtitle: string;
    gameDuration: number;
    onDurationChange: (seconds: number) => void;
    onStart: () => void;
    onBack: () => void;
    /** Tailwind accent color name, e.g. 'indigo', 'blue', 'rose', 'amber'. Default: 'indigo' */
    accentColor?: 'indigo' | 'blue' | 'rose' | 'amber' | 'teal';
    /** Module-specific settings (clef selection, toggles, etc.) rendered above the timer slider */
    children?: React.ReactNode;
}

/** Pre-built color classes to avoid Tailwind JIT purging dynamic class names */
const COLOR_CLASSES = {
    indigo: {
        icon: 'text-indigo-500',
        slider: 'accent-indigo-600',
        button: 'bg-indigo-600 hover:bg-indigo-700',
    },
    blue: {
        icon: 'text-blue-500',
        slider: 'accent-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
    },
    rose: {
        icon: 'text-rose-500',
        slider: 'accent-rose-600',
        button: 'bg-rose-600 hover:bg-rose-700',
    },
    amber: {
        icon: 'text-amber-500',
        slider: 'accent-amber-600',
        button: 'bg-amber-600 hover:bg-amber-700',
    },
    teal: {
        icon: 'text-teal-500',
        slider: 'accent-teal-600',
        button: 'bg-teal-600 hover:bg-teal-700',
    },
};

/**
 * Shared quiz setup screen. Provides the timer slider and start/cancel buttons.
 * Module-specific settings are passed as children.
 */
const QuizSetup: React.FC<QuizSetupProps> = ({
    title,
    subtitle,
    gameDuration,
    onDurationChange,
    onStart,
    onBack,
    accentColor = 'indigo',
    children,
}) => {
    const colors = COLOR_CLASSES[accentColor];

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                <Timer size={48} className={`mx-auto ${colors.icon} mb-4`} />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
                <p className="text-slate-500 mb-6">{subtitle}</p>

                {children}

                {/* Time Limit */}
                <div className="mb-8 px-4">
                    <label className="block text-xl font-bold text-slate-700 mb-4">
                        {gameDuration / 60} Minute(n)
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={gameDuration / 60}
                        onChange={(e) => onDurationChange(parseInt(e.target.value) * 60)}
                        className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${colors.slider}`}
                    />
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                        Abbrechen
                    </button>
                    <button
                        onClick={onStart}
                        className={`px-6 py-3 rounded-xl ${colors.button} text-white font-bold shadow-lg transition-colors`}
                    >
                        Quiz Starten
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizSetup;
