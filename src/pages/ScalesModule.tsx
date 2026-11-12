import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScalesQuiz from '../components/scales/ScalesQuiz';
import ScalesPractice from '../components/scales/ScalesPractice';
import ScalesExplanation from '../components/scales/ScalesExplanation';
import { audio } from '../lib/audio';
import { ChartNoAxesColumnIncreasing, GraduationCap, PlayCircle, BookOpen, ArrowLeft } from 'lucide-react';

type ScalesMode = 'start' | 'quiz' | 'practice' | 'explain';

const ScalesModule: React.FC = () => {
    const navigate = useNavigate();
    const [currentMode, setCurrentMode] = useState<ScalesMode>('start');

    useEffect(() => {
        const unlockAudio = () => {
            audio.init();
            window.removeEventListener('click', unlockAudio);
        };
        window.addEventListener('click', unlockAudio);
        return () => window.removeEventListener('click', unlockAudio);
    }, []);

    if (currentMode === 'quiz') {
        return <ScalesQuiz onBack={() => setCurrentMode('start')} />;
    }
    if (currentMode === 'practice') {
        return <ScalesPractice onBack={() => setCurrentMode('start')} />;
    }
    if (currentMode === 'explain') {
        return <ScalesExplanation onBack={() => setCurrentMode('start')} />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
            <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                {/* Back to Home */}
                <div className="flex justify-start mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> Zurück zur Modulauswahl
                    </button>
                </div>

                <div className="flex items-center justify-center gap-3 mb-4">
                    <ChartNoAxesColumnIncreasing size={48} className="text-teal-500" />
                    <h1 className="text-3xl font-bold text-slate-800 m-0">Tonleitern</h1>
                </div>

                <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto">
                    Dur- und Moll-Tonleitern selbst bilden – mit Ganz- und Halbtonschritten. Wähle den Lernmodus.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Quiz Mode */}
                    <button
                        onClick={() => setCurrentMode('quiz')}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <div className="bg-white p-3 rounded-full">
                            <GraduationCap size={32} className="text-teal-600" />
                        </div>
                        <span className="text-lg font-bold">Quiz Modus</span>
                        <span className="text-sm opacity-90 font-normal">Tonleitern bilden unter Zeitdruck</span>
                    </button>

                    {/* Practice Mode */}
                    <button
                        onClick={() => setCurrentMode('practice')}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border-2 border-teal-500 text-slate-800 hover:bg-teal-50 shadow-sm hover:shadow-md transition-all transform hover:scale-105"
                    >
                        <div className="bg-slate-100 p-3 rounded-full">
                            <PlayCircle size={32} className="text-emerald-500" />
                        </div>
                        <span className="text-lg font-bold text-teal-600">Übungsmodus</span>
                        <span className="text-sm text-slate-500 font-normal">Tonleitern in Ruhe bilden mit Hilfe</span>
                    </button>
                </div>

                {/* Explanation Mode */}
                <div>
                    <button
                        onClick={() => setCurrentMode('explain')}
                        className="flex items-center gap-2 mx-auto px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                        <BookOpen size={20} />
                        <span>Anleitung zu Tonleitern</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScalesModule;
