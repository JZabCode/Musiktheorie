import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EarTrainingQuiz from '../components/ear-training/EarTrainingQuiz';
import { audio } from '../lib/audio';
import { Ear, Activity, Layers, ArrowLeft } from 'lucide-react';

type EarTrainingMode = 'start' | 'intervals' | 'triads';

const EarTrainingModule: React.FC = () => {
    const navigate = useNavigate();
    const [currentMode, setCurrentMode] = useState<EarTrainingMode>('start');

    useEffect(() => {
        const unlockAudio = () => {
            audio.init();
            window.removeEventListener('click', unlockAudio);
        };
        window.addEventListener('click', unlockAudio);
        return () => window.removeEventListener('click', unlockAudio);
    }, []);

    if (currentMode === 'intervals') {
        return <EarTrainingQuiz mode="intervals" onBack={() => setCurrentMode('start')} />;
    }
    if (currentMode === 'triads') {
        return <EarTrainingQuiz mode="triads" onBack={() => setCurrentMode('start')} />;
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
                    <Ear size={48} className="text-amber-500" />
                    <h1 className="text-3xl font-bold text-slate-800 m-0">Gehörbildung</h1>
                </div>

                <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto">
                    Trainiere dein Gehör. Höre einen Klang und bestimme, was du hörst.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Intervals */}
                    <button
                        onClick={() => setCurrentMode('intervals')}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <div className="bg-white p-3 rounded-full">
                            <Activity size={32} className="text-amber-600" />
                        </div>
                        <span className="text-lg font-bold">Intervalle</span>
                        <span className="text-sm opacity-90 font-normal">Zwei Töne nacheinander hören und benennen</span>
                    </button>

                    {/* Triads */}
                    <button
                        onClick={() => setCurrentMode('triads')}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border-2 border-amber-500 text-slate-800 hover:bg-amber-50 shadow-sm hover:shadow-md transition-all transform hover:scale-105"
                    >
                        <div className="bg-amber-100 p-3 rounded-full">
                            <Layers size={32} className="text-amber-600" />
                        </div>
                        <span className="text-lg font-bold text-amber-700">Dreiklänge</span>
                        <span className="text-sm text-slate-500 font-normal">Akkord hören und den Typ bestimmen</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EarTrainingModule;
