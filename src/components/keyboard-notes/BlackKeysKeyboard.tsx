import React from 'react';
import OctaveKeys, { WHITE_KEY_H, KEYBOARD_WIDTH } from './OctaveKeys';

/**
 * Detail-Klaviatur einer Oktave – zeigt auf jeder schwarzen Taste
 * beide deutschen Namen (z. B. Cis / Des).
 */

const LABEL_AREA_BELOW = 30;
const WIDTH = KEYBOARD_WIDTH;
const HEIGHT = WHITE_KEY_H + LABEL_AREA_BELOW;

const BlackKeysKeyboard: React.FC = () => {
    return (
        <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                style={{ width: '100%', maxWidth: WIDTH, height: 'auto', display: 'block', margin: '0 auto' }}
                aria-label="Klaviatur einer Oktave mit Namen der schwarzen Tasten"
            >
                <OctaveKeys />

                {/* Legende unten */}
                <g transform={`translate(0, ${WHITE_KEY_H + 10})`}>
                    <text x="8" y="14" fontSize="11" fill="#a16207" fontWeight="600">
                        oben (gelb): mit Kreuz erhöht („-is")
                    </text>
                    <text x={WIDTH - 8} y="14" fontSize="11" fill="#1d4ed8" fontWeight="600" textAnchor="end">
                        unten (blau): mit B erniedrigt („-es" / „-s")
                    </text>
                </g>
            </svg>
        </div>
    );
};

export default BlackKeysKeyboard;
