import React from 'react';
import { INTERVAL_NOTES } from '../../lib/music';

const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11, 12]; // C, D, E, F, G, A, H, High C
const BLACK_KEYS = [1, 3, 6, 8, 10]; // Cis, Dis, Fis, Gis, Ais

const KEY_WIDTH = 56;
const KEY_HEIGHT = 200;
const BLACK_KEY_WIDTH = 34;
const BLACK_KEY_HEIGHT = 125;

interface IntervalPianoProps {
    activeKeys?: number[];
    correctKeys?: number[];
    incorrectKeys?: number[];
    onKeyClick?: (keyIndex: number) => void;
}

const IntervalPiano: React.FC<IntervalPianoProps> = ({
    activeKeys = [],
    correctKeys = [],
    incorrectKeys = [],
    onKeyClick,
}) => {
    const getKeyStatus = (noteIndex: number) => {
        if (correctKeys.includes(noteIndex)) return 'correct';
        if (incorrectKeys.includes(noteIndex)) return 'incorrect';
        if (activeKeys.includes(noteIndex)) return 'active';
        return 'default';
    };

    const getKeyColor = (type: 'white' | 'black', status: string) => {
        if (status === 'correct') return '#10b981'; // emerald-500
        if (status === 'incorrect') return '#f43f5e'; // rose-500
        if (status === 'active') return '#6366f1'; // indigo-500
        return type === 'white' ? '#FFFFFF' : '#1e293b'; // white / slate-800
    };

    const getBlackKeyWhiteIndex = (noteIndex: number): number => {
        if (noteIndex === 1) return 0;
        if (noteIndex === 3) return 1;
        if (noteIndex === 6) return 3;
        if (noteIndex === 8) return 4;
        if (noteIndex === 10) return 5;
        return 0;
    };

    const totalWidth = WHITE_KEYS.length * KEY_WIDTH;

    return (
        <div className="flex justify-center my-6 overflow-x-auto max-w-full">
            <svg
                width={totalWidth}
                height={KEY_HEIGHT}
                viewBox={`0 0 ${totalWidth} ${KEY_HEIGHT}`}
                className="drop-shadow-lg"
            >
                {/* White Keys */}
                {WHITE_KEYS.map((noteIndex, i) => {
                    const status = getKeyStatus(noteIndex);
                    const label = INTERVAL_NOTES[noteIndex % 12];
                    return (
                        <g key={`white-${noteIndex}`}>
                            <rect
                                x={i * KEY_WIDTH}
                                y={0}
                                width={KEY_WIDTH - 1}
                                height={KEY_HEIGHT}
                                fill={getKeyColor('white', status)}
                                rx={4}
                                ry={4}
                                stroke="#cbd5e1"
                                strokeWidth="1"
                                style={{ cursor: onKeyClick ? 'pointer' : 'default', transition: 'fill 0.2s' }}
                                onClick={() => onKeyClick?.(noteIndex)}
                            />
                            <text
                                x={i * KEY_WIDTH + (KEY_WIDTH - 1) / 2}
                                y={KEY_HEIGHT - 12}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="600"
                                fill={status !== 'default' ? '#fff' : '#94a3b8'}
                            >
                                {label}
                            </text>
                        </g>
                    );
                })}

                {/* Black Keys */}
                {BLACK_KEYS.map((noteIndex) => {
                    const whiteKeyIndex = getBlackKeyWhiteIndex(noteIndex);
                    const x = whiteKeyIndex * KEY_WIDTH + (KEY_WIDTH - BLACK_KEY_WIDTH / 2);
                    const status = getKeyStatus(noteIndex);

                    return (
                        <rect
                            key={`black-${noteIndex}`}
                            x={x}
                            y={0}
                            width={BLACK_KEY_WIDTH}
                            height={BLACK_KEY_HEIGHT}
                            fill={getKeyColor('black', status)}
                            rx={3}
                            ry={3}
                            style={{ cursor: onKeyClick ? 'pointer' : 'default', transition: 'fill 0.2s' }}
                            onClick={() => onKeyClick?.(noteIndex)}
                        />
                    );
                })}
            </svg>
        </div>
    );
};

export default IntervalPiano;
