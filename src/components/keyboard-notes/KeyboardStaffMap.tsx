import React from 'react';

/**
 * Lern-Illustration: Notensystem (Violinschlüssel) mit den Stammtönen c1–h1,
 * jede Note direkt über ihrer passenden weißen Taste einer Oktav-Klaviatur (c1–h1).
 * Feine Verbindungslinien zeigen, welche Note zu welcher Taste gehört.
 * Reine Darstellung – nicht interaktiv.
 */

const LEFT_MARGIN = 48;       // Platz links für den Notenschlüssel
const WHITE_W = 58;
const WHITE_H = 140;
const BLACK_W = 34;
const BLACK_H = 88;
const N_WHITE = 7;            // c1 .. h1

const STAFF_TOP = 34;        // y der obersten Notenlinie (f2 / F5)
const STAFF_STEP = 13;       // Abstand zwischen zwei Notenlinien
const HALF = STAFF_STEP / 2; // ein diatonischer Schritt = halber Linienabstand

const KB_TOP = 126;          // Oberkante der Klaviatur
const LABEL_AREA = 26;

const WIDTH = LEFT_MARGIN + N_WHITE * WHITE_W;
const HEIGHT = KB_TOP + WHITE_H + LABEL_AREA;

// y der Bezugslinie E4 (unterste Notenlinie)
const E4_Y = STAFF_TOP + 4 * STAFF_STEP;

// Mitte einer weißen Taste (Index 0 = c1)
const whiteCenterX = (i: number) => LEFT_MARGIN + i * WHITE_W + WHITE_W / 2;

// Stammtöne c1..h1: Tonhöhe relativ zu E4 in diatonischen Schritten (positiv = höher)
// und damit die y-Position auf dem System.
const NOTES = [
    { label: 'c1', stepsFromE: -2, ledger: true },  // C4: erste Hilfslinie unter dem System
    { label: 'd1', stepsFromE: -1 },                 // D4: Zwischenraum unter der untersten Linie
    { label: 'e1', stepsFromE: 0 },                  // E4: unterste Linie
    { label: 'f1', stepsFromE: 1 },                  // F4: erster Zwischenraum
    { label: 'g1', stepsFromE: 2 },                  // G4: zweite Linie
    { label: 'a1', stepsFromE: 3 },                  // A4: zweiter Zwischenraum
    { label: 'h1', stepsFromE: 4 },                  // B4: mittlere Linie
];

const noteY = (stepsFromE: number) => E4_Y - stepsFromE * HALF;

// Schwarze Tasten dieser Oktave (afterIndex = links angrenzende weiße Taste)
const BLACK_AFTER = [0, 1, 3, 4, 5];

const KeyboardStaffMap: React.FC = () => {
    return (
        <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                style={{ width: '100%', maxWidth: WIDTH, height: 'auto', display: 'block', margin: '0 auto' }}
                aria-label="Notensystem mit den Tönen c1 bis h1, jeweils über der passenden Klaviaturtaste"
            >
                {/* Notenlinien */}
                {Array.from({ length: 5 }).map((_, k) => {
                    const y = STAFF_TOP + k * STAFF_STEP;
                    return (
                        <line
                            key={`staff-${k}`}
                            x1={8}
                            y1={y}
                            x2={WIDTH - 6}
                            y2={y}
                            stroke="#94a3b8"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Violinschlüssel */}
                <text
                    x={10}
                    y={E4_Y + 6}
                    fontSize={STAFF_STEP * 6.2}
                    fill="#334155"
                    style={{ fontFamily: "'Bravura', 'Noto Music', 'Segoe UI Symbol', serif" }}
                >
                    {'\u{1D11E}'}
                </text>

                {/* Verbindungslinien Note → Taste */}
                {NOTES.map((n, i) => {
                    const cx = whiteCenterX(i);
                    const y = noteY(n.stepsFromE);
                    return (
                        <line
                            key={`conn-${i}`}
                            x1={cx}
                            y1={y + 7}
                            x2={cx}
                            y2={KB_TOP}
                            stroke="#cbd5e1"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                        />
                    );
                })}

                {/* Noten c1..h1 */}
                {NOTES.map((n, i) => {
                    const cx = whiteCenterX(i);
                    const y = noteY(n.stepsFromE);
                    return (
                        <g key={`note-${i}`}>
                            {n.ledger && (
                                <line
                                    x1={cx - 12}
                                    y1={y}
                                    x2={cx + 12}
                                    y2={y}
                                    stroke="#334155"
                                    strokeWidth="1.2"
                                />
                            )}
                            <ellipse
                                cx={cx}
                                cy={y}
                                rx={8.5}
                                ry={6}
                                fill="none"
                                stroke="#1d4ed8"
                                strokeWidth={2}
                                transform={`rotate(-12 ${cx} ${y})`}
                            />
                            <text
                                x={cx}
                                y={STAFF_TOP - 8}
                                fontSize="12"
                                fontWeight="700"
                                fill="#1d4ed8"
                                textAnchor="middle"
                            >
                                {n.label}
                            </text>
                        </g>
                    );
                })}

                {/* Weiße Tasten */}
                {NOTES.map((n, i) => {
                    const x = LEFT_MARGIN + i * WHITE_W;
                    return (
                        <g key={`white-${i}`}>
                            <rect
                                x={x}
                                y={KB_TOP}
                                width={WHITE_W}
                                height={WHITE_H}
                                fill="#ffffff"
                                stroke="#475569"
                                strokeWidth="1"
                            />
                            {/* kleiner Punkt als Anker der Verbindungslinie */}
                            <circle cx={whiteCenterX(i)} cy={KB_TOP + 12} r={3} fill="#1d4ed8" />
                            <text
                                x={whiteCenterX(i)}
                                y={KB_TOP + WHITE_H - 12}
                                fontSize="14"
                                fontWeight="600"
                                fill="#475569"
                                textAnchor="middle"
                            >
                                {n.label}
                            </text>
                        </g>
                    );
                })}

                {/* Schwarze Tasten */}
                {BLACK_AFTER.map((afterIndex) => {
                    const x = LEFT_MARGIN + (afterIndex + 1) * WHITE_W - BLACK_W / 2;
                    return (
                        <rect
                            key={`black-${afterIndex}`}
                            x={x}
                            y={KB_TOP}
                            width={BLACK_W}
                            height={BLACK_H}
                            fill="#1e293b"
                            stroke="#0f172a"
                            strokeWidth="1"
                            rx="3"
                        />
                    );
                })}
            </svg>
        </div>
    );
};

export default KeyboardStaffMap;
