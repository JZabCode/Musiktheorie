import React, { useState, useCallback } from 'react';
import NotationDisplay from '../game/NotationDisplay';
import TriadAnswerInput from './TriadAnswerInput';
import { generateTriadQuestion, checkAnswer } from '../../lib/music';
import { audio } from '../../lib/audio';
import { Check, X } from 'lucide-react';
import type { Question } from '../../types';
import { useQuizTimer } from '../../hooks/useQuizTimer';
import QuizSetup from '../quiz/QuizSetup';
import QuizResults from '../quiz/QuizResults';
import QuizPlayingHeader from '../quiz/QuizPlayingHeader';

interface TriadsQuizProps {
    onBack: () => void;
}

interface QuizResult {
    question: Question;
    correct: boolean;
    userAnswer: string;
}

const TriadsQuiz: React.FC<TriadsQuizProps> = ({ onBack }) => {
    const {
        gameState, setGameState, gameDuration, setDuration,
        timeLeft, gameStateRef, startPlaying, restart,
    } = useQuizTimer(60);

    const [question, setQuestion] = useState<Question | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [results, setResults] = useState<QuizResult[]>([]);

    const nextQuestion = useCallback(() => {
        const q = generateTriadQuestion();
        setQuestion(q);
        setFeedback(null);
    }, []);

    const handleAnswer = (answer: string) => {
        if (feedback || gameState !== 'playing' || !question) return;

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
                subtitle="Wähle die Spieldauer."
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
                    <NotationDisplay question={question.question} width={200} />
                </div>

                <p className="text-center text-slate-500 mb-4 font-medium">Welcher Dreiklang ist das?</p>

                {/* Answer Input: Keyboard + Triad Type */}
                <TriadAnswerInput
                    onAnswer={handleAnswer}
                    disabled={!!feedback}
                    feedback={feedback}
                    correctAnswer={question.answer}
                />
            </div>
        </div>
    );
};

export default TriadsQuiz;
