import React, { useState, useCallback } from 'react';
import TriadBuildNotation from './TriadBuildNotation';
import TriadBuildInput, { checkBuildPitchClasses } from './TriadBuildInput';
import type { NoteSelection } from './TriadBuildInput';
import { generateTriadBuildQuestion } from '../../lib/music';
import { audio } from '../../lib/audio';
import { Check, X, Undo2 } from 'lucide-react';
import type { TriadBuildQuestion, Inversion } from '../../lib/music';
import { useQuizTimer } from '../../hooks/useQuizTimer';
import QuizSetup from '../quiz/QuizSetup';
import QuizResults from '../quiz/QuizResults';
import QuizPlayingHeader from '../quiz/QuizPlayingHeader';

interface TriadsQuizBuildProps {
    onBack: () => void;
}

interface QuizBuildResult {
    triadName: string;
    inversion: Inversion;
    correct: boolean;
}

const TriadsQuizBuild: React.FC<TriadsQuizBuildProps> = ({ onBack }) => {
    const {
        gameState, setGameState, gameDuration, setDuration,
        timeLeft, gameStateRef, startPlaying, restart,
    } = useQuizTimer(60);

    const [question, setQuestion] = useState<TriadBuildQuestion | null>(null);
    const [selections, setSelections] = useState<NoteSelection[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [results, setResults] = useState<QuizBuildResult[]>([]);
    const [allowInversions, setAllowInversions] = useState(false);

    const nextQuestion = useCallback(() => {
        const q = generateTriadBuildQuestion({
            allowInversions,
            emphasizeInversions: allowInversions,
        });
        setQuestion(q);
        setSelections([]);
        setFeedback(null);
    }, [allowInversions]);

    const handleNoteConfirm = (sel: NoteSelection) => {
        if (feedback || gameState !== 'playing' || !question) return;
        if (selections.length >= 3) return;

        const newSelections = [...selections, sel];
        setSelections(newSelections);

        // After the 3rd note, check the answer
        if (newSelections.length === 3) {
            const isCorrect = checkBuildPitchClasses(newSelections, question.correctKeys);

            setResults(prev => [...prev, {
                triadName: question.triadName,
                inversion: question.inversion,
                correct: isCorrect,
            }]);

            if (isCorrect) {
                setFeedback('correct');
                audio.playFeedback(true);
            } else {
                setFeedback('incorrect');
                audio.playFeedback(false);
            }

            setTimeout(() => {
                if (gameStateRef.current === 'playing') nextQuestion();
            }, 1500);
        }
    };

    const handleUndo = () => {
        if (feedback || selections.length === 0) return;
        setSelections(prev => prev.slice(0, -1));
    };

    // --- Setup Screen ---
    if (gameState === 'setup') {
        return (
            <QuizSetup
                title="Quiz – Bilden"
                subtitle="Bilde Dreiklänge unter Zeitdruck. Wähle die Spieldauer."
                gameDuration={gameDuration}
                onDurationChange={setDuration}
                onBack={onBack}
                accentColor="rose"
                onStart={async () => {
                    await audio.init();
                    setResults([]);
                    startPlaying();
                    nextQuestion();
                }}
            >
                <div className="mb-6 text-left">
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div>
                            <h4 className="font-bold text-slate-800">Umkehrungen</h4>
                            <p className="text-sm text-slate-500">Auch 1. und 2. Umkehrung bilden</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={allowInversions}
                                onChange={(e) => setAllowInversions(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                        </label>
                    </div>
                </div>
            </QuizSetup>
        );
    }

    // --- Finished Screen ---
    if (gameState === 'finished') {
        const correctCount = results.filter(r => r.correct).length;
        const incorrectCount = results.filter(r => !r.correct).length;

        return (
            <QuizResults
                correctCount={correctCount}
                incorrectCount={incorrectCount}
                gameDuration={gameDuration}
                onBack={onBack}
                accentColor="rose"
                onRestart={() => { setResults([]); restart(); nextQuestion(); }}
            >
                {results.length > 0 && (
                    <div className="text-left mb-8 max-h-[60vh] overflow-y-auto pr-2">
                        <h3 className="font-bold text-slate-700 mb-3 px-1 text-sm uppercase tracking-wide">Verlauf ({results.length})</h3>
                        <div className="space-y-2">
                            {results.map((res, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${res.correct ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-slate-400 w-6 text-xs">#{i + 1}</span>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-700">{res.triadName}</span>
                                            {res.inversion !== 'Grundstellung' && (
                                                <span className="text-xs text-slate-500">{res.inversion}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        {res.correct ? (
                                            <span className="text-emerald-600 bg-emerald-100 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                <Check size={12} /> Richtig
                                            </span>
                                        ) : (
                                            <span className="text-rose-600 bg-rose-100 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                <X size={12} /> Falsch
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </QuizResults>
        );
    }

    // --- Playing Screen ---
    if (!question) return <div className="text-center p-10">Laden...</div>;

    return (
        <div className="flex flex-col items-center px-4 py-6">
            <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <QuizPlayingHeader
                    timeLeft={timeLeft}
                    correctCount={results.filter(r => r.correct).length}
                    incorrectCount={results.filter(r => !r.correct).length}
                    onCancel={() => setGameState('setup')}
                />

                {/* Task: Display the triad name (with inversion when active) */}
                <div className="text-center mb-4">
                    <p className="text-slate-500 font-medium mb-2">Bilde den Dreiklang:</p>
                    <div className="inline-block bg-rose-50 border-2 border-rose-200 rounded-xl px-6 py-3">
                        <div className="text-2xl font-bold text-rose-700">{question.triadName}</div>
                        {allowInversions && (
                            <div className="text-sm font-semibold text-rose-600 mt-1 uppercase tracking-wider">
                                {question.inversion}
                            </div>
                        )}
                    </div>
                    {allowInversions && (
                        <p className="text-xs text-slate-400 mt-3">
                            Töne von unten nach oben eingeben — tiefster Ton zuerst.
                        </p>
                    )}
                </div>

                {/* Interactive Notation */}
                <div className="flex justify-center my-4">
                    <TriadBuildNotation selections={selections} width={200} />
                </div>

                {/* Undo Button */}
                {selections.length > 0 && !feedback && (
                    <div className="flex justify-center mb-3">
                        <button
                            onClick={handleUndo}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors text-sm"
                        >
                            <Undo2 size={16} /> Rückgängig
                        </button>
                    </div>
                )}

                {/* Note Selection */}
                <TriadBuildInput
                    onNoteConfirm={handleNoteConfirm}
                    confirmedSelections={selections}
                    disabled={!!feedback}
                    feedback={feedback}
                    correctKeys={question.correctKeys}
                />
            </div>
        </div>
    );
};

export default TriadsQuizBuild;
