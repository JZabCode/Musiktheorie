import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RefreshCcw, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import type { Clef } from '../../types';
import { checkScale, pickScaleTask, type ModeSelection, type ScaleCheckResult, type ScaleNote, type ScaleTask } from '../../lib/scales';
import { audio } from '../../lib/audio';
import ScaleBuilder from './ScaleBuilder';
import { ScaleSettings, ScaleTaskCard, ScaleFeedback, answerAnnotations } from './ScaleShared';
import ScaleInputGuide from './ScaleInputGuide';

interface ScalesPracticeProps {
    onBack: () => void;
}

const ScalesPractice: React.FC<ScalesPracticeProps> = ({ onBack }) => {
    const [started, setStarted] = useState(false);
    const [modeSelection, setModeSelection] = useState<ModeSelection>('major');
    const [clef, setClef] = useState<Clef>('treble');

    const [task, setTask] = useState<ScaleTask | null>(null);
    const [notes, setNotes] = useState<ScaleNote[]>([]);
    const [result, setResult] = useState<ScaleCheckResult | null>(null);
    const [guideOpen, setGuideOpen] = useState(true);
    const [attempt, setAttempt] = useState(1);
    const [hintOpen, setHintOpen] = useState(false);

    const nextTask = () => {
        setTask(pickScaleTask(modeSelection, task?.key.id));
        setNotes([]);
        setResult(null);
        setAttempt(1);
    };

    const handleCheck = () => {
        if (!task || notes.length === 0) return;
        const r = checkScale(task.key, clef, notes);
        setResult(r);
        audio.playFeedback(r.correct);
    };

    // Zweiter Versuch: eigene Noten bleiben stehen und können korrigiert werden
    const retry = () => {
        setResult(null);
        setAttempt(2);
    };

    // --- Setup ---
    if (!started) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
                <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Übemodus – Tonleitern</h2>
                    <p className="text-slate-500 mb-6">Tonleitern in Ruhe bilden, mit Hilfe und zwei Versuchen.</p>

                    <ScaleSettings
                        modeSelection={modeSelection}
                        onModeChange={setModeSelection}
                        clef={clef}
                        onClefChange={setClef}
                    />

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={onBack}
                            className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            onClick={async () => {
                                await audio.init();
                                setStarted(true);
                                nextTask();
                            }}
                            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg transition-colors"
                        >
                            Üben starten
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!task) return <div className="text-center p-10">Laden...</div>;

    const annotations = result ? answerAnnotations(task.key, notes, result) : null;
    const finished = result && (result.correct || attempt === 2);

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
                    <h2 className="text-lg font-bold text-slate-700">Übemodus – Tonleitern</h2>
                </div>

                <ScaleTaskCard name={task.name} />

                {!result && (
                    <ScaleInputGuide collapsible open={guideOpen} onToggle={() => setGuideOpen((o) => !o)} />
                )}

                {attempt === 2 && !result && (
                    <p className="text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-2 px-3 mb-3">
                        2. Versuch: Korrigiere deine Noten und prüfe noch einmal.
                    </p>
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

                {/* Prüfen */}
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

                {/* Rückmeldung */}
                {result && (
                    <div className="mt-5 space-y-4">
                        <ScaleFeedback
                            keyDef={task.key}
                            clef={clef}
                            notes={notes}
                            result={result}
                            showSolution={attempt === 2}
                        />
                        <div className="flex justify-center">
                            {finished ? (
                                <button
                                    onClick={nextTask}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg transition-colors"
                                >
                                    Nächste Aufgabe <ArrowRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={retry}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg transition-colors"
                                >
                                    <RefreshCcw size={20} /> Nochmal versuchen
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Hilfe */}
                <div className="mt-6">
                    <button
                        onClick={() => setHintOpen(!hintOpen)}
                        className="flex items-center justify-between w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-semibold hover:bg-amber-100 transition-colors"
                    >
                        <span>💡 Hilfe anzeigen</span>
                        {hintOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {hintOpen && (
                        <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-slate-700 space-y-3 text-left">
                            <div>
                                <strong>Dur:</strong> 1 – 1 – ½ – 1 – 1 – 1 – ½
                                <span className="text-slate-500"> (Halbtonschritte zwischen 3–4 und 7–8)</span>
                            </div>
                            <div>
                                <strong>Moll:</strong> 1 – ½ – 1 – 1 – ½ – 1 – 1
                                <span className="text-slate-500"> (Halbtonschritte zwischen 2–3 und 5–6)</span>
                            </div>
                            <div className="pt-3 border-t border-amber-200 space-y-1">
                                <div>1 = Ganztonschritt, ½ = Halbtonschritt.</div>
                                <div>Jeder Notenname kommt genau einmal vor – nur der Grundton steht oben noch einmal.</div>
                                <div>Passt ein Abstand nicht, verändere den <em>oberen</em> Ton mit ♯ oder ♭.</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScalesPractice;
