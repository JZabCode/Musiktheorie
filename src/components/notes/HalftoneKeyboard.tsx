import React from 'react';

/**
 * Klaviatur einer Oktave (c bis c1) mit Pfeilen für Halbtonschritte.
 * Zeigt, dass ein Vorzeichen den Ton immer zur direkt benachbarten Taste
 * verschiebt – egal ob diese schwarz oder weiß ist (z. B. e → eis = Taste f).
 */

export interface HalftoneStep {
    /** Ausgangstaste als Halbtonposition innerhalb der Oktave (0 = c … 12 = c1). */
    from: number;
    /** Zieltaste als Halbtonposition. */
    to: number;
    /** Name des neuen Tons, z. B. 'cis'. */
    label: string;
    /** Optionaler Zusatz unter dem Namen, z. B. '(Taste f)'. */
    hint?: string;
}

interface HalftoneKeyboardProps {
    steps: HalftoneStep[];
    variant: 'sharp' | 'flat';
}

const WHITE_W = 48;
const WHITE_H = 150;
const BLACK_W = 30;
const BLACK_H = 95;
const TOP = 70; // Platz oberhalb der Tasten für Pfeile und Beschriftung
const WIDTH = 8 * WHITE_W;
const HEIGHT = TOP + WHITE_H + 4;

const WHITE_LABELS = ['c', 'd', 'e', 'f', 'g', 'a', 'h', 'c1'];
const WHITE_SEMITONES = [0, 2, 4, 5, 7, 9, 11, 12];
// Schwarze Taste: Halbtonposition → Index der weißen Taste links davon
const BLACK_KEYS: Record<number, number> = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 };

const COLORS = {
    sharp: { stroke: '#ea580c', fillWhite: '#fed7aa', fillBlack: '#f97316', text: '#c2410c' },
    flat: { stroke: '#0284c7', fillWhite: '#bae6fd', fillBlack: '#0ea5e9', text: '#0369a1' },
};

const centerX = (semitone: number): number => {
    const whiteIndex = WHITE_SEMITONES.indexOf(semitone);
    if (whiteIndex >= 0) return whiteIndex * WHITE_W + WHITE_W / 2;
    return (BLACK_KEYS[semitone] + 1) * WHITE_W;
};

/**
 * x-Koordinate für Pfeil-Anfang/-Ende: Bei weißen Tasten die Mitte des oben
 * sichtbaren Teils (ohne die überlappenden schwarzen Nachbartasten), damit der
 * Pfeil nicht auf eine schwarze Taste zu zeigen scheint (z. B. fes → e, nicht es).
 */
const arrowX = (semitone: number): number => {
    const whiteIndex = WHITE_SEMITONES.indexOf(semitone);
    if (whiteIndex < 0) return centerX(semitone);
    let left = whiteIndex * WHITE_W;
    let right = left + WHITE_W;
    if (semitone - 1 in BLACK_KEYS) left = centerX(semitone - 1) + BLACK_W / 2;
    if (semitone + 1 in BLACK_KEYS) right = centerX(semitone + 1) - BLACK_W / 2;
    return (left + right) / 2;
};

const HalftoneKeyboard: React.FC<HalftoneKeyboardProps> = ({ steps, variant }) => {
    const c = COLORS[variant];
    const targets = new Set(steps.map(s => s.to));
    const sources = new Set(steps.map(s => s.from));
    const markerId = `halftone-arrow-${variant}`;

    const whiteFill = (semitone: number) =>
        targets.has(semitone) ? c.fillWhite : sources.has(semitone) ? '#e2e8f0' : '#ffffff';

    return (
        <div className="overflow-x-auto mt-3">
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                style={{ width: '100%', maxWidth: WIDTH, height: 'auto', display: 'block', margin: '0 auto' }}
                aria-label="Klaviatur einer Oktave mit Halbtonschritten"
            >
                <defs>
                    <marker
                        id={markerId}
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={c.stroke} />
                    </marker>
                </defs>

                {/* Weiße Tasten */}
                {WHITE_LABELS.map((label, i) => (
                    <g key={`white-${i}`}>
                        <rect
                            x={i * WHITE_W}
                            y={TOP}
                            width={WHITE_W}
                            height={WHITE_H}
                            fill={whiteFill(WHITE_SEMITONES[i])}
                            stroke="#475569"
                            strokeWidth="1"
                        />
                        <text
                            x={i * WHITE_W + WHITE_W / 2}
                            y={TOP + WHITE_H - 12}
                            fontSize="14"
                            fontWeight="600"
                            fill="#475569"
                            textAnchor="middle"
                        >
                            {label}
                        </text>
                    </g>
                ))}

                {/* Schwarze Tasten */}
                {Object.keys(BLACK_KEYS).map(Number).map(semitone => (
                    <rect
                        key={`black-${semitone}`}
                        x={centerX(semitone) - BLACK_W / 2}
                        y={TOP}
                        width={BLACK_W}
                        height={BLACK_H}
                        fill={targets.has(semitone) ? c.fillBlack : '#1e293b'}
                        stroke="#0f172a"
                        strokeWidth="1"
                        rx="3"
                    />
                ))}

                {/* Halbton-Pfeile mit Beschriftung */}
                {steps.map(({ from, to, label, hint }) => {
                    const x1 = arrowX(from);
                    const x2 = arrowX(to);
                    const y = TOP - 6;
                    const midX = (x1 + x2) / 2;
                    return (
                        <g key={`step-${from}-${to}`}>
                            <path
                                d={`M ${x1} ${y} Q ${midX} ${y - 26} ${x2} ${y}`}
                                fill="none"
                                stroke={c.stroke}
                                strokeWidth="2"
                                markerEnd={`url(#${markerId})`}
                            />
                            <text
                                x={midX}
                                y={hint ? 16 : 28}
                                fontSize="14"
                                fontWeight="700"
                                fill={c.text}
                                textAnchor="middle"
                            >
                                {label}
                            </text>
                            {hint && (
                                <text x={midX} y={30} fontSize="11" fill={c.text} textAnchor="middle">
                                    {hint}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default HalftoneKeyboard;
