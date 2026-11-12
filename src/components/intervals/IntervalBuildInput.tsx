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



interface IntervalBuildInputProps {
    onNoteConfirm: (selection: NoteSelection) => void;
    confirmedSelection: NoteSelection | null;
    disabled: boolean;
    feedback: 'correct' | 'incorrect' | null;
    correctKey: string;
    showCorrectAnswer?: boolean;
}

const IntervalBuildInput: React.FC<IntervalBuildInputProps> = ({
    onNoteConfirm,
    confirmedSelection,
    disabled,
    feedback,
    correctKey,
    showCorrectAnswer = true,
}) => {
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [selectedAccidental, setSelectedAccidental] = useState<string>('');

    // Reset staging when feedback clears
    useEffect(() => {
        if (!feedback) {
            setSelectedLetter(null);
            setSelectedAccidental('');
        }
    }, [feedback]);

    const handleLetterClick = (letter: string) => {
        if (disabled) return;
        if (selectedLetter === letter) {
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

    const stagedLabel = selectedLetter
        ? toGermanLabel({ letter: selectedLetter, accidental: selectedAccidental })
        : null;

    const getLetterButtonClass = (letter: string) => {
        const base = 'font-bold text-sm transition-all rounded-xl ';

        if (feedback) {
            return base + 'bg-white text-slate-300 border-2 border-slate-200 cursor-default';
        }

        if (selectedLetter === letter) {
            return base + 'bg-indigo-500 text-white border-2 border-indigo-500 ring-2 ring-indigo-300 shadow-md';
        }

        return base + 'bg-white text-slate-700 border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50';
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

    // Extract correct pitch class
    const [notePart] = correctKey.split('/');
    const correctLetter = notePart.charAt(0);
    const correctAccidental = notePart.substring(1);
    const correctPC: NoteSelection = { letter: correctLetter, accidental: correctAccidental };

    return (
        <div className="mt-4 space-y-4">
            {confirmedSelection && (
                <div className="flex justify-center">
                    {(() => {
                        const label = toGermanLabel(confirmedSelection);
                        let bgClass = 'bg-slate-100 border-slate-200 text-slate-700';

                        if (feedback === 'correct') {
                            bgClass = 'bg-emerald-100 border-emerald-300 text-emerald-700';
                        } else if (feedback === 'incorrect') {
                            if (confirmedSelection.letter + confirmedSelection.accidental === correctPC.letter + correctPC.accidental) {
                                bgClass = 'bg-emerald-100 border-emerald-300 text-emerald-700';
                            } else {
                                bgClass = 'bg-rose-100 border-rose-300 text-rose-700';
                            }
                        }

                        return (
                            <div className={`px-6 py-3 rounded-lg border-2 text-center ${bgClass}`}>
                                <div className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-0.5">
                                    Gewählter Ton
                                </div>
                                <div className="font-bold text-xl">{label}</div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {feedback === 'incorrect' && showCorrectAnswer && (
                <div className="flex justify-center gap-2 text-sm text-emerald-700 mt-2">
                    <span className="font-semibold">Richtig wäre:</span>
                    <span className="bg-emerald-100 px-2 py-0.5 rounded font-bold">
                        {toGermanLabel(correctPC)}
                    </span>
                </div>
            )}

            {!confirmedSelection && !feedback && (
                <>
                    <p className="text-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        Zielton wählen
                    </p>

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

                    <div className="flex items-center justify-center gap-3 mt-4">
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

                        <button
                            onClick={handleConfirm}
                            disabled={disabled || !selectedLetter}
                            className={`flex items-center gap-2 py-2 px-5 rounded-xl font-bold text-sm transition-all ${selectedLetter
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                                : 'bg-slate-100 text-slate-300 border-2 border-slate-200 cursor-not-allowed'
                                }`}
                        >
                            <Plus size={16} />
                            {stagedLabel ? `${stagedLabel} bestätigen` : 'Ton bestätigen'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default IntervalBuildInput;
