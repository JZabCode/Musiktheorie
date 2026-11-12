import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CircleOfFifthsExplanation from '../components/circle-of-fifths/CircleOfFifthsExplanation';
import { audio } from '../lib/audio';
import { Compass, BookOpen, GraduationCap, ArrowLeft } from 'lucide-react';

type CircleOfFifthsMode = 'start' | 'explain';

const CircleOfFifthsModule: React.FC = () => {
    const navigate = useNavigate();
    const [currentMode, setCurrentMode] = useState<CircleOfFifthsMode>('start');

    useEffect(() => {
        const unlockAudio = () => {
            audio.init();
            window.removeEventListener('click', unlockAudio);
        };
        window.addEventListener('click', unlockAudio);
        return () => window.removeEventListener('click', unlockAudio);
    }, []);

    if (currentMode === 'explain') {
        return <CircleOfFifthsExplanation onBack={() => setCurrentMode('start')} />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
            <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                <div className="flex justify-start mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> Zurück zur Modulauswahl
                    </button>
                </div>

                <div className="flex items-center justify-center gap-3 mb-4">
                    <Compass size={48} className="text-violet-500" />
                    <h1 className="text-3xl font-bold text-slate-800 m-0">Quintenzirkel</h1>
                </div>

                <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto">
                    Aufbau, Tonartverwandtschaften, Vorzeichen und leitereigene Dreiklänge.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => setCurrentMode('explain')}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <div className="bg-white p-3 rounded-full">
                            <BookOpen size={32} className="text-violet-600" />
                        </div>
                        <span className="text-lg font-bold">Erklärungen</span>
                        <span className="text-sm opacity-90 font-normal">Aufbau, Funktion, Nutzen und interaktiver Zirkel</span>
                    </button>

                    <button
                        disabled
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border-2 border-slate-200 text-slate-400 cursor-not-allowed"
                    >
                        <div className="bg-slate-100 p-3 rounded-full">
                            <GraduationCap size={32} className="text-slate-400" />
                        </div>
                        <span className="text-lg font-bold">Übungen</span>
                        <span className="text-sm font-normal">in Vorbereitung</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CircleOfFifthsModule;
