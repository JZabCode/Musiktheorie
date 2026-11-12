import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toGermanLabel } from '../../lib/utils';
import type { NoteSelection } from '../../lib/utils';

// Re-export for consumers that import from this file
export type { NoteSelection };
export { toGermanLabel };

const NOTE_BUTTONS = [
    { letter: 'c', germanLabel: 'C' },
    { letter: 'd', germanLabel: 'D' },
    { letter: 'e', germanLabel: 'E' },
    { letter: 'f', germanLabel: 'F' },
    { letter: 'g', germanLabel: 'G' },
    { letter: 'a', germanLabel: 'A' },
    { letter: 'b', germanLabel: 'H' },
];

const NOTE_LETTERS = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

const POSITION_LABELS = ['Tiefster Ton', 'Mittlerer Ton', 'Oberster Ton'];



/**
 * Compute VexFlow display keys from user selections using Terzschichtung.
 * Root is placed at octave 4, subsequent notes are placed progressively higher.
 */
export function computeDisplayKeys(selections: NoteSelection[]): string[] {
    if (selections.length === 0) return [];

    let currentOctave = 4;
    let prevIndex = NOTE_LETTERS.indexOf(selections[0].letter);
    const keys = [`${selections[0].letter}${selections[0].accidental}/${currentOctave}`];

    for (let i = 1; i < selections.length; i++) {
        const noteIndex = NOTE_LETTERS.indexOf(selections[i].letter);
        if (noteIndex <= prevIndex) {
            currentOctave++;
        }
        keys.push(`${selections[i].letter}${selections[i].accidental}/${currentOctave}`);
        prevIndex = noteIndex;
    }

    return keys;
}

/**
 * Check if the user's pitch class selections match the correct VexFlow keys.
 * Compares only the pitch class (letter + accidental), not the octave.
 * Order matters (root, third, fifth).
 */
export function checkBuildPitchClasses(selections: NoteSelection[], correctKeys: string[]): boolean {
    if (selections.length !== correctKeys.length) return false;

    for (let i = 0; i < correctKeys.length; i++) {
        const [notePart] = correctKeys[i].split('/');
        const userPitchClass = selections[i].letter + selections[i].accidental;
        if (userPitchClass !== notePart) return false;
    }
    return true;
}


interface TriadBuildInputProps {
    /** Called when a note is confirmed and added */
    onNoteConfirm: (selection: NoteSelection) => void;
    /** Currently confirmed selections */
    confirmedSelections: NoteSelection[];
    /** Whether input is disabled */
    disabled: boolean;
    /** Feedback state */
    feedback: 'correct' | 'incorrect' | null;
    /** The correct VexFlow keys (for display after answer) */
    correctKeys: string[];
    /** Whether to reveal correct answer on incorrect feedback (default: true) */
    showCorrectAnswer?: boolean;
}

const TriadBuildInput: React.FC<TriadBuildInputProps> = ({
    onNoteConfirm,
    confirmedSelections,
    disabled,
    feedback,
    correctKeys,
    showCorrectAnswer = true,
}) => {
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [selectedAccidental, setSelectedAccidental] = useState<string>('');

    // Reset staging when feedback clears (new question)
    useEffect(() => {
        if (!feedback) {
            setSelectedLetter(null);
            setSelectedAccidental('');
        }
    }, [feedback]);

    const handleLetterClick = (letter: string) => {
        if (disabled) return;
        if (selectedLetter === letter) {
            // Deselect
            setSelectedLetter(null);
            setSelectedAccidental('');
        } else {
            setSelectedLetter(letter);
            setSelectedAccidental('');
        }
    };

    const handleAccidentalClick = (acc: string) => {
        if (disabled || !selectedLetter) return;
        setSelectedAccidental(prev => prev === acc ? '' : acc);
    };

    const handleConfirm = () => {
        if (disabled || !selectedLetter) return;
        onNoteConfirm({ letter: selectedLetter, accidental: selectedAccidental });
        setSelectedLetter(null);
        setSelectedAccidental('');
    };

    // Compute the currently staged note label for preview
    const stagedLabel = selectedLetter
        ? toGermanLabel({ letter: selectedLetter, accidental: selectedAccidental })
        : null;

    // --- Styling helpers ---
    const getLetterButtonClass = (letter: string) => {
        const base = 'font-bold text-sm transition-all rounded-xl ';

        if (feedback) {
            return base + 'bg-white text-slate-300 border-2 border-slate-200 cursor-default';
        }

        if (selectedLetter === letter) {
            return base + 'bg-rose-500 text-white border-2 border-rose-500 ring-2 ring-rose-300 shadow-md';
        }

        return base + 'bg-white text-slate-700 border-2 border-slate-200 hover:border-rose-400 hover:bg-rose-50';
    };

    const getAccidentalButtonClass = (acc: string) => {
        const base = 'font-bold text-lg transition-all rounded-xl ';

        if (feedback || !selectedLetter) {
            return base + 'bg-slate-50 text-slate-300 border-2 border-slate-200 cursor-not-allowed';
        }

        if (selectedAccidental === acc) {
            return base + 'bg-amber-500 text-white border-2 border-amber-500 ring-2 ring-amber-300 shadow-md';
        }

        return base + 'bg-white text-slate-700 border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50';
    };

    // Extract correct pitch classes for display in feedback
    const correctPitchClasses = correctKeys.map(k => {
        const [notePart] = k.split('/');
        const letter = notePart.charAt(0);
        const accidental = notePart.substring(1);
        return { letter, accidental } as NoteSelection;
    });

    return (
        <div className="mt-4 space-y-4">
            {/* Already confirmed notes display */}
            {confirmedSelections.length > 0 && (
                <div className="flex justify-center gap-4 flex-wrap">
                    {confirmedSelections.map((sel, i) => {
                        const label = toGermanLabel(sel);
                        let bgClass = 'bg-slate-100 border-slate-200 text-slate-700';

                        if (feedback === 'correct') {
                            bgClass = 'bg-emerald-100 border-emerald-300 text-emerald-700';
                        } else if (feedback === 'incorrect') {
                            // Check if THIS specific note is correct
                            const correctPC = correctPitchClasses[i];
                            if (correctPC && sel.letter + sel.accidental === correctPC.letter + correctPC.accidental) {
                                bgClass = 'bg-emerald-100 border-emerald-300 text-emerald-700';
                            } else {
                                bgClass = 'bg-rose-100 border-rose-300 text-rose-700';
                            }
                        }

                        return (
                            <div key={i} className={`px-4 py-2 rounded-lg border-2 text-center ${bgClass}`}>
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                                    {POSITION_LABELS[i]}
                                </div>
                                <div className="font-bold text-lg">{label}</div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Show correct answer on incorrect feedback (only when showCorrectAnswer is true) */}
            {feedback === 'incorrect' && showCorrectAnswer && (
                <div className="flex justify-center gap-2 text-sm text-emerald-700">
                    <span className="font-semibold">Richtig wäre:</span>
                    {correctPitchClasses.map((pc, i) => (
                        <span key={i} className="bg-emerald-100 px-2 py-0.5 rounded font-bold">
                            {toGermanLabel(pc)}
                        </span>
                    ))}
                </div>
            )}

            {/* Only show input if not all 3 notes are confirmed */}
            {confirmedSelections.length < 3 && !feedback && (
                <>
                    {/* Position label */}
                    <p className="text-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        {POSITION_LABELS[confirmedSelections.length]} wählen ({confirmedSelections.length + 1}/3)
                    </p>

                    {/* Stammton (letter) buttons */}
                    <div className="flex gap-2 justify-center">
                        {NOTE_BUTTONS.map(({ letter, germanLabel }) => (
                            <button
                                key={letter}
                                onClick={() => handleLetterClick(letter)}
                                disabled={disabled}
                                className={getLetterButtonClass(letter) + ' py-3 px-4 min-w-[44px]'}
                            >
                                {germanLabel}
                            </button>
                        ))}
                    </div>

                    {/* Accidental buttons + Confirm */}
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => handleAccidentalClick('#')}
                            disabled={disabled || !selectedLetter}
                            className={getAccidentalButtonClass('#') + ' py-2 px-5'}
                        >
                            ♯
                        </button>
                        <button
                            onClick={() => handleAccidentalClick('b')}
                            disabled={disabled || !selectedLetter}
                            className={getAccidentalButtonClass('b') + ' py-2 px-5'}
                        >
                            ♭
                        </button>

                        <div className="w-px h-8 bg-slate-200 mx-1" />

                        {/* "Ton hinzufügen" */}
                        <button
                            onClick={handleConfirm}
                            disabled={disabled || !selectedLetter}
                            className={`flex items-center gap-2 py-2 px-5 rounded-xl font-bold text-sm transition-all ${selectedLetter
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
                                : 'bg-slate-100 text-slate-300 border-2 border-slate-200 cursor-not-allowed'
                                }`}
                        >
                            <Plus size={16} />
                            {stagedLabel ? `${stagedLabel} hinzufügen` : 'Ton hinzufügen'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default TriadBuildInput;
