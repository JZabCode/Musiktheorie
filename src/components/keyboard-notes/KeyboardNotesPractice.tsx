import React, { useState, useCallback } from 'react';
import NotationDisplay from '../game/NotationDisplay';
import Piano from '../game/Piano';
import KeyboardStaffMap from './KeyboardStaffMap';
import { generateNoteQuestion, checkAnswer } from '../../lib/music';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import type { Question, Clef } from '../../types';

interface KeyboardNotesPracticeProps {
    onBack: () => void;
}

const KeyboardNotesPractice: React.FC<KeyboardNotesPracticeProps> = ({ onBack }) => {
    const [phase, setPhase] = useState<'setup' | 'practicing'>('setup');
    const [clef, setClef] = useState<Clef>('treble');
    const [useAccidentals, setUseAccidentals] = useState(true);
    const [question, setQuestion] = useState<Question | null>(null);
    const [selectedPianoNote, setSelectedPianoNote] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [attempts, setAttempts] = useState(0);
    const [hintOpen, setHintOpen] = useState(false);
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
        } else {
            setFeedback('incorrect');
            setAttempts(prev => prev + 1);
        }
    };

    const pianoStartOctave = clef === 'bass' ? 2 : 4;
    const pianoEndOctave = clef === 'bass' ? 3 : 5;

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
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                            onClick={() => {
                                setPhase('practicing');
                                nextQuestion();
                            }}
                            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition-colors"
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
            <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
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
                <div className="flex justify-center my-4">
                    <NotationDisplay question={question.question} width={180} height={200} />
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
                        <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                            <p className="text-slate-700 mb-2">
                                <strong>Tipp:</strong> Finde die Note auf der Klaviatur. Zähle die Tasten ab einem
                                Orientierungspunkt, den du sicher kennst – am besten ab dem <strong>C</strong>.
                            </p>
                            <p className="text-slate-600 mb-2">
                                Die weißen Tasten heißen <strong>C – D – E – F – G – A – H</strong>, danach beginnt die
                                Reihe mit dem nächsten C von vorne. Schwarze Tasten liegen jeweils zwischen zwei weißen
                                Tasten – außer zwischen <strong>E–F</strong> und <strong>H–C</strong>.
                            </p>
                            <p className="text-slate-600 mb-3">
                                So orientierst du dich schnell: Das <strong>C</strong> liegt immer links von einer
                                <strong> 2er-Gruppe</strong> schwarzer Tasten, das <strong>F</strong> links von einer
                                <strong> 3er-Gruppe</strong>.
                            </p>

                            <div className="bg-white rounded-xl border border-amber-200 p-3 my-3">
                                <KeyboardStaffMap />
                            </div>
                        </div>
                    )}
                </div>

                {/* Feedback */}
                {feedback && (
                    <div className={`text-center py-2 mb-2 rounded-lg font-bold ${feedback === 'correct' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
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

                {/* Next Button */}
                <div className="min-h-[80px] mt-6 flex justify-center">
                    {feedback === 'correct' && (
                        <button
                            onClick={nextQuestion}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition-colors"
                        >
                            Nächste Aufgabe <ArrowRight size={20} />
                        </button>
                    )}
                    {feedback === 'incorrect' && attempts >= 2 && (
                        <button
                            onClick={nextQuestion}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-bold shadow-lg transition-colors"
                        >
                            Nächste Aufgabe <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KeyboardNotesPractice;
