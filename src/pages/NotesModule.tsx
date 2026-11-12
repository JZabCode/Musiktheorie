import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotesQuiz from '../components/notes/NotesQuiz';
import NotesPractice from '../components/notes/NotesPractice';
import NotesExplanation from '../components/notes/NotesExplanation';
import { audio } from '../lib/audio';
import { Music, GraduationCap, PlayCircle, BookOpen, ArrowLeft } from 'lucide-react';

type NotesMode = 'start' | 'quiz' | 'practice' | 'explain';

const NotesModule: React.FC = () => {
    const navigate = useNavigate();
    const [currentMode, setCurrentMode] = useState<NotesMode>('start');

    useEffect(() => {
        const unlockAudio = () => {
            audio.init();
            window.removeEventListener('click', unlockAudio);
        };
        window.addEventListener('click', unlockAudio);
        return () => window.removeEventListener('click', unlockAudio);
    }, []);

    if (currentMode === 'quiz') {
        return <NotesQuiz onBack={() => setCurrentMode('start')} />;
    }
    if (currentMode === 'practice') {
        return <NotesPractice onBack={() => setCurrentMode('start')} />;
    }
    if (currentMode === 'explain') {
        return <NotesExplanation onBack={() => setCurrentMode('start')} />;
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
                    <Music size={48} className="text-indigo-500" />
                    <h1 className="text-3xl font-bold text-slate-800 m-0">Notenlesen-Tutor</h1>
                </div>

                <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto">
                    Lerne Noten im Violin- und Bassschlüssel zu lesen. Wähle den Lernmodus.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Quiz Mode */}
                    <button
                        onClick={() => setCurrentMode('quiz')}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <div className="bg-white p-3 rounded-full">
                            <GraduationCap size={32} className="text-indigo-600" />
                        </div>
                        <span className="text-lg font-bold">Quiz Modus</span>
                        <span className="text-sm opacity-90 font-normal">Noten benennen unter Zeitdruck</span>
                    </button>

                    {/* Practice Mode */}
                    <button
                        onClick={() => setCurrentMode('practice')}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border-2 border-indigo-500 text-slate-800 hover:bg-indigo-50 shadow-sm hover:shadow-md transition-all transform hover:scale-105"
                    >
                        <div className="bg-slate-100 p-3 rounded-full">
                            <PlayCircle size={32} className="text-emerald-500" />
                        </div>
                        <span className="text-lg font-bold text-indigo-600">Übungsmodus</span>
                        <span className="text-sm text-slate-500 font-normal">Noten in Ruhe lernen mit Hilfe</span>
                    </button>
                </div>

                {/* Explanation Mode */}
                <div>
                    <button
                        onClick={() => setCurrentMode('explain')}
                        className="flex items-center gap-2 mx-auto px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                        <BookOpen size={20} />
                        <span>Anleitung zum Notenlesen</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotesModule;
