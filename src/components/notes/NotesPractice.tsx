import React, { useState, useCallback } from 'react';
import NotationDisplay from '../game/NotationDisplay';
import MnemonicNotation from './MnemonicNotation';
import { generateNoteQuestion, checkAnswer } from '../../lib/music';
import { audio } from '../../lib/audio';
import { ArrowLeft, ArrowRight, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import type { Question, Clef } from '../../types';

interface NotesPracticeProps {
    onBack: () => void;
}

const NotesPractice: React.FC<NotesPracticeProps> = ({ onBack }) => {
    const [phase, setPhase] = useState<'setup' | 'practicing'>('setup');
    const [clef, setClef] = useState<Clef>('treble');
    const [useAccidentals, setUseAccidentals] = useState(true);
    const [question, setQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [hintOpen, setHintOpen] = useState(false);
    const [wrongAttempts, setWrongAttempts] = useState(0);

    const nextQuestion = useCallback(() => {
        const q = generateNoteQuestion(clef, useAccidentals);
        setQuestion(q);
        setSelectedAnswer(null);
        setFeedback(null);
        setWrongAttempts(0);
    }, [clef, useAccidentals]);

    const handleAnswer = (answer: string) => {
        if (feedback === 'correct' || !question) return;

        setSelectedAnswer(answer);
        const correct = checkAnswer(answer, question.answer, 'choice');

        if (correct) {
            setFeedback('correct');
            audio.playFeedback(true);
        } else {
            setWrongAttempts(prev => prev + 1);
            setFeedback('incorrect');
            audio.playFeedback(false);
        }
    };

    const getMnemonics = () => {
        if (clef === 'treble') {
            return {
                lines: { label: 'Linien (von unten)', notes: 'e1 – g1 – h1 – d2 – f2', mnemonic: '„Eine Gans Hat Dicke Füße"' },
                spaces: { label: 'Zwischenräume (von unten)', notes: 'f1 – a1 – c2 – e2', mnemonic: '„FACE"' },
            };
        }
        return {
            lines: { label: 'Linien (von unten)', notes: 'G – H – d – f – a', mnemonic: '„Gute Herren Danken Frau Ada"' },
            spaces: { label: 'Zwischenräume (von unten)', notes: 'A – c – e – g', mnemonic: '„Alle Clowns Essen Gummibärchen"' },
        };
    };

    // --- Setup Screen ---
    if (phase === 'setup') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
                <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Übemodus-Einstellungen</h2>
                    <p className="text-slate-500 mb-6">Wähle die Konfiguration für den Übemodus.</p>

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
                    <div className="mb-8">
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
                                setPhase('practicing');
                                nextQuestion();
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

    const mnemonics = getMnemonics();

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
                    <NotationDisplay question={question.question} />
                </div>

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
                        <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                            <div className="mb-4">
                                <strong className="text-slate-700">{mnemonics.lines.label}:</strong>
                                <div className="text-slate-600 mt-1">{mnemonics.lines.notes}</div>
                                <div className="text-amber-700 font-medium mt-1">{mnemonics.lines.mnemonic}</div>
                                <MnemonicNotation clef={clef} type="lines" />
                            </div>
                            <div>
                                <strong className="text-slate-700">{mnemonics.spaces.label}:</strong>
                                <div className="text-slate-600 mt-1">{mnemonics.spaces.notes}</div>
                                <div className="text-amber-700 font-medium mt-1">{mnemonics.spaces.mnemonic}</div>
                                <MnemonicNotation clef={clef} type="spaces" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Answer Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {question.options.map((opt, i) => {
                        let btnClass = 'py-3 px-2 rounded-lg border-2 font-semibold text-sm transition-all ';

                        if (selectedAnswer === opt && feedback === 'correct') {
                            btnClass += 'bg-emerald-500 text-white border-emerald-500';
                        } else if (selectedAnswer === opt && feedback === 'incorrect') {
                            btnClass += 'bg-rose-500 text-white border-rose-500';
                        } else if (feedback === 'incorrect' && opt === question.answer && wrongAttempts > 1) {
                            btnClass += 'border-emerald-500 text-emerald-600 bg-white';
                        } else if ((feedback === 'correct' || wrongAttempts > 1) && selectedAnswer !== opt && opt !== question.answer) {
                            btnClass += 'bg-white border-slate-200 text-slate-300';
                        } else {
                            btnClass += 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50';
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => handleAnswer(opt)}
                                disabled={feedback === 'correct' || wrongAttempts > 1}
                                className={btnClass}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback / Next */}
                <div className="min-h-[80px] mt-6 flex justify-center">
                    {feedback === 'correct' && (
                        <button
                            onClick={nextQuestion}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-colors"
                        >
                            Nächste Aufgabe <ArrowRight size={20} />
                        </button>
                    )}
                    {feedback === 'incorrect' && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col items-center gap-3 text-center max-w-md">
                            <div className="text-rose-600 font-bold flex items-center gap-2">
                                <RefreshCcw size={20} /> {wrongAttempts > 1 ? 'Leider falsch. Die richtige Lösung wird angezeigt.' : 'Versuch es nochmal!'}
                            </div>
                            {wrongAttempts === 1 && (
                                <div className="text-slate-600 text-sm">
                                    Tipp: Nutze die Hilfe-Box oben für Merksätze.
                                </div>
                            )}
                            {wrongAttempts > 1 && (
                                <button
                                    onClick={nextQuestion}
                                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-colors"
                                >
                                    Nächste Aufgabe <ArrowRight size={20} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotesPractice;
