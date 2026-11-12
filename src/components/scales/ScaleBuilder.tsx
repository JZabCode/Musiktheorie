import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Undo2, Eraser, ChevronUp, ChevronDown } from 'lucide-react';
import type { Clef } from '../../types';
import { BOTTOM_LINE_DIA, STEP_RANGE, toneName, type ScaleNote } from '../../lib/scales';
import { audio } from '../../lib/audio';
import ScaleStaff, { AccidentalGlyph, WholeNoteIcon, STAFF_TOP, STAFF_BOTTOM, SP, noteX, stepFromY, staffWidth, type StaffNote, type StaffText } from './ScaleStaff';

export const MAX_NOTES = 10;

interface ScaleBuilderProps {
    clef: Clef;
    notes: ScaleNote[];
    onChange: (notes: ScaleNote[]) => void;
    /** Nach dem Prüfen gesperrt. */
    disabled?: boolean;
    /** Farben je Note (z. B. nach der Korrektur). */
    noteColors?: (string | undefined)[];
    labels?: (StaffText | null)[];
    steps?: (StaffText | null)[];
}

type DragState =
    | { kind: 'new'; x: number; y: number; step: number | null }
    | { kind: 'move'; index: number; startY: number; moved: boolean };

const clampStep = (step: number) => Math.min(STEP_RANGE.max, Math.max(STEP_RANGE.min, step));

const ACCENT = '#0d9488';

/**
 * Interaktive Notenzeile zum Bilden von Tonleitern.
 * - Ganze Note aus der Palette in die Zeile ziehen (oder in die Zeile tippen) → wird rechts angehängt.
 * - Gesetzte Note antippen → Vorzeichen wählen / Note löschen.
 * - Gesetzte Note nach oben/unten ziehen → Tonhöhe ändern.
 */
const ScaleBuilder: React.FC<ScaleBuilderProps> = ({ clef, notes, onChange, disabled = false, noteColors, labels, steps }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState<number | null>(null);
    const [drag, setDrag] = useState<DragState | null>(null);

    // Aktuelle Noten für die globalen Pointer-Handler
    const notesRef = useRef(notes);
    useEffect(() => { notesRef.current = notes; }, [notes]);

    const bottomDia = BOTTOM_LINE_DIA[clef];
    const full = notes.length >= MAX_NOTES;

    // Auswahl aufheben, wenn gesperrt oder die Note nicht mehr existiert
    useEffect(() => {
        if (disabled || (selected != null && selected >= notes.length)) setSelected(null);
    }, [disabled, notes.length, selected]);

    const playNote = (n: ScaleNote) => audio.playNote(toneName(n), '4n');

    // Auf schmalen Bildschirmen den nächsten freien Platz im sichtbaren Bereich halten
    useEffect(() => {
        const box = scrollRef.current;
        if (!box || box.scrollWidth <= box.clientWidth) return;
        const scale = box.scrollWidth / staffWidth(MAX_NOTES);
        const target = noteX(Math.min(notes.length, MAX_NOTES - 1)) * scale;
        box.scrollTo({ left: Math.max(0, target - box.clientWidth * 0.6), behavior: 'smooth' });
    }, [notes.length]);

    /** Client-Koordinaten → Schritt im System, oder null außerhalb der Notenzeile. */
    const stepAt = (clientX: number, clientY: number): number | null => {
        const svg = svgRef.current;
        const ctm = svg?.getScreenCTM();
        if (!svg || !ctm) return null;
        const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
        const vb = svg.viewBox.baseVal;
        const inside = p.x >= 0 && p.x <= vb.width && p.y >= STAFF_TOP - SP * 4 && p.y <= STAFF_BOTTOM + SP * 4;
        return inside ? clampStep(stepFromY(p.y)) : null;
    };

    const appendNote = (step: number) => {
        if (notesRef.current.length >= MAX_NOTES) return;
        const note = { dia: bottomDia + step, acc: 0 };
        onChange([...notesRef.current, note]);
        playNote(note);
    };

    // Globale Pointer-Events während des Ziehens
    useEffect(() => {
        if (!drag) return;

        const onMove = (e: PointerEvent) => {
            if (drag.kind === 'new') {
                setDrag({ kind: 'new', x: e.clientX, y: e.clientY, step: stepAt(e.clientX, e.clientY) });
                return;
            }
            if (!drag.moved && Math.abs(e.clientY - drag.startY) < 4) return;
            const step = stepAt(e.clientX, e.clientY);
            if (step == null) return;
            const current = notesRef.current[drag.index];
            const dia = bottomDia + step;
            if (current && current.dia !== dia) {
                const next = notesRef.current.map((n, i) => (i === drag.index ? { ...n, dia } : n));
                onChange(next);
            }
            if (!drag.moved) setDrag({ ...drag, moved: true });
        };

        const onUp = (e: PointerEvent) => {
            if (drag.kind === 'new') {
                const step = stepAt(e.clientX, e.clientY);
                if (step != null) appendNote(step);
            } else if (drag.moved) {
                const n = notesRef.current[drag.index];
                if (n) playNote(n);
                setSelected(drag.index);
            } else {
                setSelected((s) => (s === drag.index ? null : drag.index));
            }
            setDrag(null);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drag, bottomDia]);

    const startNewDrag = (e: React.PointerEvent) => {
        if (disabled || full) return;
        e.preventDefault();
        setSelected(null);
        setDrag({ kind: 'new', x: e.clientX, y: e.clientY, step: null });
    };

    const onBackgroundPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
        if (disabled) return;
        if (selected != null) {
            setSelected(null);
            return;
        }
        const step = stepAt(e.clientX, e.clientY);
        if (step != null) appendNote(step);
    };

    const onNotePointerDown = (index: number, e: React.PointerEvent<SVGRectElement>) => {
        if (disabled) return;
        e.preventDefault();
        setDrag({ kind: 'move', index, startY: e.clientY, moved: false });
    };

    const setAccidental = (acc: number) => {
        if (selected == null) return;
        const next = notes.map((n, i) => (i === selected ? { ...n, acc } : n));
        onChange(next);
        playNote(next[selected]);
    };

    const moveSelected = (delta: number) => {
        if (selected == null) return;
        const n = notes[selected];
        const step = n.dia - bottomDia + delta;
        if (step < STEP_RANGE.min || step > STEP_RANGE.max) return;
        const next = notes.map((m, i) => (i === selected ? { ...m, dia: m.dia + delta } : m));
        onChange(next);
        playNote(next[selected]);
    };

    const deleteSelected = () => {
        if (selected == null) return;
        onChange(notes.filter((_, i) => i !== selected));
        setSelected(null);
    };

    const staffNotes: StaffNote[] = notes.map((n, i) => ({
        ...n,
        color: noteColors?.[i] ?? (i === selected ? ACCENT : undefined),
    }));

    const ghost = drag?.kind === 'new' && drag.step != null ? { slot: notes.length, step: drag.step } : null;
    const selectedNote = selected != null ? notes[selected] : null;

    return (
        <div className="select-none">
            {/* Palette */}
            {!disabled && (
                <div className="flex items-center justify-center gap-3 mb-3">
                    <div
                        onPointerDown={startNewDrag}
                        className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border-2 ${full ? 'border-slate-200 opacity-40 cursor-not-allowed' : 'border-teal-300 bg-teal-50 cursor-grab active:cursor-grabbing hover:bg-teal-100'} transition-colors`}
                        style={{ touchAction: 'none' }}
                        role="button"
                        aria-label="Ganze Note in die Notenzeile ziehen"
                    >
                        <WholeNoteIcon />
                        <span className="text-sm font-semibold text-teal-800">Ganze Note</span>
                    </div>
                    <span className="text-xs text-slate-500 max-w-[220px] text-left leading-snug">
                        {full
                            ? `Höchstens ${MAX_NOTES} Noten möglich.`
                            : 'In die Notenzeile ziehen – oder direkt in die Zeile tippen.'}
                    </span>
                </div>
            )}

            {/* Notenzeile */}
            <div ref={scrollRef} className="bg-white rounded-xl border border-slate-200 px-2 py-1 overflow-x-auto">
                <ScaleStaff
                    clef={clef}
                    notes={staffNotes}
                    slots={MAX_NOTES}
                    labels={labels}
                    steps={steps}
                    ghost={ghost}
                    nextSlot={!disabled && !full ? notes.length : null}
                    selectedIndex={selected}
                    svgRef={svgRef}
                    onBackgroundPointerDown={disabled ? undefined : onBackgroundPointerDown}
                    onNotePointerDown={disabled ? undefined : onNotePointerDown}
                    ariaLabel="Notenzeile zum Bilden der Tonleiter"
                    minWidth={520}
                />
            </div>

            {/* Werkzeugleiste */}
            {!disabled && (
                <div className="mt-3 min-h-[52px] flex flex-wrap items-center justify-center gap-2">
                    {selectedNote ? (
                        <>
                            <span className="text-sm font-semibold text-slate-600 mr-1">{selected! + 1}. Note:</span>
                            {[
                                { delta: 1, title: 'Einen Ton höher', icon: <ChevronUp size={20} /> },
                                { delta: -1, title: 'Einen Ton tiefer', icon: <ChevronDown size={20} /> },
                            ].map(({ delta, title, icon }) => (
                                <button
                                    key={delta}
                                    onClick={() => moveSelected(delta)}
                                    title={title}
                                    aria-label={title}
                                    className="w-[42px] h-[42px] rounded-lg border-2 border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors"
                                >
                                    {icon}
                                </button>
                            ))}
                            <span className="w-px h-8 bg-slate-200 mx-1" aria-hidden="true" />
                            {[
                                { acc: 1, title: 'Kreuz' },
                                { acc: -1, title: 'Be' },
                                { acc: 0, title: 'Kein Vorzeichen' },
                            ].map(({ acc, title }) => (
                                <button
                                    key={acc}
                                    onClick={() => setAccidental(acc)}
                                    title={title}
                                    aria-label={title}
                                    className={`min-w-[48px] h-[42px] px-3 rounded-lg border-2 text-sm font-bold flex items-center justify-center transition-colors ${selectedNote.acc === acc ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                >
                                    {acc === 0 ? 'ohne' : <AccidentalGlyph acc={acc} />}
                                </button>
                            ))}
                            <button
                                onClick={deleteSelected}
                                className="flex items-center gap-1 px-3 h-[42px] rounded-lg border-2 border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-colors"
                            >
                                <Trash2 size={16} /> Note löschen
                            </button>
                        </>
                    ) : (
                        notes.length > 0 && (
                            <>
                                <span className="text-xs text-slate-400 mr-2">Note antippen für Vorzeichen oder andere Tonhöhe</span>
                                <button
                                    onClick={() => onChange(notes.slice(0, -1))}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 text-sm transition-colors"
                                >
                                    <Undo2 size={16} /> Letzte Note entfernen
                                </button>
                                <button
                                    onClick={() => onChange([])}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 text-sm transition-colors"
                                >
                                    <Eraser size={16} /> Alle löschen
                                </button>
                            </>
                        )
                    )}
                </div>
            )}

            {/* Zieh-Vorschau außerhalb der Notenzeile */}
            {drag?.kind === 'new' && drag.step == null && (
                <div className="fixed pointer-events-none z-50" style={{ left: drag.x - 17, top: drag.y - 17 }}>
                    <WholeNoteIcon />
                </div>
            )}
        </div>
    );
};

export default ScaleBuilder;
