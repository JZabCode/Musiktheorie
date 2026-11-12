import React, { useState, useCallback } from 'react';
import NotationDisplay from '../game/NotationDisplay';
import { generateNoteQuestion, checkAnswer } from '../../lib/music';
import { audio } from '../../lib/audio';
import { Check, X } from 'lucide-react';
import type { Question, Clef } from '../../types';
import { useQuizTimer } from '../../hooks/useQuizTimer';
import QuizSetup from '../quiz/QuizSetup';
import QuizResults from '../quiz/QuizResults';
import QuizPlayingHeader from '../quiz/QuizPlayingHeader';

interface NotesQuizProps {
    onBack: () => void;
}

interface QuizResult {
    question: Question;
    correct: boolean;
    userAnswer: string;
}

const NotesQuiz: React.FC<NotesQuizProps> = ({ onBack }) => {
    const {
        gameState, setGameState, gameDuration, setDuration,
        timeLeft, gameStateRef, startPlaying, restart,
    } = useQuizTimer(60);

    const [clef, setClef] = useState<Clef>('treble');
    const [useAccidentals, setUseAccidentals] = useState(true);
    const [question, setQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [results, setResults] = useState<QuizResult[]>([]);

    const nextQuestion = useCallback(() => {
        const q = generateNoteQuestion(clef, useAccidentals);
        setQuestion(q);
        setSelectedAnswer(null);
        setFeedback(null);
    }, [clef, useAccidentals]);

    const handleAnswer = (answer: string) => {
        if (feedback || gameState !== 'playing' || !question) return;

        setSelectedAnswer(answer);
        const correct = checkAnswer(answer, question.answer, 'choice');

        setResults(prev => [...prev, { question, correct, userAnswer: answer }]);

        if (correct) {
            setFeedback('correct');
            audio.playFeedback(true);
        } else {
            setFeedback('incorrect');
            audio.playFeedback(false);
        }

        setTimeout(() => {
            if (gameStateRef.current === 'playing') nextQuestion();
        }, 1000);
    };

    // --- Setup Screen ---
    if (gameState === 'setup') {
        return (
            <QuizSetup
                title="Quiz-Einstellungen"
                subtitle="Konfiguriere den Quiz."
                gameDuration={gameDuration}
                onDurationChange={setDuration}
                onBack={onBack}
                onStart={async () => {
                    await audio.init();
                    setResults([]);
                    startPlaying();
                    nextQuestion();
                }}
            >
                {/* Clef Selection */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-slate-700">Notenschlüssel</h3>
                    <div className="flex justify-center gap-4">
                        {(['treble', 'bass'] as const).map((c) => (
                            <button
                                key={c}
                                onClick={() => setClef(c)}
                                className={`px-6 py-3 rounded-lg border-2 transition-all font-medium ${clef === c
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                                    }`}
                            >
                                {c === 'treble' ? 'Violin' : 'Bass'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accidentals Toggle */}
                <div className="mb-6">
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="text-left">
                            <h4 className="font-bold text-slate-800">Vorzeichen (Kreuz/Be)</h4>
                            <p className="text-sm text-slate-500">Zufällige # und b in den Aufgaben</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useAccidentals}
                                onChange={(e) => setUseAccidentals(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
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
                                        <span className="font-medium text-slate-700">{res.question.answer}</span>
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

                {/* Question: VexFlow Notation */}
                <div className="flex justify-center my-6">
                    <NotationDisplay question={question.question} />
                </div>

                {/* Answer Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {question.options.map((opt, i) => {
                        let btnClass = 'py-3 px-2 rounded-lg border-2 font-semibold text-sm transition-all ';

                        if (selectedAnswer === opt && feedback === 'correct') {
                            btnClass += 'bg-emerald-500 text-white border-emerald-500';
                        } else if (selectedAnswer === opt && feedback === 'incorrect') {
                            btnClass += 'bg-rose-500 text-white border-rose-500';
                        } else if (feedback === 'incorrect' && opt === question.answer) {
                            btnClass += 'border-emerald-500 text-emerald-600 bg-white';
                        } else if (feedback && selectedAnswer !== opt && opt !== question.answer) {
                            btnClass += 'bg-white border-slate-200 text-slate-300';
                        } else {
                            btnClass += 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50';
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => handleAnswer(opt)}
                                disabled={!!feedback}
                                className={btnClass}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default NotesQuiz;
