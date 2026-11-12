import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Annotation, AnnotationVerticalJustify } from 'vexflow';
import { Play } from 'lucide-react';
import { audio, vexKeyToToneNote } from '../../lib/audio';
import {
    diatonicChords,
    germanNoteName,
    scaleVexKeys,
    triadVexKeys,
    vexKeySignatureSpec,
} from '../../lib/circleOfFifths';
import type { DiatonicChord, KeyDef } from '../../lib/circleOfFifths';

const ACCENT = '#7c3aed';
const MUTED = '#94a3b8';

const VEX_LETTERS = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

/** Deutscher Tonname aus einem VexFlow-Key, klein geschrieben (fis, es, h …). */
function vexKeyToGermanName(vexKey: string): string {
    const [pitch] = vexKey.split('/');
    const acc = pitch.slice(1);
    return germanNoteName({
        letter: VEX_LETTERS.indexOf(pitch[0]),
        acc: acc.startsWith('#') ? acc.length : -acc.length,
    }).toLowerCase();
}

/**
 * Rendert ein VexFlow-Notensystem mit Generalvorzeichen und skaliert es per viewBox
 * auf die Containerbreite. Gibt die x-Mitten der Noten (in viewBox-Einheiten) zurück.
 */
function useKeyStave(
    containerRef: React.RefObject<HTMLDivElement | null>,
    signature: number,
    chords: string[][],
    styles: (string | null)[],
    annotations: string[] | null,
    width: number,
    height: number,
    staveY: number,
    deps: unknown[],
): number[] {
    const [centers, setCenters] = useState<number[]>([]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        try {
            el.innerHTML = '';
            const renderer = new Renderer(el, Renderer.Backends.SVG);
            renderer.resize(width, height);
            const context = renderer.getContext();

            const stave = new Stave(8, staveY, width - 16);
            stave.addClef('treble').addKeySignature(vexKeySignatureSpec(signature));
            stave.setContext(context).draw();

            const notes = chords.map((keys, i) => {
                const note = new StaveNote({ clef: 'treble', keys, duration: 'w' });
                const color = styles[i];
                if (color) note.setStyle({ fillStyle: color, strokeStyle: color });
                if (annotations) {
                    const a = new Annotation(annotations[i]).setVerticalJustification(AnnotationVerticalJustify.BOTTOM);
                    a.setFont('Arial', 13, 'bold');
                    if (color) a.setStyle({ fillStyle: color });
                    note.addModifier(a);
                }
                return note;
            });

            const voice = new Voice({ numBeats: notes.length * 4, beatValue: 4 });
            voice.setStrict(false);
            voice.addTickables(notes);
            new Formatter().joinVoices([voice]).format([voice], stave.getNoteEndX() - stave.getNoteStartX() - 20);
            voice.draw(context, stave);

            const svg = el.querySelector('svg');
            if (svg) {
                svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
                svg.style.width = '100%';
                svg.style.height = 'auto';
            }
            setCenters(notes.map((n) => (n.getNoteHeadBeginX() + n.getNoteHeadEndX()) / 2));
        } catch (e) {
            console.error('VexFlow KeyNotation Error:', e);
            el.innerHTML = `<div class="text-red-500 p-4">Notationsfehler: ${(e as Error).message}</div>`;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return centers;
}

// --- Tonleiter ---

export const ScaleNotation: React.FC<{ keyDef: KeyDef }> = ({ keyDef }) => {
    const ref = useRef<HTMLDivElement>(null);
    const keys = scaleVexKeys(keyDef);
    const names = keys.map(vexKeyToGermanName);
    // Töne, die durch die Vorzeichnung verändert werden, farbig
    const styles = keys.map((k) => (k.split('/')[0].length > 1 ? ACCENT : null));

    useKeyStave(ref, keyDef.signature, keys.map((k) => [k]), styles, names, 640, 125, 0, [keyDef.id]);

    return (
        <div>
            <div ref={ref} className="bg-white rounded-xl border border-slate-200 overflow-hidden" />
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                <p className="text-xs text-slate-500 m-0">
                    Farbig: Töne, die durch die Vorzeichnung erhöht oder erniedrigt werden.
                </p>
                <button
                    onClick={() => audio.playArpeggioChord(keys.map(vexKeyToToneNote), 0.35, '4n')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200 transition-colors"
                >
                    <Play size={12} fill="currentColor" /> Tonleiter abspielen
                </button>
            </div>
        </div>
    );
};

// --- Diatonische Dreiklänge ---

export type ChordLabelMode = 'degree' | 'function';

export function chordLabel(chord: DiatonicChord, mode: ChordLabelMode): string {
    return mode === 'degree' ? chord.roman : chord.functionAbbr;
}

interface DiatonicChordsNotationProps {
    keyDef: KeyDef;
    labelMode: ChordLabelMode;
    activeDegree: number | null;
    onPlay: (degree: number) => void;
}

const WIDTH = 640;
const HEIGHT = 140;

export const DiatonicChordsNotation: React.FC<DiatonicChordsNotationProps> = ({ keyDef, labelMode, activeDegree, onPlay }) => {
    const ref = useRef<HTMLDivElement>(null);
    const chords = diatonicChords(keyDef);
    const keys = chords.map((c) => triadVexKeys(keyDef, c.degree));
    const styles = chords.map((c) => (c.degree === activeDegree ? ACCENT : c.circle ? null : MUTED));

    const centers = useKeyStave(ref, keyDef.signature, keys, styles, null, WIDTH, HEIGHT, 10, [keyDef.id, activeDegree]);

    const play = (chord: DiatonicChord) => {
        audio.playChord(keys[chord.degree - 1].map(vexKeyToToneNote));
        onPlay(chord.degree);
    };

    return (
        <div>
            <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div ref={ref} />
                {centers.length === chords.length &&
                    chords.map((c, i) => (
                        <button
                            key={c.degree}
                            onClick={() => play(c)}
                            className="absolute top-0 h-full -translate-x-1/2 rounded-lg hover:bg-violet-100/50 transition-colors"
                            style={{ left: `${(centers[i] / WIDTH) * 100}%`, width: `${(56 / WIDTH) * 100}%` }}
                            aria-label={`${c.symbol} abspielen`}
                            title={`${c.symbol} abspielen`}
                        />
                    ))}
            </div>
            {/* Beschriftung unter den Akkorden */}
            <div className="relative h-16 mt-1">
                {centers.length === chords.length &&
                    chords.map((c, i) => {
                        const active = c.degree === activeDegree;
                        const onCircle = !!c.circle;
                        return (
                            <button
                                key={c.degree}
                                onClick={() => play(c)}
                                className={`absolute -translate-x-1/2 flex flex-col items-center px-1.5 py-1 rounded-lg border transition-colors ${
                                    active
                                        ? 'bg-violet-600 border-violet-600 text-white'
                                        : onCircle
                                          ? 'bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100'
                                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                                }`}
                                style={{ left: `${(centers[i] / WIDTH) * 100}%` }}
                                title={c.functionName}
                            >
                                <span className="text-xs sm:text-sm font-bold leading-tight">{chordLabel(c, labelMode)}</span>
                                <span className="text-[11px] sm:text-xs leading-tight">{c.symbol}</span>
                            </button>
                        );
                    })}
            </div>
        </div>
    );
};
