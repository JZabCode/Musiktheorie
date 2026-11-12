import React from 'react';

/**
 * Übersicht-Klaviatur über 2 Oktaven (kleine + eingestrichene Oktave).
 * Zeigt, wie sich das Muster aus 2er- und 3er-Gruppen schwarzer Tasten wiederholt.
 * Reine Illustration – nicht interaktiv.
 */

const WHITE_KEY_W = 40;
const WHITE_KEY_H = 180;
const BLACK_KEY_W = 24;
const BLACK_KEY_H = 110;
const OCTAVES = 2;
const TOTAL_WHITE = 7 * OCTAVES + 1; // + abschließendes c
const WIDTH = TOTAL_WHITE * WHITE_KEY_W;
const LABEL_AREA_BELOW = 30;
const OCTAVE_BAR_AREA_ABOVE = 36;
const HEIGHT = WHITE_KEY_H + LABEL_AREA_BELOW + OCTAVE_BAR_AREA_ABOVE;

// Namen der weißen Tasten je Oktave (Helmholtz-Notation, deutsch)
const WHITE_LABELS = [
    // kleine Oktave
    'c', 'd', 'e', 'f', 'g', 'a', 'h',
    // eingestrichene Oktave
    'c1', 'd1', 'e1', 'f1', 'g1', 'a1', 'h1',
    // Schluss-c
    'c2',
];

// Schwarze Tasten: Position relativ zu den weißen Tasten innerhalb einer Oktave.
// afterIndex = nach welcher weißen Taste (0=c, 1=d, 3=f, 4=g, 5=a) die schwarze Taste sitzt.
const BLACK_OFFSETS = [0, 1, 3, 4, 5];

const KeyboardOverview: React.FC = () => {
    // Hervorhebung: jedes "c" markieren, damit die Wiederholung sichtbar wird
    const isCKey = (idx: number) => idx % 7 === 0;

    return (
        <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                style={{ width: '100%', maxWidth: WIDTH, height: 'auto', display: 'block', margin: '0 auto' }}
                aria-label="Klaviatur über zwei Oktaven"
            >
                {/* Oktaven-Bänder oben */}
                <g>
                    <rect x="0" y="6" width={7 * WHITE_KEY_W} height="20" fill="#e0e7ff" rx="4" />
                    <text x={(7 * WHITE_KEY_W) / 2} y="21" fontSize="13" fontWeight="600" fill="#4338ca" textAnchor="middle">
                        kleine Oktave
                    </text>
                    <rect x={7 * WHITE_KEY_W} y="6" width={7 * WHITE_KEY_W} height="20" fill="#fef3c7" rx="4" />
                    <text x={7 * WHITE_KEY_W + (7 * WHITE_KEY_W) / 2} y="21" fontSize="13" fontWeight="600" fill="#b45309" textAnchor="middle">
                        eingestrichene Oktave
                    </text>
                </g>

                {/* Weiße Tasten */}
                <g transform={`translate(0, ${OCTAVE_BAR_AREA_ABOVE})`}>
                    {WHITE_LABELS.map((label, i) => (
                        <g key={`white-${i}`}>
                            <rect
                                x={i * WHITE_KEY_W}
                                y={0}
                                width={WHITE_KEY_W}
                                height={WHITE_KEY_H}
                                fill={isCKey(i) ? '#fef9c3' : '#ffffff'}
                                stroke="#475569"
                                strokeWidth="1"
                            />
                            <text
                                x={i * WHITE_KEY_W + WHITE_KEY_W / 2}
                                y={WHITE_KEY_H - 10}
                                fontSize="13"
                                fontWeight={isCKey(i) ? '700' : '500'}
                                fill={isCKey(i) ? '#a16207' : '#475569'}
                                textAnchor="middle"
                            >
                                {label}
                            </text>
                        </g>
                    ))}
                </g>

                {/* Schwarze Tasten */}
                <g transform={`translate(0, ${OCTAVE_BAR_AREA_ABOVE})`}>
                    {Array.from({ length: OCTAVES }).flatMap((_, octave) =>
                        BLACK_OFFSETS.map((offset) => {
                            const whiteIdx = octave * 7 + offset;
                            const x = (whiteIdx + 1) * WHITE_KEY_W - BLACK_KEY_W / 2;
                            return (
                                <rect
                                    key={`black-${octave}-${offset}`}
                                    x={x}
                                    y={0}
                                    width={BLACK_KEY_W}
                                    height={BLACK_KEY_H}
                                    fill="#1e293b"
                                    stroke="#0f172a"
                                    strokeWidth="1"
                                    rx="2"
                                />
                            );
                        })
                    )}
                </g>

                {/* Hinweis unten */}
                <text
                    x={WIDTH / 2}
                    y={OCTAVE_BAR_AREA_ABOVE + WHITE_KEY_H + 22}
                    fontSize="12"
                    fill="#64748b"
                    textAnchor="middle"
                    fontStyle="italic"
                >
                    Das Muster „2er- und 3er-Gruppe schwarzer Tasten" wiederholt sich in jeder Oktave.
                </text>
            </svg>
        </div>
    );
};

export default KeyboardOverview;
