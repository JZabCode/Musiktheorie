import React from 'react';
import { formatStep, noteLabel, semitoneOf } from '../../lib/scales';

/**
 * Klaviatur-Ausschnitt für die Anleitung: eine Tonleiter auf weißen Tasten
 * (C-Dur, a-Moll) mit Bögen und Schrittgrößen zwischen den Tönen.
 * Ganztonschritte überspringen eine schwarze Taste, Halbtonschritte nicht.
 */

interface ScaleKeyboardProps {
    /** Diatonische Position des Grundtons (weiße Taste), z. B. c1 = 28. */
    startDia: number;
    /** Halbtonschritte (Index i = zwischen Ton i+1 und i+2) farbig hervorheben. */
    halfSteps: number[];
}

const WHITE_W = 46;
const WHITE_H = 130;
const BLACK_W = 28;
const BLACK_H = 82;
const TOP = 54;
const KEYS = 8;
const WIDTH = KEYS * WHITE_W;
const HEIGHT = TOP + WHITE_H + 2;

const ACCENT = '#0d9488';
const MUTED = '#64748b';

// Nach c, d, f, g, a folgt eine schwarze Taste
const HAS_BLACK_AFTER = new Set([0, 1, 3, 4, 5]);

const ScaleKeyboard: React.FC<ScaleKeyboardProps> = ({ startDia, halfSteps }) => {
    const keys = Array.from({ length: KEYS }, (_, i) => ({ dia: startDia + i, acc: 0 }));
    const centerX = (i: number) => i * WHITE_W + WHITE_W / 2;

    return (
        <div className="overflow-x-auto mt-3">
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                style={{ width: '100%', maxWidth: WIDTH * 1.2, height: 'auto', display: 'block', margin: '0 auto' }}
                aria-label="Tonleiter auf der Klaviatur mit Ganz- und Halbtonschritten"
            >
                {/* Weiße Tasten */}
                {keys.map((k, i) => (
                    <g key={`w-${i}`}>
                        <rect x={i * WHITE_W} y={TOP} width={WHITE_W} height={WHITE_H} fill="#ccfbf1" stroke="#475569" strokeWidth="1" />
                        <text x={centerX(i)} y={TOP + WHITE_H - 12} fontSize="14" fontWeight="600" fill="#334155" textAnchor="middle">
                            {noteLabel(k)}
                        </text>
                    </g>
                ))}

                {/* Schwarze Tasten */}
                {keys.slice(0, -1).map((k, i) =>
                    HAS_BLACK_AFTER.has(k.dia % 7) ? (
                        <rect
                            key={`b-${i}`}
                            x={(i + 1) * WHITE_W - BLACK_W / 2}
                            y={TOP}
                            width={BLACK_W}
                            height={BLACK_H}
                            fill="#1e293b"
                            stroke="#0f172a"
                            strokeWidth="1"
                            rx="3"
                        />
                    ) : null
                )}

                {/* Bögen mit Schrittgröße */}
                {keys.slice(0, -1).map((k, i) => {
                    const half = halfSteps.includes(i);
                    const color = half ? ACCENT : MUTED;
                    const x1 = centerX(i) + 4;
                    const x2 = centerX(i + 1) - 4;
                    const y = TOP - 6;
                    return (
                        <g key={`arc-${i}`}>
                            <path
                                d={`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y - 26} ${x2} ${y}`}
                                fill="none"
                                stroke={color}
                                strokeWidth={half ? 2.5 : 1.5}
                            />
                            <text x={(x1 + x2) / 2} y={y - 18} fontSize="15" fontWeight="700" fill={color} textAnchor="middle">
                                {formatStep(semitoneOf(keys[i + 1]) - semitoneOf(k))}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default ScaleKeyboard;
