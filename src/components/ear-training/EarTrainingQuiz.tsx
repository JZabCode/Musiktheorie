import React, { useState, useCallback } from 'react';
import { QUIZ_INTERVALS, TRIADS } from '../../lib/music';
import { audio } from '../../lib/audio';
import { midiToNote } from '../../lib/utils';
import { Volume2, Check, X } from 'lucide-react';
import { useQuizTimer } from '../../hooks/useQuizTimer';
import QuizSetup from '../quiz/QuizSetup';
import QuizResults from '../quiz/QuizResults';
import QuizPlayingHeader from '../quiz/QuizPlayingHeader';

type EarMode = 'intervals' | 'triads';

interface EarTrainingQuizProps {
    mode: EarMode;
    onBack: () => void;
}

interface IntervalQuestion {
    kind: 'interval';
    rootMidi: number;
    semitones: number;
    name: string;
}

interface TriadQuestion {
    kind: 'triad';
    rootMidi: number;
    triadLabel: string;
    midiNotes: number[];
}

type EarQuestion = IntervalQuestion | TriadQuestion;

interface QuizResult {
    correctAnswer: string;
    userAnswer: string;
    correct: boolean;
}

/** Pick a random root MIDI note that keeps all subsequent notes in a comfortable range (C3-C6). */
const pickRootMidi = (maxIntervalSemitones: number): number => {
    const minRoot = 48; // C3
    const maxRoot = 72 - maxIntervalSemitones; // ensures highest note <= C6 (72)
    return Math.floor(Math.random() * (maxRoot - minRoot + 1)) + minRoot;
};

const generateIntervalQuestion = (): IntervalQuestion => {
    const candidates = QUIZ_INTERVALS.filter(e => e.semitones > 0);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    return {
        kind: 'interval',
        rootMidi: pickRootMidi(pick.semitones),
        semitones: pick.semitones,
        name: pick.name,
    };
};

const generateTriadEarQuestion = (): TriadQuestion => {
    const triad = TRIADS[Math.floor(Math.random() * TRIADS.length)];
    const rootMidi = pickRootMidi(Math.max(...triad.intervals));
    return {
        kind: 'triad',
        rootMidi,
        triadLabel: triad.label,
        midiNotes: [rootMidi, rootMidi + triad.intervals[0], rootMidi + triad.intervals[1]],
    };
};

const EarTrainingQuiz: React.FC<EarTrainingQuizProps> = ({ mode, onBack }) => {
    const {
        gameState, setGameState, gameDuration, setDuration,
        timeLeft, gameStateRef, startPlaying, restart,
    } = useQuizTimer(60);

    const [question, setQuestion] = useState<EarQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [results, setResults] = useState<QuizResult[]>([]);

    const playQuestion = useCallback((q: EarQuestion) => {
        if (q.kind === 'interval') {
            const noteRoot = midiToNote(q.rootMidi);
            const noteTarget = midiToNote(q.rootMidi + q.semitones);
            audio.playArpeggio(noteRoot, noteTarget);
        } else {
            const noteNames = q.midiNotes.map(midiToNote);
            audio.playChord(noteNames);
        }
    }, []);

    const nextQuestion = useCallback(() => {
        const q: EarQuestion = mode === 'intervals'
            ? generateIntervalQuestion()
            : generateTriadEarQuestion();
        setQuestion(q);
        setSelectedAnswer(null);
        setFeedback(null);
        playQuestion(q);
    }, [mode, playQuestion]);

    const handleAnswer = (answer: string) => {
        if (feedback || gameState !== 'playing' || !question) return;

        setSelectedAnswer(answer);

        // For intervals: compare semitones (enharmonic equivalents accepted).
        // For triads: compare label.
        let correct: boolean;
        let correctDisplay: string;
        if (question.kind === 'interval') {
            const selectedEntry = QUIZ_INTERVALS.find(e => e.name === answer);
            correct = selectedEntry?.semitones === question.semitones;
            correctDisplay = question.name;
        } else {
            correct = answer === question.triadLabel;
            correctDisplay = question.triadLabel;
        }

        setResults(prev => [...prev, { correctAnswer: correctDisplay, userAnswer: answer, correct }]);

        if (correct) {
            setFeedback('correct');
            audio.playFeedback(true);
        } else {
            setFeedback('incorrect');
            audio.playFeedback(false);
        }

        setTimeout(() => {
            if (gameStateRef.current === 'playing') nextQuestion();
        }, 1200);
    };

    // --- Setup Screen ---
    if (gameState === 'setup') {
        return (
            <QuizSetup
                title={mode === 'intervals' ? 'Gehörbildung: Intervalle' : 'Gehörbildung: Dreiklänge'}
                subtitle="Wähle die Spieldauer."
                gameDuration={gameDuration}
                onDurationChange={setDuration}
                onBack={onBack}
                accentColor="amber"
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
                accentColor="amber"
                onRestart={() => { setResults([]); restart(); nextQuestion(); }}
            >
                {results.length > 0 && (
                    <div className="text-left mb-8 max-h-[60vh] overflow-y-auto pr-2">
                        <h3 className="font-bold text-slate-700 mb-3 px-1 text-sm uppercase tracking-wide">
                            Verlauf ({results.length})
                        </h3>
                        <div className="space-y-2">
                            {results.map((res, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${res.correct ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-slate-400 w-6 text-xs">#{i + 1}</span>
                                        <span className="font-medium text-slate-700">{res.correctAnswer}</span>
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

    // Build options list based on mode
    const options: string[] = mode === 'intervals'
        ? QUIZ_INTERVALS.filter(e => e.semitones > 0).map(e => e.name)
        : TRIADS.map(t => t.label);

    const isCorrectOption = (opt: string): boolean => {
        if (!question) return false;
        if (question.kind === 'interval') {
            const entry = QUIZ_INTERVALS.find(e => e.name === opt);
            return entry?.semitones === question.semitones;
        }
        return opt === question.triadLabel;
    };

    return (
        <div className="flex flex-col items-center px-4 py-6">
            <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <QuizPlayingHeader
                    timeLeft={timeLeft}
                    correctCount={results.filter(r => r.correct).length}
                    incorrectCount={results.filter(r => !r.correct).length}
                    onCancel={() => setGameState('setup')}
                />

                {/* Big play / replay area */}
                <div className="flex flex-col items-center justify-center my-8 gap-4">
                    <button
                        onClick={() => playQuestion(question)}
                        className="bg-amber-100 hover:bg-amber-200 p-10 rounded-full transition-colors shadow-md hover:shadow-lg"
                        aria-label="Ton wiederholen"
                    >
                        <Volume2 size={56} className="text-amber-700" />
                    </button>
                    <p className="text-slate-500 text-sm font-medium">
                        {mode === 'intervals'
                            ? 'Welches Intervall hörst du?'
                            : 'Welcher Dreiklang ist das?'}
                    </p>
                </div>

                {/* Answer Buttons */}
                <div className={`grid gap-3 mt-4 ${mode === 'intervals' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'}`}>
                    {options.map((opt) => {
                        let btnClass = 'py-3 px-2 rounded-lg border-2 font-semibold text-sm transition-all ';

                        if (selectedAnswer === opt && feedback === 'correct') {
                            btnClass += 'bg-emerald-500 text-white border-emerald-500';
                        } else if (selectedAnswer === opt && feedback === 'incorrect') {
                            btnClass += 'bg-rose-500 text-white border-rose-500';
                        } else if (feedback === 'incorrect' && isCorrectOption(opt)) {
                            btnClass += 'border-emerald-500 text-emerald-600 bg-white';
                        } else if (feedback && selectedAnswer !== opt && !isCorrectOption(opt)) {
                            btnClass += 'bg-white border-slate-200 text-slate-300';
                        } else {
                            btnClass += 'bg-white border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50';
                        }

                        return (
                            <button
                                key={opt}
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

export default EarTrainingQuiz;
