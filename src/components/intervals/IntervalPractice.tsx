import React, { useState, useEffect, useCallback } from 'react';
import IntervalPiano from './IntervalPiano';
import { getRandomInterval, INTERVAL_NOTES } from '../../lib/music';
import type { PracticeChallenge } from '../../lib/music';
import { audio } from '../../lib/audio';
import { ArrowLeft, ArrowRight, RefreshCcw } from 'lucide-react';
import { midiToNote } from '../../lib/utils';

interface IntervalPracticeProps {
    onBack: () => void;
}

interface PracticeTarget {
    root: number;
    interval: PracticeChallenge;
}

const IntervalPractice: React.FC<IntervalPracticeProps> = ({ onBack }) => {
    const [target, setTarget] = useState<PracticeTarget | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [clickedKey, setClickedKey] = useState<number | null>(null);

    const nextChallenge = useCallback(() => {
        const interval = getRandomInterval('practice');
        const maxRoot = 12 - interval.semitones;
        const rootIndex = Math.floor(Math.random() * (maxRoot + 1));

        setTarget({ root: rootIndex, interval });
        setFeedback(null);
        setClickedKey(null);
    }, []);

    useEffect(() => {
        audio.init();
        nextChallenge();
    }, [nextChallenge]);



    const handleKeyClick = (keyIndex: number) => {
        if (!target || feedback === 'correct') return;
        if (keyIndex === target.root) return; // Can't click root

        setClickedKey(keyIndex);

        const actualInterval = keyIndex - target.root;

        // Play the clicked note
        const noteStr = midiToNote(60 + keyIndex);
        audio.playNote(noteStr);

        if (actualInterval === target.interval.semitones) {
            setFeedback('correct');
            audio.playFeedback(true);
        } else {
            setFeedback('incorrect');
        }
    };

    if (!target) return <div className="text-center p-10">Laden...</div>;

    const rootNoteName = INTERVAL_NOTES[target.root % 12];

    return (
        <div className="flex flex-col items-center px-4 py-6">
            <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <ArrowLeft size={20} /> Zurück
                    </button>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">Übungsmodus</h2>

                <div className="text-lg my-6 leading-relaxed">
                    Finde die{' '}
                    <span className="text-indigo-600 font-bold">{target.interval.name}</span>{' '}
                    über{' '}
                    <span className="font-bold bg-slate-100 px-2 py-0.5 rounded ml-1">{rootNoteName}</span>
                </div>

                {/* Piano */}
                <IntervalPiano
                    activeKeys={[target.root]}
                    correctKeys={feedback === 'correct' ? [target.root, clickedKey!] : []}
                    incorrectKeys={feedback === 'incorrect' ? [clickedKey!] : []}
                    onKeyClick={handleKeyClick}
                />

                {/* Feedback Area */}
                <div className="min-h-[80px] mt-6 flex justify-center">
                    {feedback === 'correct' && (
                        <button
                            onClick={nextChallenge}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-colors"
                        >
                            Nächste Aufgabe <ArrowRight size={20} />
                        </button>
                    )}
                    {feedback === 'incorrect' && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col items-center gap-2 text-center max-w-md">
                            <div className="text-rose-600 font-bold flex items-center gap-2">
                                <RefreshCcw size={20} /> Versuch es nochmal!
                            </div>
                            <div className="text-slate-600">
                                Tipp: {target.interval.name}:
                            </div>
                            <div className="font-bold text-indigo-600">
                                {target.interval.rough} Stammtöne und {target.interval.semitones} Halbtonschritte
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntervalPractice;
