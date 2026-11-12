import React, { useState, useCallback } from 'react';
import NotationDisplay from '../game/NotationDisplay';
import Piano from '../game/Piano';
import { generateNoteQuestion, checkAnswer } from '../../lib/music';
import { Check, Eye, EyeOff } from 'lucide-react';
import type { Question, Clef } from '../../types';
import { getFormattedNoteName } from '../../lib/utils';
import { useQuizTimer } from '../../hooks/useQuizTimer';
import QuizSetup from '../quiz/QuizSetup';
import QuizResults from '../quiz/QuizResults';
import QuizPlayingHeader from '../quiz/QuizPlayingHeader';

interface KeyboardNotesQuizProps {
    onBack: () => void;
}

interface QuizResult {
    question: Question;
    correct: boolean;
    userAnswer: string;
}

const KeyboardNotesQuiz: React.FC<KeyboardNotesQuizProps> = ({ onBack }) => {
    const {
        gameState, setGameState, gameDuration, setDuration,
        timeLeft, gameStateRef, startPlaying, restart,
    } = useQuizTimer(60);

    const [clef, setClef] = useState<Clef>('treble');
    const [useAccidentals, setUseAccidentals] = useState(true);
    const [question, setQuestion] = useState<Question | null>(null);
    const [selectedPianoNote, setSelectedPianoNote] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [attempts, setAttempts] = useState(0);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [showLabels, setShowLabels] = useState(true);

    // Restrict keyboard-notes to C4–C6 (c1–c3) for treble, C2–C4 for bass
    const noteRange = clef === 'treble'
        ? { startOctave: 4, endOctave: 6 }
        : { startOctave: 2, endOctave: 4 };

    const nextQuestion = useCallback(() => {
        const q = generateNoteQuestion(clef, useAccidentals, noteRange);
        setQuestion(q);
        setSelectedPianoNote(null);
        setFeedback(null);
        setAttempts(0);
    }, [clef, useAccidentals, noteRange.startOctave, noteRange.endOctave]);

    const handleCheck = (note: string) => {
        if (!note || !question || feedback === 'correct') return;

        const target = question.technicalAnswer || question.answer;
        const correct = checkAnswer(note, target, 'piano');

        if (correct) {
            setFeedback('correct');
            setResults(prev => [...prev, { question, correct: true, userAnswer: getFormattedNoteName(note) }]);
            setTimeout(() => {
                if (gameStateRef.current === 'playing') nextQuestion();
            }, 1000);
        } else {
            setFeedback('incorrect');
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= 2) {
                setResults(prev => [...prev, { question, correct: false, userAnswer: getFormattedNoteName(note) }]);
                setTimeout(() => {
                    if (gameStateRef.current === 'playing') nextQuestion();
                }, 1500);
            } else {
                // Allow retry
                setTimeout(() => {
                    setFeedback(null);
                    setSelectedPianoNote(null);
                }, 1000);
            }
        }
    };

    const pianoStartOctave = clef === 'bass' ? 2 : 4;
    const pianoEndOctave = clef === 'bass' ? 3 : 5;

    // --- Setup Screen ---
    if (gameState === 'setup') {
        return (
            <QuizSetup
                title="Quiz-Einstellungen"
                subtitle="Konfiguriere den Quiz."
                gameDuration={gameDuration}
                onDurationChange={setDuration}
                onBack={onBack}
                accentColor="blue"
                onStart={() => {
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
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
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
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* Show Labels Toggle */}
                <div className="mb-6">
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="text-left">
                            <h4 className="font-bold text-slate-800">Notennamen anzeigen</h4>
                            <p className="text-sm text-slate-500">Beschriftung der Tasten ein-/ausblenden</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showLabels}
                                onChange={(e) => setShowLabels(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                accentColor="blue"
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
                                                <Check size={12} /> {res.userAnswer}
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
            <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <QuizPlayingHeader
                    timeLeft={timeLeft}
                    correctCount={results.filter(r => r.correct).length}
                    incorrectCount={results.filter(r => !r.correct).length}
                    onCancel={() => setGameState('setup')}
                />

                {/* Question: VexFlow Notation */}
                <div className="flex justify-center my-4">
                    <NotationDisplay question={question.question} width={180} height={200} />
                </div>

                {/* Feedback */}
                {feedback && (
                    <div className={`text-center py-2 mb-2 rounded-lg font-bold ${feedback === 'correct' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {feedback === 'correct' ? '✓ Richtig!' : `✗ Falsch${attempts >= 2 ? ` – Lösung: ${question.answer}` : ' – Versuch es nochmal!'}`}
                    </div>
                )}

                {/* Piano Input */}
                <div className="flex flex-col items-center gap-3 w-full mt-4">
                    <div className="w-full flex justify-end">
                        <button
                            onClick={() => setShowLabels((v) => !v)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                            aria-pressed={showLabels}
                        >
                            {showLabels ? <EyeOff size={16} /> : <Eye size={16} />}
                            {showLabels ? 'Tastennamen ausblenden' : 'Tastennamen anzeigen'}
                        </button>
                    </div>
                    <Piano
                        onNotePlay={(note) => {
                            if (feedback === 'correct') return;
                            setSelectedPianoNote(note);
                            handleCheck(note);
                        }}
                        selectedNote={selectedPianoNote}
                        startOctave={pianoStartOctave}
                        endOctave={pianoEndOctave}
                        showLabels={showLabels}
                    />
                </div>
            </div>
        </div>
    );
};

export default KeyboardNotesQuiz;
