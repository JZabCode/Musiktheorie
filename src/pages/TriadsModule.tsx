import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TriadsQuiz from '../components/triads/TriadsQuiz';
import TriadsPractice from '../components/triads/TriadsPractice';
import TriadsExplanation from '../components/triads/TriadsExplanation';
import TriadsQuizBuild from '../components/triads/TriadsQuizBuild';
import TriadsPracticeBuild from '../components/triads/TriadsPracticeBuild';
import { audio } from '../lib/audio';
import { Layers, GraduationCap, PlayCircle, BookOpen, ArrowLeft, Eye, PenTool } from 'lucide-react';

type TriadsMode = 'start' | 'quiz-select' | 'practice-select' | 'quiz' | 'quiz-build' | 'practice' | 'practice-build' | 'explain';

const TriadsModule: React.FC = () => {
    const navigate = useNavigate();
    const [currentMode, setCurrentMode] = useState<TriadsMode>('start');

    useEffect(() => {
        const unlockAudio = () => {
            audio.init();
            window.removeEventListener('click', unlockAudio);
        };
        window.addEventListener('click', unlockAudio);
        return () => window.removeEventListener('click', unlockAudio);
    }, []);

    // --- Recognize modes (existing) ---
    if (currentMode === 'quiz') {
        return <TriadsQuiz onBack={() => setCurrentMode('start')} />;
    }
    if (currentMode === 'practice') {
        return <TriadsPractice onBack={() => setCurrentMode('start')} />;
    }

    // --- Build modes (new) ---
    if (currentMode === 'quiz-build') {
        return <TriadsQuizBuild onBack={() => setCurrentMode('start')} />;
    }
    if (currentMode === 'practice-build') {
        return <TriadsPracticeBuild onBack={() => setCurrentMode('start')} />;
    }

    // --- Explanation ---
    if (currentMode === 'explain') {
        return <TriadsExplanation onBack={() => setCurrentMode('start')} />;
    }

    // --- Sub-mode selection: Erkennen / Bilden ---
    if (currentMode === 'quiz-select' || currentMode === 'practice-select') {
        const isQuiz = currentMode === 'quiz-select';
        const title = isQuiz ? 'Quiz Modus' : 'Übungsmodus';
        const subtitle = isQuiz
            ? 'Wähle, ob du Dreiklänge erkennen oder bilden möchtest.'
            : 'Wähle, ob du Dreiklänge erkennen oder bilden möchtest.';

        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
                <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                    <div className="flex justify-start mb-6">
                        <button
                            onClick={() => setCurrentMode('start')}
                            className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                        >
                            <ArrowLeft size={16} /> Zurück
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
                    <p className="text-slate-500 mb-10">{subtitle}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Erkennen */}
                        <button
                            onClick={() => setCurrentMode(isQuiz ? 'quiz' : 'practice')}
                            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                            <div className="bg-white p-3 rounded-full">
                                <Eye size={32} className="text-rose-600" />
                            </div>
                            <span className="text-lg font-bold">Erkennen</span>
                            <span className="text-sm opacity-90 font-normal">Notation sehen → Akkord benennen</span>
                        </button>

                        {/* Bilden */}
                        <button
                            onClick={() => setCurrentMode(isQuiz ? 'quiz-build' : 'practice-build')}
                            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border-2 border-rose-500 text-slate-800 hover:bg-rose-50 shadow-sm hover:shadow-md transition-all transform hover:scale-105"
                        >
                            <div className="bg-slate-100 p-3 rounded-full">
                                <PenTool size={32} className="text-rose-500" />
                            </div>
                            <span className="text-lg font-bold text-rose-600">Bilden</span>
                            <span className="text-sm text-slate-500 font-normal">Akkordname sehen → Töne auswählen</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Start Screen ---
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
                    <Layers size={48} className="text-rose-500" />
                    <h1 className="text-3xl font-bold text-slate-800 m-0">Dreiklang-Tutor</h1>
                </div>

                <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto">
                    Lerne die vier Dreiklang-Typen zu erkennen und zu bestimmen. Wähle den Lernmodus.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Quiz Mode */}
                    <button
                        onClick={() => setCurrentMode('quiz-select')}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <div className="bg-white p-3 rounded-full">
                            <GraduationCap size={32} className="text-rose-600" />
                        </div>
                        <span className="text-lg font-bold">Quiz Modus</span>
                        <span className="text-sm opacity-90 font-normal">Dreiklänge erkennen unter Zeitdruck</span>
                    </button>

                    {/* Practice Mode */}
                    <button
                        onClick={() => setCurrentMode('practice-select')}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border-2 border-rose-500 text-slate-800 hover:bg-rose-50 shadow-sm hover:shadow-md transition-all transform hover:scale-105"
                    >
                        <div className="bg-slate-100 p-3 rounded-full">
                            <PlayCircle size={32} className="text-emerald-500" />
                        </div>
                        <span className="text-lg font-bold text-rose-600">Übungsmodus</span>
                        <span className="text-sm text-slate-500 font-normal">Dreiklänge bestimmen mit Hilfe</span>
                    </button>
                </div>

                {/* Explanation Mode */}
                <div>
                    <button
                        onClick={() => setCurrentMode('explain')}
                        className="flex items-center gap-2 mx-auto px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                        <BookOpen size={20} />
                        <span>Anleitung zu Dreiklängen</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TriadsModule;
