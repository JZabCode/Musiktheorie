import React, { useState } from 'react';
import { ArrowRight, Check, X, CheckCircle2 } from 'lucide-react';
import type { Clef } from '../../types';
import { checkScale, pickScaleTask, type ModeSelection, type ScaleCheckResult, type ScaleNote, type ScaleTask } from '../../lib/scales';
import { audio } from '../../lib/audio';
import { useQuizTimer } from '../../hooks/useQuizTimer';
import QuizSetup from '../quiz/QuizSetup';
import QuizResults from '../quiz/QuizResults';
import QuizPlayingHeader from '../quiz/QuizPlayingHeader';
import ScaleBuilder from './ScaleBuilder';
import { ScaleSettings, ScaleTaskCard, ScaleFeedback, answerAnnotations } from './ScaleShared';
import ScaleInputGuide from './ScaleInputGuide';

interface ScalesQuizProps {
    onBack: () => void;
}

interface QuizResultEntry {
    name: string;
    correct: boolean;
}

const ScalesQuiz: React.FC<ScalesQuizProps> = ({ onBack }) => {
    const {
        gameState, setGameState, gameDuration, setDuration,
        timeLeft, gameStateRef, startPlaying, restart,
    } = useQuizTimer(180);

    const [modeSelection, setModeSelection] = useState<ModeSelection>('both');
    const [clef, setClef] = useState<Clef>('treble');

    const [task, setTask] = useState<ScaleTask | null>(null);
    const [notes, setNotes] = useState<ScaleNote[]>([]);
    const [result, setResult] = useState<ScaleCheckResult | null>(null);
    const [guideOpen, setGuideOpen] = useState(false); // ausführliche Erklärung steht schon auf der Einstellungsseite
    const [results, setResults] = useState<QuizResultEntry[]>([]);

    const nextTask = (previousId?: string) => {
        setTask(pickScaleTask(modeSelection, previousId));
        setNotes([]);
        setResult(null);
    };

    const handleCheck = () => {
        if (!task || result || notes.length === 0) return;
        const r = checkScale(task.key, clef, notes);
        setResult(r);
        setResults((prev) => [...prev, { name: task.name, correct: r.correct }]);
        audio.playFeedback(r.correct);
        if (r.correct) {
            const id = task.key.id;
            setTimeout(() => {
                if (gameStateRef.current === 'playing') nextTask(id);
            }, 1500);
        }
    };

    // --- Setup ---
    if (gameState === 'setup') {
        return (
            <QuizSetup
                title="Quiz – Tonleitern"
                subtitle="Bilde so viele Tonleitern wie möglich. Wähle die Spieldauer."
                gameDuration={gameDuration}
                onDurationChange={setDuration}
                onBack={onBack}
                accentColor="teal"
                onStart={async () => {
                    await audio.init();
                    setResults([]);
                    startPlaying();
                    nextTask();
                }}
            >
                <ScaleSettings
                    modeSelection={modeSelection}
                    onModeChange={setModeSelection}
                    clef={clef}
                    onClefChange={setClef}
                />
                <ScaleInputGuide />
            </QuizSetup>
        );
    }

    // --- Ergebnis ---
    if (gameState === 'finished') {
        const correctCount = results.filter((r) => r.correct).length;
        return (
            <QuizResults
                correctCount={correctCount}
                incorrectCount={results.length - correctCount}
                gameDuration={gameDuration}
                onBack={onBack}
                accentColor="teal"
                onRestart={() => { setResults([]); restart(); nextTask(); }}
            >
                {results.length > 0 && (
                    <div className="text-left mb-8 max-h-[60vh] overflow-y-auto pr-2">
                        <h3 className="font-bold text-slate-700 mb-3 px-1 text-sm uppercase tracking-wide">Verlauf ({results.length})</h3>
                        <div className="space-y-2">
                            {results.map((res, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${res.correct ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-slate-400 w-6 text-xs">#{i + 1}</span>
                                        <span className="font-medium text-slate-700">{res.name}</span>
                                    </div>
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
                            ))}
                        </div>
                    </div>
                )}
            </QuizResults>
        );
    }

    // --- Spiel ---
    if (!task) return <div className="text-center p-10">Laden...</div>;

    const annotations = result ? answerAnnotations(task.key, notes, result) : null;
    const correctCount = results.filter((r) => r.correct).length;

    return (
        <div className="flex flex-col items-center px-4 py-6">
            <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <QuizPlayingHeader
                    timeLeft={timeLeft}
                    correctCount={correctCount}
                    incorrectCount={results.length - correctCount}
                    onCancel={() => setGameState('setup')}
                />

                <ScaleTaskCard name={task.name} />

                {!result && (
                    <ScaleInputGuide collapsible open={guideOpen} onToggle={() => setGuideOpen((o) => !o)} />
                )}

                <ScaleBuilder
                    clef={clef}
                    notes={notes}
                    onChange={setNotes}
                    disabled={!!result}
                    noteColors={annotations?.noteColors}
                    labels={annotations?.labels}
                    steps={annotations?.steps}
                />

                {!result && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={handleCheck}
                            disabled={notes.length === 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <CheckCircle2 size={20} /> Prüfen
                        </button>
                    </div>
                )}

                {result && (
                    <div className="mt-5 space-y-4">
                        <ScaleFeedback
                            keyDef={task.key}
                            clef={clef}
                            notes={notes}
                            result={result}
                            showSolution={!result.correct}
                        />
                        {!result.correct && (
                            <div className="flex justify-center">
                                <button
                                    onClick={() => nextTask(task.key.id)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg transition-colors"
                                >
                                    Weiter <ArrowRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScalesQuiz;
