import React, { useState, useCallback } from 'react';
import IntervalBuildNotation from './IntervalBuildNotation';
import IntervalBuildInput from './IntervalBuildInput';
import type { NoteSelection } from './IntervalBuildInput';
import { generateIntervalBuildQuestion } from '../../lib/music';
import type { IntervalBuildQuestion } from '../../lib/music';
import { audio } from '../../lib/audio';
import { ArrowLeft, ArrowRight, RefreshCcw, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface IntervalPracticeBuildProps {
    onBack: () => void;
}

const IntervalPracticeBuild: React.FC<IntervalPracticeBuildProps> = ({ onBack }) => {
    const [question, setQuestion] = useState<IntervalBuildQuestion | null>(null);
    const [selection, setSelection] = useState<NoteSelection | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [attempt, setAttempt] = useState(1);
    const [hintOpen, setHintOpen] = useState(false);
    const [started, setStarted] = useState(false);
    const [allowBassClef, setAllowBassClef] = useState(false);

    const nextQuestion = useCallback(() => {
        const q = generateIntervalBuildQuestion('practice', {
            clefMode: allowBassClef ? 'mixed' : 'treble',
        });
        setQuestion(q);
        setSelection(null);
        setFeedback(null);
        setAttempt(1);
    }, [allowBassClef]);

    const retryQuestion = () => {
        setSelection(null);
        setFeedback(null);
        setAttempt(2);
    };

    const handleNoteConfirm = (sel: NoteSelection) => {
        if (feedback || !question) return;

        setSelection(sel);

        // Calculate actual VexFlow key format from the selection to check answer
        // Note: interval building only has one correct key (the second note)
        const correctTargetKey = question.correctKeys[1];
        const [correctNotePart] = correctTargetKey.split('/');
        const correctPitchClass = correctNotePart;

        const userPitchClass = sel.letter + sel.accidental;

        if (userPitchClass === correctPitchClass) {
            setFeedback('correct');
            audio.playFeedback(true);
        } else {
            setFeedback('incorrect');
            audio.playFeedback(false);
        }
    };

    // --- Start Screen ---
    if (!started) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
                <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Übemodus – Notenbild bilden</h2>
                    <p className="text-slate-500 mb-6">Intervalle im Notenbild bilden – wähle den richtigen Zielton aus.</p>

                    {/* Difficulty Toggle */}
                    <div className="space-y-3 mb-8 text-left">
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <h4 className="font-bold text-slate-800">Auch Intervalle im Bassschlüssel abfragen</h4>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={allowBassClef}
                                    onChange={(e) => setAllowBassClef(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
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
                                const q = generateIntervalBuildQuestion('practice', {
                                    clefMode: allowBassClef ? 'mixed' : 'treble',
                                });
                                setQuestion(q);
                                setSelection(null);
                                setFeedback(null);
                                setAttempt(1);
                            }}
                            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-colors"
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
                        <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm space-y-3 text-center">
                            <div>
                                <strong className="text-slate-700">{question.intervalName}</strong>
                            </div>
                            <div className="text-slate-600">
                                <strong>Grobbestimmung:</strong> {question.intervalRough} Stammtöne Abstand
                            </div>
                            <div className="text-slate-600">
                                <strong>Feinbestimmung:</strong> {question.intervalSemitones} Halbtonschritte
                            </div>
                        </div>
                    )}
                </div>

                {/* Note Selection */}
                <IntervalBuildInput
                    onNoteConfirm={handleNoteConfirm}
                    confirmedSelection={selection}
                    disabled={!!feedback}
                    feedback={feedback}
                    correctKey={question.correctKeys[1]}
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
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-colors"
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
                                    Versuche es nochmal! Nutze die Hilfe-Box.
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
                                    Präge dir die richtige Lösung ein.
                                </div>
                            </div>
                            <button
                                onClick={nextQuestion}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-colors"
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

export default IntervalPracticeBuild;
