import React from 'react';
import OctaveKeys, {
    WHITE_KEY_H,
    KEYBOARD_WIDTH,
    whiteCenterX,
    blackCenterX,
} from './OctaveKeys';

/**
 * Klaviatur einer Oktave mit Beispielen für Halbton- und Ganztonschritt.
 * Nutzt dieselbe Klaviatur-Grafik wie BlackKeysKeyboard und legt darüber
 * zwei Beispiel-Bögen sowie die Markierung der beiden „weißen"
 * Halbtonschritte e–f und h–c1.
 */

const TOP_LABEL_AREA = 100;
const BOTTOM_LABEL_AREA = 80;
const WIDTH = KEYBOARD_WIDTH;
const HEIGHT = TOP_LABEL_AREA + WHITE_KEY_H + BOTTOM_LABEL_AREA;

// Quadratischer Bezier-Bogen von (x1,y) nach (x2,y), Scheitelpunkt um peak nach oben
const arcPath = (x1: number, x2: number, y: number, peak: number) =>
    `M ${x1} ${y} Q ${(x1 + x2) / 2} ${y - peak} ${x2} ${y}`;

const StepIntervalsKeyboard: React.FC = () => {
    const kbTop = TOP_LABEL_AREA;

    // Bogen-Endpunkte (etwas oberhalb der Tastenoberkante, damit Pfeile sichtbar bleiben)
    const arcEndY = kbTop - 4;

    // Halbton: c → cis
    const htX1 = whiteCenterX(0);
    const htX2 = blackCenterX(0);

    // Ganzton: f → g (über fis hinweg)
    const gtX1 = whiteCenterX(3);
    const gtX2 = whiteCenterX(4);

    return (
        <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                style={{ width: '100%', maxWidth: WIDTH, height: 'auto', display: 'block', margin: '0 auto' }}
                aria-label="Klaviatur mit Halbton- und Ganztonschritt-Beispielen"
            >
                <defs>
                    <marker
                        id="arrow-red"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
                    </marker>
                    <marker
                        id="arrow-blue"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#1d4ed8" />
                    </marker>
                </defs>

                {/* Tastatur (identisch zur Grafik „Die schwarzen Tasten") */}
                <OctaveKeys top={kbTop} />

                {/* Halbton-Bogen: c → cis */}
                <path
                    d={arcPath(htX1, htX2, arcEndY, 50)}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                    markerEnd="url(#arrow-red)"
                />
                <text
                    x={(htX1 + htX2) / 2}
                    y={arcEndY - 58}
                    fontSize="14"
                    fontWeight="700"
                    fill="#dc2626"
                    textAnchor="middle"
                >
                    Halbton
                </text>
                <text
                    x={(htX1 + htX2) / 2}
                    y={arcEndY - 42}
                    fontSize="11"
                    fill="#dc2626"
                    textAnchor="middle"
                >
                    c → cis
                </text>

                {/* Ganzton-Bogen: f → g */}
                <path
                    d={arcPath(gtX1, gtX2, arcEndY, 70)}
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                    markerEnd="url(#arrow-blue)"
                />
                <text
                    x={(gtX1 + gtX2) / 2}
                    y={arcEndY - 78}
                    fontSize="14"
                    fontWeight="700"
                    fill="#1d4ed8"
                    textAnchor="middle"
                >
                    Ganzton
                </text>
                <text
                    x={(gtX1 + gtX2) / 2}
                    y={arcEndY - 62}
                    fontSize="11"
                    fill="#1d4ed8"
                    textAnchor="middle"
                >
                    f → g (= 2 Halbtöne)
                </text>

                {/* Markierung der „weißen" Halbtonschritte e–f und h–c1 */}
                {[
                    { x1: whiteCenterX(2), x2: whiteCenterX(3), label: 'e – f' },
                    { x1: whiteCenterX(6), x2: whiteCenterX(7), label: 'h – c1' },
                ].map(({ x1, x2, label }, idx) => {
                    const y = kbTop + WHITE_KEY_H + 18;
                    return (
                        <g key={`ht-white-${idx}`}>
                            <path
                                d={`M ${x1} ${y - 6} Q ${(x1 + x2) / 2} ${y + 14} ${x2} ${y - 6}`}
                                fill="none"
                                stroke="#dc2626"
                                strokeWidth="2"
                                markerEnd="url(#arrow-red)"
                            />
                            <text
                                x={(x1 + x2) / 2}
                                y={y + 38}
                                fontSize="12"
                                fontWeight="600"
                                fill="#dc2626"
                                textAnchor="middle"
                            >
                                Halbton ({label})
                            </text>
                            <text
                                x={(x1 + x2) / 2}
                                y={y + 54}
                                fontSize="10"
                                fill="#dc2626"
                                textAnchor="middle"
                            >
                                ohne schwarze Taste
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default StepIntervalsKeyboard;
