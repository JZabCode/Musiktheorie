import React, { useState, useCallback } from 'react';
import IntervalPiano from './IntervalPiano';
import { getRandomInterval, QUIZ_INTERVALS, INTERVAL_NOTES } from '../../lib/music';
import { audio } from '../../lib/audio';
import { Volume2, Check, X } from 'lucide-react';
import { midiToNote } from '../../lib/utils';
import { useQuizTimer } from '../../hooks/useQuizTimer';
import QuizSetup from '../quiz/QuizSetup';
import QuizResults from '../quiz/QuizResults';
import QuizPlayingHeader from '../quiz/QuizPlayingHeader';

interface IntervalQuizProps {
    onBack: () => void;
}

interface QuizQuestion {
    root: number;
    target: number;
    interval: { semitones: number; name: string };
}

interface QuizResult {
    correctInterval: string;
    userAnswer: string;
    correct: boolean;
    rootNote: string;
    targetNote: string;
}

const IntervalQuiz: React.FC<IntervalQuizProps> = ({ onBack }) => {
    const {
        gameState, setGameState, gameDuration, setDuration,
        timeLeft, gameStateRef, startPlaying, restart,
    } = useQuizTimer(60);

    const [question, setQuestion] = useState<QuizQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [results, setResults] = useState<QuizResult[]>([]);

    const playQuestion = useCallback((root: number, target: number) => {
        const noteRoot = midiToNote(60 + root);
        const noteTarget = midiToNote(60 + target);
        audio.playArpeggio(noteRoot, noteTarget);
    }, []);

    const nextQuestion = useCallback(() => {
        const interval = getRandomInterval('quiz');
        const maxRoot = 12 - interval.semitones;
        const rootIndex = Math.floor(Math.random() * (maxRoot + 1));
        const targetIndex = rootIndex + interval.semitones;

        const q: QuizQuestion = { root: rootIndex, target: targetIndex, interval };
        setQuestion(q);
        setSelectedAnswer(null);
        setFeedback(null);

        playQuestion(rootIndex, targetIndex);
    }, [playQuestion]);

    const handleAnswer = (answerName: string) => {
        if (feedback || gameState !== 'playing' || !question) return;

        setSelectedAnswer(answerName);
        const correct = answerName === question.interval.name;

        const result: QuizResult = {
            correctInterval: question.interval.name,
            userAnswer: answerName,
            correct,
            rootNote: INTERVAL_NOTES[question.root % 12],
            targetNote: INTERVAL_NOTES[question.target % 12],
        };
        setResults(prev => [...prev, result]);

        if (correct) {
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
        }, 1000);
    };

    // --- Setup Screen ---
    if (gameState === 'setup') {
        return (
            <QuizSetup
                title="Quiz-Einstellungen"
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
                onBack={onBack}
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
                                        <div className="text-sm">
                                            <span className="font-medium text-slate-700">{res.rootNote} → {res.targetNote}</span>
                                            <span className="text-slate-400 ml-2 text-xs">({res.correctInterval})</span>
                                        </div>
                                    </div>
                                    <div>
                                        {res.correct ? (
                                            <span className="text-emerald-600 bg-emerald-100 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                <Check size={12} /> Richtig
                                            </span>
                                        ) : (
                                            <span className="text-rose-600 bg-rose-100 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                <X size={12} /> {res.userAnswer}
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

                {/* Piano */}
                <IntervalPiano
                    activeKeys={[question.root, question.target]}
                    correctKeys={feedback === 'correct' ? [question.root, question.target] : []}
                />

                {/* Replay Button */}
                <div className="flex justify-center my-4">
                    <button
                        onClick={() => playQuestion(question.root, question.target)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors"
                    >
                        <Volume2 size={20} /> Ton wiederholen
                    </button>
                </div>

                {/* Answer Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {QUIZ_INTERVALS.filter(entry => entry.semitones > 0).map((entry) => {
                        let btnClass = 'py-3 px-2 rounded-lg border-2 font-semibold text-sm transition-all ';

                        if (selectedAnswer === entry.name && feedback === 'correct') {
                            btnClass += 'bg-emerald-500 text-white border-emerald-500';
                        } else if (selectedAnswer === entry.name && feedback === 'incorrect') {
                            btnClass += 'bg-rose-500 text-white border-rose-500';
                        } else if (feedback === 'incorrect' && entry.name === question.interval.name) {
                            btnClass += 'border-emerald-500 text-emerald-600 bg-white';
                        } else if (feedback && selectedAnswer !== entry.name && entry.name !== question.interval.name) {
                            btnClass += 'bg-white border-slate-200 text-slate-300';
                        } else {
                            btnClass += 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50';
                        }

                        return (
                            <button
                                key={entry.name}
                                onClick={() => handleAnswer(entry.name)}
                                disabled={!!feedback}
                                className={btnClass}
                            >
                                {entry.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default IntervalQuiz;
