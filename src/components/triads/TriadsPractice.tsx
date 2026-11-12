import React, { useState, useCallback } from 'react';
import NotationDisplay from '../game/NotationDisplay';
import TriadAnswerInput from './TriadAnswerInput';
import { generateTriadQuestion, checkAnswer } from '../../lib/music';
import { audio } from '../../lib/audio';
import { ArrowLeft, ArrowRight, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import type { Question } from '../../types';

interface TriadsPracticeProps {
    onBack: () => void;
}

const TriadsPractice: React.FC<TriadsPracticeProps> = ({ onBack }) => {
    const [question, setQuestion] = useState<Question | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [hintOpen, setHintOpen] = useState(false);
    const [started, setStarted] = useState(false);

    // Setup options
    const [allowInversions, setAllowInversions] = useState(false);
    const [allowWideVoicing, setAllowWideVoicing] = useState(false);

    const nextQuestion = useCallback(() => {
        const q = generateTriadQuestion({ allowInversions, allowWideVoicing });
        setQuestion(q);
        setFeedback(null);
    }, [allowInversions, allowWideVoicing]);

    const handleAnswer = (answer: string) => {
        if (feedback === 'correct' || !question) return;

        const correct = checkAnswer(answer, question.answer, 'choice');

        if (correct) {
            setFeedback('correct');
            audio.playFeedback(true);
        } else {
            setFeedback('incorrect');
            audio.playFeedback(false);
        }
    };

    // --- Setup Screen ---
    if (!started) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
                <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Übemodus</h2>
                    <p className="text-slate-500 mb-6">Dreiklänge bestimmen – ohne Zeitdruck, mit Erklärungen.</p>

                    {/* Difficulty Toggles */}
                    <div className="space-y-3 mb-8 text-left">
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <h4 className="font-bold text-slate-800">Umkehrungen</h4>
                                <p className="text-sm text-slate-500">Auch 1. und 2. Umkehrung abfragen</p>
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

                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <h4 className="font-bold text-slate-800">Weite Lage</h4>
                                <p className="text-sm text-slate-500">Akkorde auch in weiter Lage darstellen</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={allowWideVoicing}
                                    onChange={(e) => setAllowWideVoicing(e.target.checked)}
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
                                // Important: pass current options into the generator
                                const q = generateTriadQuestion({ allowInversions, allowWideVoicing });
                                setQuestion(q);
                                setFeedback(null);
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
                    <h2 className="text-lg font-bold text-slate-700">Übemodus</h2>
                </div>

                {/* Question: VexFlow Notation */}
                <div className="flex justify-center my-6">
                    <NotationDisplay question={question.question} width={200} />
                </div>

                <p className="text-center text-slate-500 mb-4 font-medium">Welcher Dreiklang ist das?</p>

                {/* Collapsible Hint Box */}
                <div className="mb-6">
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
                            {allowWideVoicing && (
                                <div className="pt-3 mt-3 border-t border-amber-200">
                                    <strong className="text-slate-700 block mb-1">Weite Lage erkennen:</strong>
                                    <ul className="text-slate-600 list-disc list-inside space-y-1 mb-3">
                                        <li>Die Töne des Akkords liegen in großen Abständen vor, der „Schneemann" ist nicht erkennbar.</li>
                                        <li>Bestimme zuerst die drei Tonbuchstaben.</li>
                                        <li>Verschiebe die Töne entweder eine Oktave nach unten oder oben — und zwar so, dass ein „Schneemann" entsteht.</li>
                                        <li>Beachte: Die Töne inkl. der Vorzeichen dürfen dabei nicht in andere Namen getauscht werden; du darfst immer nur die Oktavlage ändern, z.&nbsp;B. c2 → c1 oder gis zu gis1.</li>
                                        <li>Wenn du den „Schneemann" gebildet hast, kannst du den Akkord wie gewohnt bestimmen.</li>
                                    </ul>
                                    <p className="text-slate-700 font-semibold mb-2">Beispiel: C-Dur</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { keys: ['c/4', 'g/4', 'e/5'], rootIndex: 0, octavatedIndex: 2, label: 'Weite Lage', notes: 'c1 – g1 – e2', hint: 'kein Schneemann erkennbar' },
                                            { keys: ['c/4', 'e/4', 'g/4'], rootIndex: 0, octavatedIndex: 1, label: 'Schneemann', notes: 'c1 – e1 – g1', hint: 'Töne in Terzen gestapelt' },
                                        ].map((ex) => (
                                            <div key={ex.label} className="bg-white border border-amber-200 rounded-lg p-2 flex flex-col items-center">
                                                <div className="overflow-hidden" style={{ height: 115, width: 150 }}>
                                                    <div style={{ marginTop: -25 }}>
                                                        <NotationDisplay
                                                            question={{ keys: ex.keys, clef: 'treble' as const }}
                                                            width={150}
                                                            height={150}
                                                            keyStyles={ex.keys.map((_, i) => {
                                                                if (i === ex.rootIndex) return { fillStyle: '#e11d48', strokeStyle: '#e11d48' };
                                                                if (i === ex.octavatedIndex) return { fillStyle: '#2563eb', strokeStyle: '#2563eb' };
                                                                return null;
                                                            })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-center text-xs leading-tight">
                                                    <div className="font-bold text-slate-700">{ex.label}</div>
                                                    <div className="text-slate-600">{ex.notes}</div>
                                                    <div className="text-slate-500 italic">({ex.hint})</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-slate-600 mt-2 italic">💡 Hier wurde nur das e2 eine Oktave nach unten verschoben (e2 → e1). Die Tonbuchstaben bleiben gleich (c–e–g), aber der Schneemann wird sichtbar — also C-Dur in Grundstellung.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Answer Input: Keyboard + Triad Type (+ Inversion when active) */}
                <TriadAnswerInput
                    onAnswer={handleAnswer}
                    disabled={feedback === 'correct'}
                    feedback={feedback}
                    correctAnswer={question.answer}
                    allowInversions={allowInversions}
                />

                {/* Feedback / Next */}
                <div className="min-h-[80px] mt-6 flex justify-center">
                    {feedback === 'correct' && (
                        <button
                            onClick={nextQuestion}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg transition-colors"
                        >
                            Nächste Aufgabe <ArrowRight size={20} />
                        </button>
                    )}
                    {feedback === 'incorrect' && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col items-center gap-2 text-center max-w-md">
                            <div className="text-rose-600 font-bold flex items-center gap-2">
                                <RefreshCcw size={20} /> Versuch es nochmal!
                            </div>
                            <div className="text-slate-600 text-sm">
                                Tipp: Nutze die Hilfe-Box oben für Dreiklang-Merkmale.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TriadsPractice;
