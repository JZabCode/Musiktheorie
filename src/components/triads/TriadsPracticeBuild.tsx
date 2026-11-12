import React, { useState, useCallback } from 'react';
import TriadBuildNotation from './TriadBuildNotation';
import NotationDisplay from '../game/NotationDisplay';
import TriadBuildInput, { checkBuildPitchClasses } from './TriadBuildInput';
import type { NoteSelection } from './TriadBuildInput';
import { generateTriadBuildQuestion } from '../../lib/music';
import { audio } from '../../lib/audio';
import { ArrowLeft, ArrowRight, RefreshCcw, ChevronDown, ChevronUp, Undo2, Check } from 'lucide-react';
import type { TriadBuildQuestion } from '../../lib/music';

interface TriadsPracticeBuildProps {
    onBack: () => void;
}

const TriadsPracticeBuild: React.FC<TriadsPracticeBuildProps> = ({ onBack }) => {
    const [question, setQuestion] = useState<TriadBuildQuestion | null>(null);
    const [selections, setSelections] = useState<NoteSelection[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [attempt, setAttempt] = useState(1); // 1 = first try, 2 = second try
    const [hintOpen, setHintOpen] = useState(false);
    const [started, setStarted] = useState(false);

    // Setup options
    const [allowInversions, setAllowInversions] = useState(false);

    const nextQuestion = useCallback(() => {
        const q = generateTriadBuildQuestion({ allowInversions });
        setQuestion(q);
        setSelections([]);
        setFeedback(null);
        setAttempt(1);
    }, [allowInversions]);

    const retryQuestion = () => {
        setSelections([]);
        setFeedback(null);
        setAttempt(2);
    };

    const handleNoteConfirm = (sel: NoteSelection) => {
        if (feedback || !question) return;
        if (selections.length >= 3) return;

        const newSelections = [...selections, sel];
        setSelections(newSelections);

        // After the 3rd note, check the answer
        if (newSelections.length === 3) {
            const isCorrect = checkBuildPitchClasses(newSelections, question.correctKeys);
            if (isCorrect) {
                setFeedback('correct');
                audio.playFeedback(true);
            } else {
                setFeedback('incorrect');
                audio.playFeedback(false);
            }
        }
    };

    const handleUndo = () => {
        if (feedback || selections.length === 0) return;
        setSelections(prev => prev.slice(0, -1));
    };

    // --- Setup Screen ---
    if (!started) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
                <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Übemodus – Bilden</h2>
                    <p className="text-slate-500 mb-6">Dreiklänge bilden – wähle die richtigen Töne aus.</p>

                    {/* Difficulty Toggle */}
                    <div className="space-y-3 mb-8 text-left">
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
                                const q = generateTriadBuildQuestion({ allowInversions });
                                setQuestion(q);
                                setSelections([]);
                                setFeedback(null);
                                setAttempt(1);
                            }}
                            className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg transition-colors"
                        >
                            Üben starten
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Practicing Screen ---
    if (!question) return <div className="text-center p-10">Laden...</div>;

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
                    <h2 className="text-lg font-bold text-slate-700">Übemodus – Bilden</h2>
                </div>

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
                <div className="flex justify-center my-6">
                    <TriadBuildNotation selections={selections} width={200} />
                </div>

                {/* Undo Button */}
                {selections.length > 0 && !feedback && (
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={handleUndo}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors text-sm"
                        >
                            <Undo2 size={16} /> Letzten Ton entfernen
                        </button>
                    </div>
                )}

                {/* Collapsible Hint Box */}
                <div className="mb-4">
                    <button
                        onClick={() => setHintOpen(!hintOpen)}
                        className="flex items-center justify-between w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-semibold hover:bg-amber-100 transition-colors"
                    >
                        <span>💡 Hilfe anzeigen</span>
                        {hintOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {hintOpen && (
                        <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm space-y-3">
                            <div>
                                <strong className="text-slate-700">Dur:</strong>
                                <span className="text-slate-600 ml-2">Große Terz + Kleine Terz (4 + 3 Halbtonschritte)</span>
                            </div>
                            <div>
                                <strong className="text-slate-700">Moll:</strong>
                                <span className="text-slate-600 ml-2">Kleine Terz + Große Terz (3 + 4 Halbtonschritte)</span>
                            </div>
                            <div>
                                <strong className="text-slate-700">Vermindert:</strong>
                                <span className="text-slate-600 ml-2">Kleine Terz + Kleine Terz (3 + 3 Halbtonschritte)</span>
                            </div>
                            <div>
                                <strong className="text-slate-700">Übermäßig:</strong>
                                <span className="text-slate-600 ml-2">Große Terz + Große Terz (4 + 4 Halbtonschritte)</span>
                            </div>
                            {allowInversions && (
                                <div className="pt-3 mt-3 border-t border-amber-200">
                                    <strong className="text-slate-700 block mb-1">Umkehrungen erkennen:</strong>
                                    <p className="text-slate-600 mb-3">Schaue auf die Intervalle zwischen den drei Tönen — hier am Beispiel von C-Dur:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                                        {[
                                            { keys: ['c/4', 'e/4', 'g/4'], rootIndex: 0, label: 'Grundstellung', intervals: 'Terz + Terz', root: 'Grundton ist unten' },
                                            { keys: ['e/4', 'g/4', 'c/5'], rootIndex: 2, label: '1. Umkehrung', intervals: 'Terz unten, Quart oben', root: 'Grundton ist oben' },
                                            { keys: ['g/4', 'c/5', 'e/5'], rootIndex: 1, label: '2. Umkehrung', intervals: 'Quart unten, Terz oben', root: 'Grundton ist in der Mitte' },
                                        ].map((inv) => (
                                            <div key={inv.label} className="bg-white border border-amber-200 rounded-lg p-2 flex flex-col items-center">
                                                <div className="overflow-hidden" style={{ height: 115, width: 150 }}>
                                                    <div style={{ marginTop: -25 }}>
                                                        <NotationDisplay
                                                            question={{ keys: inv.keys, clef: 'treble' as const }}
                                                            width={150}
                                                            height={150}
                                                            keyStyles={inv.keys.map((_, i) =>
                                                                i === inv.rootIndex ? { fillStyle: '#e11d48', strokeStyle: '#e11d48' } : null
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-center text-xs leading-tight">
                                                    <div className="font-bold text-slate-700">{inv.label}</div>
                                                    <div className="text-slate-600">{inv.intervals}</div>
                                                    <div className="text-slate-500 italic">({inv.root})</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Note Selection */}
                <TriadBuildInput
                    onNoteConfirm={handleNoteConfirm}
                    confirmedSelections={selections}
                    disabled={!!feedback}
                    feedback={feedback}
                    correctKeys={question.correctKeys}
                    showCorrectAnswer={attempt === 2}
                />

                {/* Feedback / Next */}
                <div className="min-h-[80px] mt-6 flex justify-center">
                    {feedback === 'correct' && (
                        <div className="flex flex-col items-center gap-3">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2 text-center">
                                <Check size={24} className="text-emerald-600" />
                                <span className="text-emerald-700 font-bold text-lg">Richtig!</span>
                            </div>
                            <button
                                onClick={nextQuestion}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg transition-colors"
                            >
                                Nächste Aufgabe <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                    {feedback === 'incorrect' && attempt === 1 && (
                        <div className="flex flex-col items-center gap-3">
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col items-center gap-2 text-center max-w-md">
                                <div className="text-rose-600 font-bold flex items-center gap-2">
                                    <RefreshCcw size={20} /> Das war leider nicht richtig.
                                </div>
                                <div className="text-slate-600 text-sm">
                                    Versuche es nochmal! Nutze die Hilfe-Box für Dreiklang-Merkmale.
                                </div>
                            </div>
                            <button
                                onClick={retryQuestion}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg transition-colors"
                            >
                                <RefreshCcw size={20} /> Nochmal versuchen
                            </button>
                        </div>
                    )}
                    {feedback === 'incorrect' && attempt === 2 && (
                        <div className="flex flex-col items-center gap-3">
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col items-center gap-2 text-center max-w-md">
                                <div className="text-rose-600 font-bold flex items-center gap-2">
                                    <RefreshCcw size={20} /> Leider auch im zweiten Versuch nicht richtig.
                                </div>
                                <div className="text-slate-600 text-sm">
                                    Nutze die Hilfe-Box für Dreiklang-Merkmale.
                                </div>
                            </div>
                            <button
                                onClick={nextQuestion}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg transition-colors"
                            >
                                Nächste Aufgabe <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TriadsPracticeBuild;
