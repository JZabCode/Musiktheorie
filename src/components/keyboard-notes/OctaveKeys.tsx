import React from 'react';

/**
 * Gemeinsame Klaviatur-Grafik einer Oktave (c bis c1).
 * Zeichnet die weißen und schwarzen Tasten als SVG-Elemente; auf jeder
 * schwarzen Taste stehen beide deutschen Namen (z. B. Cis / Des).
 *
 * Wird von BlackKeysKeyboard und StepIntervalsKeyboard genutzt, damit beide
 * Klaviaturen identisch aussehen. Über `top` lässt sich der vertikale Versatz
 * steuern, falls oberhalb der Tastatur Platz für Beschriftungen gebraucht wird.
 */

export const WHITE_KEY_W = 64;
export const WHITE_KEY_H = 280;
export const BLACK_KEY_W = 40;
export const BLACK_KEY_H = 175;
export const TOTAL_WHITE = 8; // c bis c1 (eine Oktave + Schluss-c)
export const KEYBOARD_WIDTH = TOTAL_WHITE * WHITE_KEY_W;

const WHITE_LABELS = ['c', 'd', 'e', 'f', 'g', 'a', 'h', 'c1'];

// Schwarze Tasten: Position + zwei Namen (Kreuz / B)
const BLACK_KEYS = [
    { afterIndex: 0, sharp: 'Cis', flat: 'Des' },
    { afterIndex: 1, sharp: 'Dis', flat: 'Es' },
    { afterIndex: 3, sharp: 'Fis', flat: 'Ges' },
    { afterIndex: 4, sharp: 'Gis', flat: 'As' },
    { afterIndex: 5, sharp: 'Ais', flat: 'B' },
];

// Mittelpunkte (relativ zum SVG, unabhängig vom vertikalen Versatz)
export const whiteCenterX = (i: number) => i * WHITE_KEY_W + WHITE_KEY_W / 2;
export const blackCenterX = (afterIndex: number) => (afterIndex + 1) * WHITE_KEY_W;

interface OctaveKeysProps {
    /** Vertikaler Versatz der Tastatur-Oberkante (Standard: 0). */
    top?: number;
}

const OctaveKeys: React.FC<OctaveKeysProps> = ({ top = 0 }) => (
    <>
        {/* Weiße Tasten */}
        {WHITE_LABELS.map((label, i) => (
            <g key={`white-${i}`}>
                <rect
                    x={i * WHITE_KEY_W}
                    y={top}
                    width={WHITE_KEY_W}
                    height={WHITE_KEY_H}
                    fill="#ffffff"
                    stroke="#475569"
                    strokeWidth="1"
                />
                <text
                    x={whiteCenterX(i)}
                    y={top + WHITE_KEY_H - 14}
                    fontSize="16"
                    fontWeight="600"
                    fill="#475569"
                    textAnchor="middle"
                >
                    {label}
                </text>
            </g>
        ))}

        {/* Schwarze Tasten mit zwei Namen */}
        {BLACK_KEYS.map(({ afterIndex, sharp, flat }) => {
            const x = blackCenterX(afterIndex) - BLACK_KEY_W / 2;
            const centerX = blackCenterX(afterIndex);
            return (
                <g key={`black-${afterIndex}`}>
                    <rect
                        x={x}
                        y={top}
                        width={BLACK_KEY_W}
                        height={BLACK_KEY_H}
                        fill="#1e293b"
                        stroke="#0f172a"
                        strokeWidth="1"
                        rx="3"
                    />
                    {/* Kreuz-Name (oben) */}
                    <text
                        x={centerX}
                        y={top + BLACK_KEY_H - 38}
                        fontSize="13"
                        fontWeight="700"
                        fill="#fef9c3"
                        textAnchor="middle"
                    >
                        {sharp}
                    </text>
                    {/* Trennstrich */}
                    <line
                        x1={x + 6}
                        y1={top + BLACK_KEY_H - 28}
                        x2={x + BLACK_KEY_W - 6}
                        y2={top + BLACK_KEY_H - 28}
                        stroke="#64748b"
                        strokeWidth="0.8"
                    />
                    {/* B-Name (unten) */}
                    <text
                        x={centerX}
                        y={top + BLACK_KEY_H - 12}
                        fontSize="13"
                        fontWeight="700"
                        fill="#bfdbfe"
                        textAnchor="middle"
                    >
                        {flat}
                    </text>
                </g>
            );
        })}
    </>
);

export default OctaveKeys;
