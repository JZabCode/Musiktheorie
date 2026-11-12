import React from 'react';
import 'vexflow'; // lädt die Notenschrift „Bravura“ in document.fonts
import { signatureNotes } from '../../lib/circleOfFifths';

// SMuFL-Glyphen der Bravura-Schrift
const GLYPH = {
    gClef: '',
    sharp: '',
    flat: '',
    noteheadWhole: '',
};

/** Notenlinien-Schritte ab der untersten Linie (e1 = 0) für die Vorzeichen im Violinschlüssel. */
const SHARP_STEPS = [8, 5, 9, 6, 3, 7, 4]; // f2 c2 g2 d2 a1 e2 h1
const FLAT_STEPS = [4, 7, 3, 6, 2, 5, 1];  // h1 e2 a1 d2 g1 c2 f1

export interface StaffNote {
    /** Schritt ab unterster Linie (e1 = 0, f1 = 1, g1 = 2 …, c1 = -2). */
    step: number;
    /** x-Position relativ zum Beginn des Notensystems. */
    x: number;
    acc?: number;
    color?: string;
}

interface StaffSvgProps {
    x: number;
    y: number; // obere Notenlinie
    /** Linienabstand in px */
    space?: number;
    width?: number;
    signature?: number;
    /** Indizes der Vorzeichen, die farbig hervorgehoben werden */
    highlightAccidentals?: number[];
    highlightColor?: string;
    notes?: StaffNote[];
    color?: string;
}

/** Breite, die Schlüssel + Vorzeichen benötigen. */
export function staffHeaderWidth(signature: number, space = 6): number {
    return space * 4 + Math.abs(signature) * space * 1.25 + space;
}

/** Selbst gezeichnetes Notensystem (Violinschlüssel, Generalvorzeichen, optional ganze Noten) als SVG-Gruppe. */
const StaffSvg: React.FC<StaffSvgProps> = ({
    x,
    y,
    space = 6,
    width,
    signature = 0,
    highlightAccidentals = [],
    highlightColor = '#7c3aed',
    notes = [],
    color = '#1e293b',
}) => {
    const fontSize = space * 4;
    const bottom = y + space * 4;
    const stepY = (step: number) => bottom - (step * space) / 2;
    const w = width ?? staffHeaderWidth(signature, space);

    const accidentals = signatureNotes(signature);
    const steps = signature >= 0 ? SHARP_STEPS : FLAT_STEPS;
    const accX0 = x + space * 3.6;

    return (
        <g>
            {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1={x} x2={x + w} y1={y + i * space} y2={y + i * space} stroke={color} strokeWidth={Math.max(0.6, space / 8)} />
            ))}
            <text x={x + space * 0.4} y={stepY(2)} fontFamily="Bravura" fontSize={fontSize} fill={color}>
                {GLYPH.gClef}
            </text>
            {accidentals.map((_, i) => (
                <text
                    key={i}
                    x={accX0 + i * space * 1.25}
                    y={stepY(steps[i])}
                    fontFamily="Bravura"
                    fontSize={fontSize}
                    fill={highlightAccidentals.includes(i) ? highlightColor : color}
                >
                    {signature > 0 ? GLYPH.sharp : GLYPH.flat}
                </text>
            ))}
            {notes.map((n, i) => {
                const nx = x + n.x;
                const ny = stepY(n.step);
                const c = n.color ?? color;
                const ledgers: number[] = [];
                for (let s = -2; s >= n.step; s -= 2) ledgers.push(s);
                for (let s = 10; s <= n.step; s += 2) ledgers.push(s);
                return (
                    <g key={i}>
                        {ledgers.map((s) => (
                            <line key={s} x1={nx - space * 0.5} x2={nx + space * 2.1} y1={stepY(s)} y2={stepY(s)} stroke={c} strokeWidth={Math.max(0.6, space / 8)} />
                        ))}
                        {n.acc ? (
                            <text x={nx - space * 1.4} y={ny} fontFamily="Bravura" fontSize={fontSize} fill={c}>
                                {n.acc > 0 ? GLYPH.sharp : GLYPH.flat}
                            </text>
                        ) : null}
                        <text x={nx} y={ny} fontFamily="Bravura" fontSize={fontSize} fill={c}>
                            {GLYPH.noteheadWhole}
                        </text>
                    </g>
                );
            })}
        </g>
    );
};

export default StaffSvg;
