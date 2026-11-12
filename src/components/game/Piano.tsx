import React from 'react';
import { toGermanNote } from '../../lib/music';
import { audio } from '../../lib/audio';

interface PianoProps {
    onNotePlay?: (note: string) => void;
    selectedNote?: string | null;
    startOctave?: number;
    endOctave?: number;
    showLabels?: boolean;
}

const WHITE_KEY_W = 56;
const WHITE_KEY_H = 220;
const BLACK_KEY_W = 34;
const BLACK_KEY_H = 140;

interface WhiteKey {
    type: 'white';
    note: string;        // z. B. "C4"
    label: string;       // z. B. "c1"
}
interface BlackKey {
    type: 'black';
    note: string;        // z. B. "C#4"
    sharpLabel: string;  // z. B. "cis1"
    flatLabel: string;   // z. B. "des1"
    afterIndex: number;  // Index der links davorliegenden weißen Taste
}

// Reihenfolge der Stammtöne innerhalb einer Oktave + welche schwarze Taste folgt
const OCTAVE_PATTERN: { white: string; sharp?: { sharpLetter: string; flatLetter: string } }[] = [
    { white: 'C', sharp: { sharpLetter: 'C', flatLetter: 'D' } },
    { white: 'D', sharp: { sharpLetter: 'D', flatLetter: 'E' } },
    { white: 'E' },
    { white: 'F', sharp: { sharpLetter: 'F', flatLetter: 'G' } },
    { white: 'G', sharp: { sharpLetter: 'G', flatLetter: 'A' } },
    { white: 'A', sharp: { sharpLetter: 'A', flatLetter: 'B' } },
    { white: 'B' },
];

const Piano: React.FC<PianoProps> = ({
    onNotePlay,
    selectedNote = null,
    startOctave = 3,
    endOctave = 4,
    showLabels = true,
}) => {
    const whiteKeys: WhiteKey[] = [];
    const blackKeys: BlackKey[] = [];

    for (let o = startOctave; o <= endOctave; o++) {
        for (const step of OCTAVE_PATTERN) {
            const whiteIndex = whiteKeys.length;
            whiteKeys.push({
                type: 'white',
                note: `${step.white}${o}`,
                label: toGermanNote(step.white, '', o),
            });
            if (step.sharp) {
                blackKeys.push({
                    type: 'black',
                    note: `${step.sharp.sharpLetter}#${o}`,
                    sharpLabel: toGermanNote(step.sharp.sharpLetter, '#', o),
                    flatLabel: toGermanNote(step.sharp.flatLetter, 'b', o),
                    afterIndex: whiteIndex,
                });
            }
        }
    }
    // Abschluss-C der nächsten Oktave
    whiteKeys.push({
        type: 'white',
        note: `C${endOctave + 1}`,
        label: toGermanNote('C', '', endOctave + 1),
    });

    const totalWhite = whiteKeys.length;
    const width = totalWhite * WHITE_KEY_W;
    const height = WHITE_KEY_H;

    const isSelected = (note: string) => selectedNote === note;

    const handlePress = (note: string) => {
        audio.playNote(note);
        onNotePlay?.(note);
    };

    return (
        <div className="bg-slate-900 p-3 rounded-xl shadow-2xl overflow-x-auto w-full">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                style={{ width: '100%', maxWidth: width, height: 'auto', display: 'block' }}
                aria-label="Klaviatur"
            >
                {/* Weiße Tasten */}
                {whiteKeys.map((k, i) => {
                    const selected = isSelected(k.note);
                    return (
                        <g key={`w-${i}`}>
                            <rect
                                x={i * WHITE_KEY_W}
                                y={0}
                                width={WHITE_KEY_W}
                                height={WHITE_KEY_H}
                                fill={selected ? '#a5b4fc' : '#ffffff'}
                                stroke="#475569"
                                strokeWidth="1"
                                onClick={() => handlePress(k.note)}
                                style={{ cursor: 'pointer' }}
                            />
                            {showLabels && (
                                <text
                                    x={i * WHITE_KEY_W + WHITE_KEY_W / 2}
                                    y={WHITE_KEY_H - 12}
                                    fontSize="14"
                                    fontWeight="600"
                                    fill={selected ? '#1e1b4b' : '#475569'}
                                    textAnchor="middle"
                                    pointerEvents="none"
                                >
                                    {k.label}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Schwarze Tasten */}
                {blackKeys.map((bk, i) => {
                    const selected = isSelected(bk.note);
                    const x = (bk.afterIndex + 1) * WHITE_KEY_W - BLACK_KEY_W / 2;
                    const centerX = x + BLACK_KEY_W / 2;
                    return (
                        <g key={`b-${i}`}>
                            <rect
                                x={x}
                                y={0}
                                width={BLACK_KEY_W}
                                height={BLACK_KEY_H}
                                fill={selected ? '#4f46e5' : '#1e293b'}
                                stroke="#0f172a"
                                strokeWidth="1"
                                rx="3"
                                onClick={() => handlePress(bk.note)}
                                style={{ cursor: 'pointer' }}
                            />
                            {showLabels && (
                                <>
                                    <text
                                        x={centerX}
                                        y={BLACK_KEY_H - 32}
                                        fontSize="11"
                                        fontWeight="700"
                                        fill="#fef9c3"
                                        textAnchor="middle"
                                        pointerEvents="none"
                                    >
                                        {bk.sharpLabel}
                                    </text>
                                    <line
                                        x1={x + 4}
                                        y1={BLACK_KEY_H - 24}
                                        x2={x + BLACK_KEY_W - 4}
                                        y2={BLACK_KEY_H - 24}
                                        stroke="#64748b"
                                        strokeWidth="0.7"
                                    />
                                    <text
                                        x={centerX}
                                        y={BLACK_KEY_H - 10}
                                        fontSize="11"
                                        fontWeight="700"
                                        fill="#bfdbfe"
                                        textAnchor="middle"
                                        pointerEvents="none"
                                    >
                                        {bk.flatLabel}
                                    </text>
                                </>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default Piano;
