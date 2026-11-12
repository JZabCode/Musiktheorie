import React from 'react';
import { Volume2, Check, X } from 'lucide-react';
import type { Clef } from '../../types';
import { keyShortName, type KeyDef } from '../../lib/circleOfFifths';
import {
    STEP_PATTERN, formatStep, halfStepIndices, noteLabel, stepSizes, toneName,
    type ModeSelection, type ScaleCheckResult, type ScaleNote,
} from '../../lib/scales';
import { audio } from '../../lib/audio';
import ScaleStaff, { type StaffText } from './ScaleStaff';

export const RESULT_COLORS = { correct: '#059669', wrong: '#e11d48', extra: '#e11d48', neutral: '#94a3b8' };

// --- Einstellungen (Übe- und Quizmodus) ---

interface ScaleSettingsProps {
    modeSelection: ModeSelection;
    onModeChange: (m: ModeSelection) => void;
    clef: Clef;
    onClefChange: (c: Clef) => void;
}

export const ScaleSettings: React.FC<ScaleSettingsProps> = ({ modeSelection, onModeChange, clef, onClefChange }) => (
    <div className="space-y-3 mb-6 text-left">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-3">Tongeschlecht</h4>
            <div className="grid grid-cols-3 gap-2">
                {([
                    ['major', 'Dur'],
                    ['minor', 'Moll'],
                    ['both', 'Dur & Moll'],
                ] as [ModeSelection, string][]).map(([value, label]) => (
                    <button
                        key={value}
                        onClick={() => onModeChange(value)}
                        className={`py-2 rounded-lg border-2 font-semibold transition-colors ${modeSelection === value ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
                <h4 className="font-bold text-slate-800">Bassschlüssel</h4>
                <p className="text-sm text-slate-500">Tonleitern im Bass- statt im Violinschlüssel bilden</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={clef === 'bass'}
                    onChange={(e) => onClefChange(e.target.checked ? 'bass' : 'treble')}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
        </div>
    </div>
);

// --- Aufgabe ---

export const ScaleTaskCard: React.FC<{ name: string }> = ({ name }) => (
    <div className="text-center mb-4">
        <p className="text-slate-500 font-medium mb-2">Bilde die Tonleiter:</p>
        <div className="inline-block bg-teal-50 border-2 border-teal-200 rounded-xl px-6 py-3">
            <div className="text-2xl font-bold text-teal-700">{name}</div>
        </div>
        <p className="text-xs text-slate-400 mt-3">
            Aufsteigend ab dem Grundton notieren – 7 Töne, oder 8 mit dem Grundton oben.
        </p>
    </div>
);

// --- Korrektur ---

/** Farben, Namen und Schrittgrößen für die geprüfte Eingabe. */
export function answerAnnotations(key: KeyDef, notes: ScaleNote[], result: ScaleCheckResult) {
    const pattern = STEP_PATTERN[key.mode];
    const noteColors = result.noteResults.map((r) => RESULT_COLORS[r]);
    const labels: StaffText[] = notes.map((n, i) => ({ text: noteLabel(n), color: noteColors[i] }));
    const steps: StaffText[] = stepSizes(notes).map((s, i) => ({
        text: formatStep(s),
        color: i < pattern.length ? (s === pattern[i] ? RESULT_COLORS.correct : RESULT_COLORS.wrong) : RESULT_COLORS.neutral,
    }));
    return { noteColors, labels, steps };
}

export function feedbackMessages(key: KeyDef, notes: ScaleNote[], result: ScaleCheckResult): string[] {
    const messages: string[] = [];
    if (result.extra > 0) {
        messages.push(`Du hast ${notes.length} Töne notiert – eine Tonleiter hat 7 verschiedene Töne, mit dem Grundton oben 8.`);
    }
    if (result.missing > 0) {
        messages.push(result.missing === 1
            ? 'Es fehlt noch 1 Ton – eine Tonleiter hat 7 verschiedene Töne, mit dem Grundton oben 8.'
            : `Es fehlen noch ${result.missing} Töne – eine Tonleiter hat 7 verschiedene Töne, mit dem Grundton oben 8.`);
    }
    if (result.noteResults[0] === 'wrong') {
        messages.push(`Der erste Ton muss der Grundton ${keyShortName(key)} sein.`);
    }
    const wrong = result.noteResults.filter((r) => r === 'wrong').length;
    if (wrong > 0) {
        messages.push(wrong === 1 ? '1 Ton ist falsch (rot markiert).' : `${wrong} Töne sind falsch (rot markiert).`);
    }
    if (notes.length > 1) {
        const halves = halfStepIndices(key.mode).map((i) => `${i + 1}–${i + 2}`).join(' und ');
        messages.push(`Unter den Noten siehst du deine Abstände (1 = Ganztonschritt, ½ = Halbtonschritt). Halbtonschritte gehören zwischen die Töne ${halves}.`);
    }
    return messages;
}

const playScale = (notes: ScaleNote[]) => audio.playArpeggioChord(notes.map(toneName), 0.4, '4n');

export const ListenButton: React.FC<{ notes: ScaleNote[]; label: string }> = ({ notes, label }) => (
    <button
        onClick={() => playScale(notes)}
        disabled={notes.length === 0}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors disabled:opacity-40"
    >
        <Volume2 size={16} /> {label}
    </button>
);

interface ScaleSolutionProps {
    keyDef: KeyDef;
    clef: Clef;
    solution: ScaleNote[];
    title?: string;
}

/** Richtige Tonleiter mit Namen, Abständen und Halbtonbögen. */
export const ScaleSolution: React.FC<ScaleSolutionProps> = ({ keyDef, clef, solution, title = 'So ist es richtig:' }) => (
    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <span className="font-bold text-teal-800">{title}</span>
            <ListenButton notes={solution} label="Anhören" />
        </div>
        <div className="bg-white rounded-lg border border-teal-100 px-2 py-1 overflow-x-auto">
            <ScaleStaff
                clef={clef}
                notes={solution}
                labels={solution.map((n) => ({ text: noteLabel(n), color: '#0f766e' }))}
                showDegrees
                steps={stepSizes(solution).map((s) => ({ text: formatStep(s), color: s === 1 ? '#0d9488' : '#475569' }))}
                halfStepArcs={halfStepIndices(keyDef.mode)}
                ariaLabel="Lösung"
            />
        </div>
    </div>
);

interface ScaleFeedbackProps {
    keyDef: KeyDef;
    clef: Clef;
    notes: ScaleNote[];
    result: ScaleCheckResult;
    showSolution: boolean;
}

/** Rückmeldung nach dem Prüfen: Hinweise und (optional) die Lösung. */
export const ScaleFeedback: React.FC<ScaleFeedbackProps> = ({ keyDef, clef, notes, result, showSolution }) => {
    if (result.correct) {
        return (
            <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-center gap-2">
                    <Check size={24} className="text-emerald-600" />
                    <span className="text-emerald-700 font-bold text-lg">Richtig!</span>
                </div>
                <ScaleSolution
                    keyDef={keyDef}
                    clef={clef}
                    solution={result.solution}
                    title={result.withoutOctave
                        ? 'Mit dem Grundton oben (8. Ton) sieht deine Tonleiter so aus:'
                        : 'Deine Tonleiter mit Halbtonschritten:'}
                />
            </div>
        );
    }
    return (
        <div className="space-y-3">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-left">
                <div className="text-rose-600 font-bold flex items-center gap-2 mb-2">
                    <X size={20} /> Das stimmt noch nicht.
                </div>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    {feedbackMessages(keyDef, notes, result).map((m) => <li key={m}>{m}</li>)}
                </ul>
                <div className="mt-3">
                    <ListenButton notes={notes} label="Deine Tonleiter anhören" />
                </div>
            </div>
            {showSolution && <ScaleSolution keyDef={keyDef} clef={clef} solution={result.solution} />}
        </div>
    );
};
