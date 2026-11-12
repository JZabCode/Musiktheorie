import React, { useState, useCallback } from 'react';
import IntervalBuildNotation from './IntervalBuildNotation';
import IntervalBuildInput from './IntervalBuildInput';
import type { NoteSelection } from './IntervalBuildInput';
import { generateIntervalBuildQuestion } from '../../lib/music';
import type { IntervalBuildQuestion } from '../../lib/music';
import { audio } from '../../lib/audio';
import { Check, X } from 'lucide-react';
import { toGermanLabel } from './IntervalBuildInput';
import { useQuizTimer } from '../../hooks/useQuizTimer';
import QuizSetup from '../quiz/QuizSetup';
import QuizResults from '../quiz/QuizResults';
import QuizPlayingHeader from '../quiz/QuizPlayingHeader';

interface IntervalQuizBuildProps {
    onBack: () => void;
}

interface QuizResult {
    question: IntervalBuildQuestion;
    userSelection: NoteSelection;
    correct: boolean;
}

const IntervalQuizBuild: React.FC<IntervalQuizBuildProps> = ({ onBack }) => {
    const {
        gameState, setGameState, gameDuration, setDuration,
        timeLeft, gameStateRef, startPlaying, restart,
    } = useQuizTimer(60);

    const [question, setQuestion] = useState<IntervalBuildQuestion | null>(null);
    const [selection, setSelection] = useState<NoteSelection | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [results, setResults] = useState<QuizResult[]>([]);

    const nextQuestion = useCallback(() => {
        const q = generateIntervalBuildQuestion('quiz');
        setQuestion(q);
        setSelection(null);
        setFeedback(null);
    }, []);

    const handleNoteConfirm = (sel: NoteSelection) => {
        if (feedback || gameState !== 'playing' || !question) return;

        setSelection(sel);

        const correctTargetKey = question.correctKeys[1];
        const [correctNotePart] = correctTargetKey.split('/');
        const correctPitchClass = correctNotePart;
        const userPitchClass = sel.letter + sel.accidental;

        const isCorrect = userPitchClass === correctPitchClass;

        const result: QuizResult = { question, userSelection: sel, correct: isCorrect };
        setResults(prev => [...prev, result]);

        if (isCorrect) {
            setFeedback('correct');
            audio.playFeedback(true);
        } else {
            setFeedback('incorrect');
            audio.playFeedback(false);
        }

        setTimeout(() => {
            if (gameStateRef.current === 'playing') {
                nextQuestion();
            }
        }, 1200);
    };

    // --- Setup Screen ---
    if (gameState === 'setup') {
        return (
            <QuizSetup
                title="Quiz-Einstellungen (Bilden)"
                subtitle="Wähle die Spieldauer."
                gameDuration={gameDuration}
                onDurationChange={setDuration}
                onBack={onBack}
                onStart={async () => {
                    await audio.init();
                    setResults([]);
                    startPlaying();
                    nextQuestion();
                }}
            />
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
                subtitle={`Ergebnis im Bilden-Modus nach ${gameDuration / 60} Minute(n)`}
                onBack={onBack}
                onRestart={() => { setResults([]); restart(); nextQuestion(); }}
            >
                {results.length > 0 && (
                    <div className="text-left mb-8 max-h-[60vh] overflow-y-auto pr-2">
                        <h3 className="font-bold text-slate-700 mb-3 px-1 text-sm uppercase tracking-wide">Verlauf ({results.length})</h3>
                        <div className="space-y-2">
                            {results.map((res, i) => {
                                const correctTargetKey = res.question.correctKeys[1];
                                const [correctNotePart] = correctTargetKey.split('/');
                                const correctLetter = correctNotePart.charAt(0);
                                const correctAccidental = correctNotePart.substring(1);
                                const correctLabel = toGermanLabel({ letter: correctLetter, accidental: correctAccidental });

                                const roottKey = res.question.correctKeys[0];
                                const [rootNotePart] = roottKey.split('/');
                                const rootLabel = toGermanLabel({ letter: rootNotePart.charAt(0), accidental: rootNotePart.substring(1) });

                                return (
                                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${res.correct ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-slate-400 w-6 text-xs">#{i + 1}</span>
                                            <div className="text-sm">
                                                <span className="font-medium text-slate-700">{res.question.intervalName} ab {rootLabel}</span>
                                            </div>
                                        </div>
                                        <div>
                                            {res.correct ? (
                                                <span className="text-emerald-600 bg-emerald-100 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                    <Check size={12} /> Richtig ({correctLabel})
                                                </span>
                                            ) : (
                                                <span className="text-rose-600 bg-rose-100 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                    <X size={12} /> {toGermanLabel(res.userSelection)} statt {correctLabel}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
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

                {/* Task: Display the interval name */}
                <div className="text-center mb-4">
                    <p className="text-slate-500 font-medium mb-2">Bilde folgendes Intervall:</p>
                    <div className="inline-block bg-indigo-50 border-2 border-indigo-200 rounded-xl px-6 py-3">
                        <span className="text-2xl font-bold text-indigo-700">{question.intervalName}</span>
                    </div>
                </div>

                {/* Interactive Notation */}
                <div className="flex justify-center my-6">
                    <IntervalBuildNotation
                        rootKey={question.correctKeys[0]}
                        selection={selection}
                        width={200}
                    />
                </div>

                {/* Note Selection */}
                <IntervalBuildInput
                    onNoteConfirm={handleNoteConfirm}
                    confirmedSelection={selection}
                    disabled={!!feedback}
                    feedback={feedback}
                    correctKey={question.correctKeys[1]}
                    showCorrectAnswer={true}
                />
            </div>
        </div>
    );
};

export default IntervalQuizBuild;
