import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IntervalQuiz from '../components/intervals/IntervalQuiz';
import IntervalPractice from '../components/intervals/IntervalPractice';
import IntervalExplanation from '../components/intervals/IntervalExplanation';
import IntervalPracticeBuild from '../components/intervals/IntervalPracticeBuild';
import IntervalQuizBuild from '../components/intervals/IntervalQuizBuild';
import { audio } from '../lib/audio';
import { Activity, GraduationCap, PlayCircle, BookOpen, ArrowLeft, Piano, PenTool } from 'lucide-react';

type IntervalMode = 'start' | 'quiz-recognize' | 'quiz-build' | 'practice-recognize' | 'practice-build' | 'explain';
type Category = 'quiz' | 'practice' | null;

const IntervalModule: React.FC = () => {
    const navigate = useNavigate();
    const [currentMode, setCurrentMode] = useState<IntervalMode>('start');
    const [selectedCategory, setSelectedCategory] = useState<Category>(null);

    // Initialize audio on first interaction
    useEffect(() => {
        const unlockAudio = () => {
            audio.init();
            window.removeEventListener('click', unlockAudio);
        };
        window.addEventListener('click', unlockAudio);
        return () => window.removeEventListener('click', unlockAudio);
    }, []);

    const resetToStart = () => {
        setCurrentMode('start');
        setSelectedCategory(null);
    };

    if (currentMode === 'quiz-recognize') {
        return <IntervalQuiz onBack={resetToStart} />;
    }
    if (currentMode === 'quiz-build') {
        return <IntervalQuizBuild onBack={resetToStart} />;
    }
    if (currentMode === 'practice-recognize') {
        return <IntervalPractice onBack={resetToStart} />;
    }
    if (currentMode === 'practice-build') {
        return <IntervalPracticeBuild onBack={resetToStart} />;
    }
    if (currentMode === 'explain') {
        return <IntervalExplanation onBack={resetToStart} />;
    }

    // Intermediate Category Selection Screen
    if (selectedCategory) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
                <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                    <div className="flex justify-start mb-6">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                        >
                            <ArrowLeft size={16} /> Zurück zur Auswahl
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-4">
                        {selectedCategory === 'quiz' ? (
                            <GraduationCap size={48} className="text-indigo-500" />
                        ) : (
                            <PlayCircle size={48} className="text-emerald-500" />
                        )}
                        <h1 className="text-3xl font-bold text-slate-800 m-0">
                            {selectedCategory === 'quiz' ? 'Quiz Modus' : 'Übungsmodus'}
                        </h1>
                    </div>

                    <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto">
                        Möchtest du Intervalle anhand der Klaviatur erkennen oder im Notenbild selbst bilden?
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Recognize Mode (Piano) */}
                        <button
                            onClick={() => setCurrentMode(selectedCategory === 'quiz' ? 'quiz-recognize' : 'practice-recognize')}
                            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border-2 border-indigo-500 text-slate-800 hover:bg-indigo-50 shadow-sm hover:shadow-md transition-all transform hover:scale-105"
                        >
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <Piano size={32} className="text-indigo-600" />
                            </div>
                            <span className="text-lg font-bold text-indigo-700">Klaviatur erkennen</span>
                            <span className="text-sm text-slate-500 font-normal">Finde den Ton auf den Tasten</span>
                        </button>

                        {/* Build Mode (Notation) */}
                        <button
                            onClick={() => setCurrentMode(selectedCategory === 'quiz' ? 'quiz-build' : 'practice-build')}
                            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border-2 border-emerald-500 text-slate-800 hover:bg-emerald-50 shadow-sm hover:shadow-md transition-all transform hover:scale-105"
                        >
                            <div className="bg-emerald-100 p-3 rounded-full">
                                <PenTool size={32} className="text-emerald-600" />
                            </div>
                            <span className="text-lg font-bold text-emerald-700">Notenbild bilden</span>
                            <span className="text-sm text-slate-500 font-normal">Zielton im Notensystem wählen</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Start screen
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
                    <Activity size={48} className="text-emerald-500" />
                    <h1 className="text-3xl font-bold text-slate-800 m-0">Intervall-Tutor</h1>
                </div>

                <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto">
                    Diese App hilft dir beim Lernen der Intervallbestimmung. Wähle den Lernmodus.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Quiz Mode */}
                    <button
                        onClick={() => setSelectedCategory('quiz')}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <div className="bg-white p-3 rounded-full">
                            <GraduationCap size={32} className="text-indigo-600" />
                        </div>
                        <span className="text-lg font-bold">Quiz Modus</span>
                        <span className="text-sm opacity-90 font-normal">Intervalle erkennen und benennen</span>
                    </button>

                    {/* Practice Mode */}
                    <button
                        onClick={() => setSelectedCategory('practice')}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border-2 border-indigo-500 text-slate-800 hover:bg-indigo-50 shadow-sm hover:shadow-md transition-all transform hover:scale-105"
                    >
                        <div className="bg-slate-100 p-3 rounded-full">
                            <PlayCircle size={32} className="text-emerald-500" />
                        </div>
                        <span className="text-lg font-bold text-indigo-600">Übungsmodus</span>
                        <span className="text-sm text-slate-500 font-normal">Intervalle auf der Tastatur finden</span>
                    </button>
                </div>

                {/* Explanation Mode */}
                <div>
                    <button
                        onClick={() => setCurrentMode('explain')}
                        className="flex items-center gap-2 mx-auto px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                        <BookOpen size={20} />
                        <span>Anleitung zur Intervallbestimmung</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntervalModule;
