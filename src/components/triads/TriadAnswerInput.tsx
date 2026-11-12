import React, { useState, useEffect } from 'react';
import { INTERVAL_NOTES, INVERSIONS } from '../../lib/music';
import type { Inversion } from '../../lib/music';

// Note indices matching INTERVAL_NOTES: C=0, Cis/Des=1, D=2, Dis/Es=3, E=4, F=5, Fis/Ges=6, G=7, Gis/As=8, A=9, Ais/B=10, H=11
const WHITE_NOTE_INDICES = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, H
const BLACK_NOTE_INDICES = [1, 3, 6, 8, 10]; // Cis/Des, Dis/Es, Fis/Ges, Gis/As, Ais/B

const TRIAD_TYPES = ['Dur', 'Moll', 'Vermindert', 'Übermäßig'];

// Map INTERVAL_NOTES labels to all possible german root names used in answers
const NOTE_LABEL_TO_GERMAN: Record<string, string[]> = {
    'C': ['C'],
    'Cis/Des': ['Cis', 'Des'],
    'D': ['D'],
    'Dis/Es': ['Dis', 'Es'],
    'E': ['E'],
    'F': ['F'],
    'Fis/Ges': ['Fis', 'Ges'],
    'G': ['G'],
    'Gis/As': ['Gis', 'As'],
    'A': ['A'],
    'Ais/B': ['Ais', 'B'],
    'H': ['H'],
};

interface TriadAnswerInputProps {
    onAnswer: (answer: string) => void;
    disabled: boolean;
    feedback: 'correct' | 'incorrect' | null;
    /** Correct answer string. Either "C-Dur" or (when inversions enabled) "C-Dur 1. Umkehrung". */
    correctAnswer: string;
    /** When true, a third step appears to select the inversion before submitting. */
    allowInversions?: boolean;
}

const TriadAnswerInput: React.FC<TriadAnswerInputProps> = ({
    onAnswer,
    disabled,
    feedback,
    correctAnswer,
    allowInversions = false,
}) => {
    const [selectedNoteIndex, setSelectedNoteIndex] = useState<number | null>(null);
    const [selectedTriadType, setSelectedTriadType] = useState<string | null>(null);
    const [selectedInversion, setSelectedInversion] = useState<Inversion | null>(null);

    // Parse the correct answer. Format: "Root-Type" or "Root-Type Inversion"
    // Examples: "C-Dur", "C-Dur Grundstellung", "C-Dur 1. Umkehrung"
    const dashIdx = correctAnswer.indexOf('-');
    const correctRoot = correctAnswer.substring(0, dashIdx);
    const remainder = correctAnswer.substring(dashIdx + 1);
    const spaceIdx = remainder.indexOf(' ');
    const correctType = spaceIdx === -1 ? remainder : remainder.substring(0, spaceIdx);
    const correctInversion = spaceIdx === -1 ? null : (remainder.substring(spaceIdx + 1) as Inversion);

    // Reset selections when feedback clears (new question)
    useEffect(() => {
        if (!feedback) {
            setSelectedNoteIndex(null);
            setSelectedTriadType(null);
            setSelectedInversion(null);
        }
    }, [feedback]);

    // Compose the answer string from selections
    const composeAnswer = (noteIndex: number, triadType: string, inversion: Inversion | null): string => {
        const label = INTERVAL_NOTES[noteIndex];
        const possibleNames = NOTE_LABEL_TO_GERMAN[label] || [label];

        // If everything matches the correct answer, return it directly to ensure strict comparison works
        // (handles enharmonic root naming, e.g. user picks "Cis" but correct is "Des")
        const rootMatches = possibleNames.includes(correctRoot);
        const typeMatches = triadType === correctType;
        const inversionMatches = inversion === correctInversion;
        if (rootMatches && typeMatches && inversionMatches) {
            return correctAnswer;
        }

        const base = `${possibleNames[0]}-${triadType}`;
        return inversion ? `${base} ${inversion}` : base;
    };

    const handleNoteClick = (noteIndex: number) => {
        if (disabled) return;
        setSelectedNoteIndex(noteIndex);
    };

    const handleTriadTypeClick = (triadType: string) => {
        if (disabled || selectedNoteIndex === null) return;
        setSelectedTriadType(triadType);
        // If inversions are not required, submit immediately (legacy behavior)
        if (!allowInversions) {
            const answer = composeAnswer(selectedNoteIndex, triadType, null);
            onAnswer(answer);
        }
    };

    const handleInversionClick = (inversion: Inversion) => {
        if (disabled || selectedNoteIndex === null || selectedTriadType === null) return;
        setSelectedInversion(inversion);
        const answer = composeAnswer(selectedNoteIndex, selectedTriadType, inversion);
        onAnswer(answer);
    };

    // --- Note button styling ---
    const getNoteButtonClass = (noteIndex: number, isBlack: boolean) => {
        const base = 'font-semibold text-xs transition-all rounded-lg ';

        if (feedback) {
            if (selectedNoteIndex === noteIndex) {
                if (feedback === 'correct') {
                    return base + 'bg-emerald-500 text-white border-2 border-emerald-500';
                } else {
                    return base + 'bg-rose-500 text-white border-2 border-rose-500';
                }
            }
            // Dimmed
            return base + (isBlack
                ? 'bg-slate-700 text-slate-500 border-2 border-slate-600'
                : 'bg-white text-slate-300 border-2 border-slate-200');
        }

        // Active selection (not yet submitted)
        if (selectedNoteIndex === noteIndex) {
            return base + 'bg-rose-500 text-white border-2 border-rose-500 ring-2 ring-rose-300';
        }

        // Default
        if (isBlack) {
            return base + 'bg-slate-800 text-white border-2 border-slate-600 hover:bg-slate-700 hover:border-rose-400';
        }
        return base + 'bg-white text-slate-700 border-2 border-slate-200 hover:border-rose-400 hover:bg-rose-50';
    };

    // --- Triad type button styling ---
    const getTriadButtonClass = (triadType: string) => {
        const base = 'py-3 px-2 rounded-lg border-2 font-semibold text-sm transition-all ';

        if (feedback) {
            if (selectedTriadType === triadType) {
                if (feedback === 'correct') {
                    return base + 'bg-emerald-500 text-white border-emerald-500';
                } else {
                    return base + 'bg-rose-500 text-white border-rose-500';
                }
            }
            // Dimmed
            return base + 'bg-white border-slate-200 text-slate-300';
        }

        // Selected (waiting for inversion choice)
        if (selectedTriadType === triadType && allowInversions) {
            return base + 'bg-rose-500 text-white border-rose-500 ring-2 ring-rose-300';
        }

        // Default (grayed out if no note selected yet)
        if (selectedNoteIndex === null) {
            return base + 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed';
        }

        return base + 'bg-white border-slate-200 text-slate-700 hover:border-rose-400 hover:bg-rose-50';
    };

    // --- Inversion button styling ---
    const getInversionButtonClass = (inversion: Inversion) => {
        const base = 'py-3 px-2 rounded-lg border-2 font-semibold text-sm transition-all ';

        if (feedback) {
            if (selectedInversion === inversion) {
                if (feedback === 'correct') {
                    return base + 'bg-emerald-500 text-white border-emerald-500';
                } else {
                    return base + 'bg-rose-500 text-white border-rose-500';
                }
            }
            return base + 'bg-white border-slate-200 text-slate-300';
        }

        if (selectedTriadType === null) {
            return base + 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed';
        }

        return base + 'bg-white border-slate-200 text-slate-700 hover:border-rose-400 hover:bg-rose-50';
    };

    return (
        <div className="mt-4 space-y-4">
            {/* Note Selection Label */}
            <p className="text-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                1. Grundton wählen
            </p>

            {/* Piano-style note buttons */}
            <div className="flex flex-col items-center gap-2">
                {/* Upper row: Black keys (accidentals) */}
                <div className="flex gap-2 justify-center">
                    {BLACK_NOTE_INDICES.map((noteIndex) => (
                        <button
                            key={noteIndex}
                            onClick={() => handleNoteClick(noteIndex)}
                            disabled={disabled}
                            className={getNoteButtonClass(noteIndex, true) + ' py-2 px-3 min-w-[60px]'}
                        >
                            {INTERVAL_NOTES[noteIndex]}
                        </button>
                    ))}
                </div>

                {/* Lower row: White keys (natural notes) */}
                <div className="flex gap-2 justify-center">
                    {WHITE_NOTE_INDICES.map((noteIndex) => (
                        <button
                            key={noteIndex}
                            onClick={() => handleNoteClick(noteIndex)}
                            disabled={disabled}
                            className={getNoteButtonClass(noteIndex, false) + ' py-3 px-3 min-w-[44px]'}
                        >
                            {INTERVAL_NOTES[noteIndex]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Triad Type Selection Label */}
            <p className="text-center text-slate-400 text-xs font-semibold uppercase tracking-wider mt-2">
                2. Akkordform wählen
            </p>

            {/* Triad type buttons */}
            <div className="grid grid-cols-4 gap-3">
                {TRIAD_TYPES.map((triadType) => (
                    <button
                        key={triadType}
                        onClick={() => handleTriadTypeClick(triadType)}
                        disabled={disabled || selectedNoteIndex === null}
                        className={getTriadButtonClass(triadType)}
                    >
                        {triadType}
                    </button>
                ))}
            </div>

            {/* Inversion Selection (only when allowInversions is true) */}
            {allowInversions && (
                <>
                    <p className="text-center text-slate-400 text-xs font-semibold uppercase tracking-wider mt-2">
                        3. Stellung wählen
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        {INVERSIONS.map((inversion) => (
                            <button
                                key={inversion}
                                onClick={() => handleInversionClick(inversion)}
                                disabled={disabled || selectedTriadType === null}
                                className={getInversionButtonClass(inversion)}
                            >
                                {inversion}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default TriadAnswerInput;
