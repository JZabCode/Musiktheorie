import React from 'react';
import 'vexflow'; // lädt die Notenschrift „Bravura“ in document.fonts
import type { Clef } from '../../types';
import { BOTTOM_LINE_DIA, type ScaleNote } from '../../lib/scales';

/**
 * Selbst gezeichnetes Notensystem für Tonleitern (SVG mit Bravura-Glyphen).
 * Wird statisch in der Anleitung/Lösung und interaktiv in der Eingabe genutzt –
 * deshalb liegen alle Koordinaten fest und sind exportiert.
 */

// --- Layout (Einheiten der viewBox) ---
export const SP = 12;                 // Linienabstand
const TOP_PAD = 6 * SP;               // Platz für hohe Noten + Halbtonbögen
export const STAFF_TOP = TOP_PAD;
export const STAFF_BOTTOM = STAFF_TOP + 4 * SP;
const FIRST_X = 6.2 * SP;             // linke Kante des ersten Notenkopfs (Platz für Schlüssel + Vorzeichen)
export const NOTE_SPACING = 4.5 * SP;
const HEAD_W = 1.68 * SP;             // Breite eines ganzen Notenkopfs (Bravura)
const ROWS_TOP = STAFF_BOTTOM + 3.6 * SP;
const ROW_H = 1.9 * SP;

const GLYPH = {
    gClef: '',
    fClef: '',
    flat: '',
    sharp: '',
    noteheadWhole: '',
};

const INK = '#1e293b';

export const stepY = (step: number) => STAFF_BOTTOM - (step * SP) / 2;
export const noteX = (slot: number) => FIRST_X + slot * NOTE_SPACING;
export const noteCenterX = (slot: number) => noteX(slot) + HEAD_W / 2;
export const staffWidth = (slots: number) => FIRST_X + slots * NOTE_SPACING + SP;

/** Diatonische Position → Schritt ab unterster Linie im jeweiligen Schlüssel. */
export const toStep = (dia: number, clef: Clef) => dia - BOTTOM_LINE_DIA[clef];

/** Schritt aus einer y-Koordinate (gerundet auf Linie/Zwischenraum). */
export const stepFromY = (y: number) => Math.round(((STAFF_BOTTOM - y) * 2) / SP);

export interface StaffNote extends ScaleNote {
    color?: string;
}

export interface StaffText {
    text: string;
    color?: string;
}

interface ScaleStaffProps {
    clef: Clef;
    notes: StaffNote[];
    /** Breite in Notenplätzen (Standard: Anzahl Noten, mindestens 8). */
    slots?: number;
    /** Beschriftung unter jeder Note (z. B. Notennamen). */
    labels?: (StaffText | null)[];
    /** Stufenzahlen 1, 2, 3 … unter den Noten. */
    showDegrees?: boolean;
    /** Schrittgrößen zwischen Note i und i+1 (z. B. „1“, „½“). */
    steps?: (StaffText | null)[];
    /** Halbtonbögen zwischen Note i und i+1. */
    halfStepArcs?: number[];
    arcColor?: string;
    /** Vorschau-Note (halbtransparent), z. B. beim Ziehen. */
    ghost?: { slot: number; step: number } | null;
    /** Markiert den nächsten freien Notenplatz. */
    nextSlot?: number | null;
    selectedIndex?: number | null;
    selectedColor?: string;
    svgRef?: React.Ref<SVGSVGElement>;
    onBackgroundPointerDown?: (e: React.PointerEvent<SVGSVGElement>) => void;
    onNotePointerDown?: (index: number, e: React.PointerEvent<SVGRectElement>) => void;
    ariaLabel?: string;
    /** Mindestbreite in px – auf schmalen Bildschirmen wird dann seitlich gescrollt. */
    minWidth?: number;
}

/** Vorzeichen in der Notenschrift Bravura (Buttons und Bedienungshilfe). */
export const AccidentalGlyph: React.FC<{ acc: number }> = ({ acc }) => (
    <svg width={16} height={26} viewBox="0 0 16 26" aria-hidden="true" className="inline-block">
        <text x={3} y={acc > 0 ? 13 : 17} fontFamily="Bravura" fontSize={28} fill="currentColor">
            {acc > 0 ? '\uE262' : '\uE260'}
        </text>
    </svg>
);

/** Ganze Note als kleines Symbol (Palette und Zieh-Vorschau). */
export const WholeNoteIcon: React.FC<{ size?: number }> = ({ size = 34 }) => (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
        <text x={7} y={22} fontFamily="Bravura" fontSize={40} fill="#1e293b">{''}</text>
    </svg>
);

const LedgerLines: React.FC<{ x: number; step: number; color: string }> = ({ x, step, color }) => {
    const ledgers: number[] = [];
    for (let s = -2; s >= step; s -= 2) ledgers.push(s);
    for (let s = 10; s <= step; s += 2) ledgers.push(s);
    return (
        <>
            {ledgers.map((s) => (
                <line key={s} x1={x - SP * 0.45} x2={x + HEAD_W + SP * 0.45} y1={stepY(s)} y2={stepY(s)} stroke={color} strokeWidth={1.1} />
            ))}
        </>
    );
};

const ScaleStaff: React.FC<ScaleStaffProps> = ({
    clef,
    notes,
    slots,
    labels,
    showDegrees = false,
    steps,
    halfStepArcs = [],
    arcColor = '#0d9488',
    ghost,
    nextSlot,
    selectedIndex,
    selectedColor = '#0d9488',
    svgRef,
    onBackgroundPointerDown,
    onNotePointerDown,
    ariaLabel = 'Notenzeile',
    minWidth = 420,
}) => {
    const slotCount = slots ?? Math.max(8, notes.length);
    const width = staffWidth(slotCount);

    const rows: ('labels' | 'degrees' | 'steps')[] = [];
    if (labels) rows.push('labels');
    if (showDegrees) rows.push('degrees');
    if (steps) rows.push('steps');
    const rowY = (row: 'labels' | 'degrees' | 'steps') => ROWS_TOP + rows.indexOf(row) * ROW_H;
    const height = ROWS_TOP + Math.max(0, rows.length - 1) * ROW_H + SP * 1.2;

    const stepOf = (n: ScaleNote) => toStep(n.dia, clef);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', minWidth, maxWidth: width * 1.25, height: 'auto', display: 'block', margin: '0 auto', touchAction: onNotePointerDown ? 'pan-x' : undefined }}
            onPointerDown={onBackgroundPointerDown}
            aria-label={ariaLabel}
            role="img"
        >
            {/* Hintergrund als Klickfläche */}
            <rect x={0} y={0} width={width} height={height} fill="transparent" />

            {/* Nächster freier Platz */}
            {nextSlot != null && nextSlot < slotCount && (
                <rect
                    x={noteX(nextSlot) - SP * 0.6}
                    y={STAFF_TOP - SP * 2}
                    width={HEAD_W + SP * 1.2}
                    height={SP * 8}
                    rx={SP * 0.5}
                    fill="#f0fdfa"
                    stroke="#99f6e4"
                    strokeDasharray="4 3"
                />
            )}

            {/* Notenlinien */}
            {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1={SP * 0.3} x2={width - SP * 0.3} y1={STAFF_TOP + i * SP} y2={STAFF_TOP + i * SP} stroke={INK} strokeWidth={1.1} />
            ))}

            {/* Schlüssel */}
            <text x={SP * 0.8} y={stepY(clef === 'treble' ? 2 : 6)} fontFamily="Bravura" fontSize={SP * 4} fill={INK}>
                {clef === 'treble' ? GLYPH.gClef : GLYPH.fClef}
            </text>

            {/* Ausgewählte Note hinterlegen */}
            {selectedIndex != null && notes[selectedIndex] && (
                <rect
                    x={noteX(selectedIndex) - SP * 1.9}
                    y={STAFF_TOP - SP * 2.6}
                    width={HEAD_W + SP * 2.5}
                    height={SP * 9.2}
                    rx={SP * 0.5}
                    fill={selectedColor}
                    opacity={0.12}
                />
            )}

            {/* Noten */}
            {notes.map((n, i) => {
                const x = noteX(i);
                const step = stepOf(n);
                const y = stepY(step);
                const color = n.color ?? INK;
                return (
                    <g key={i}>
                        <LedgerLines x={x} step={step} color={color} />
                        {n.acc !== 0 && (
                            <text x={x - SP * 1.45} y={y} fontFamily="Bravura" fontSize={SP * 4} fill={color}>
                                {n.acc > 0 ? GLYPH.sharp : GLYPH.flat}
                            </text>
                        )}
                        <text x={x} y={y} fontFamily="Bravura" fontSize={SP * 4} fill={color}>
                            {GLYPH.noteheadWhole}
                        </text>
                    </g>
                );
            })}

            {/* Vorschau-Note */}
            {ghost && (
                <g opacity={0.45}>
                    <LedgerLines x={noteX(ghost.slot)} step={ghost.step} color={selectedColor} />
                    <text x={noteX(ghost.slot)} y={stepY(ghost.step)} fontFamily="Bravura" fontSize={SP * 4} fill={selectedColor}>
                        {GLYPH.noteheadWhole}
                    </text>
                </g>
            )}

            {/* Halbtonbögen */}
            {halfStepArcs.filter((i) => notes[i] && notes[i + 1]).map((i) => {
                const x1 = noteCenterX(i);
                const x2 = noteCenterX(i + 1);
                const y1 = stepY(stepOf(notes[i])) - SP * 0.9;
                const y2 = stepY(stepOf(notes[i + 1])) - SP * 0.9;
                const cy = Math.min(y1, y2) - SP * 1.8;
                const peak = (y1 + y2) / 4 + cy / 2;
                return (
                    <g key={`arc-${i}`}>
                        <path d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${cy} ${x2} ${y2}`} fill="none" stroke={arcColor} strokeWidth={2} />
                        <text x={(x1 + x2) / 2} y={peak - SP * 0.5} fontSize={SP * 1.15} fontWeight={700} fill={arcColor} textAnchor="middle">
                            ½
                        </text>
                    </g>
                );
            })}

            {/* Unterschriften */}
            {labels && labels.map((l, i) => l && (
                <text key={`label-${i}`} x={noteCenterX(i)} y={rowY('labels')} fontSize={SP * 1.1} fontWeight={600} fill={l.color ?? '#475569'} textAnchor="middle">
                    {l.text}
                </text>
            ))}
            {showDegrees && notes.map((_, i) => (
                <text key={`deg-${i}`} x={noteCenterX(i)} y={rowY('degrees')} fontSize={SP * 1.05} fill="#64748b" textAnchor="middle">
                    {i + 1}.
                </text>
            ))}
            {steps && steps.map((s, i) => s && (
                <text
                    key={`step-${i}`}
                    x={(noteCenterX(i) + noteCenterX(i + 1)) / 2}
                    y={rowY('steps')}
                    fontSize={SP * 1.15}
                    fontWeight={700}
                    fill={s.color ?? '#475569'}
                    textAnchor="middle"
                >
                    {s.text}
                </text>
            ))}

            {/* Klickflächen der Noten (oberste Ebene) */}
            {onNotePointerDown && notes.map((n, i) => (
                <rect
                    key={`hit-${i}`}
                    x={noteX(i) - SP * 1.7}
                    y={stepY(stepOf(n)) - SP * 1.1}
                    width={HEAD_W + SP * 2.2}
                    height={SP * 2.2}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        onNotePointerDown(i, e);
                    }}
                />
            ))}
        </svg>
    );
};

export default ScaleStaff;
