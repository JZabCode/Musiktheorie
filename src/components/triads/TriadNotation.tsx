import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';

export type TriadType = 'Dur' | 'Moll' | 'Vermindert' | 'Übermäßig';

interface TriadNotationProps {
    type: TriadType;
    width?: number;
    height?: number;
}

/**
 * Maps each triad type to its VexFlow chord keys and accidental info.
 * All triads built on c1 (= c/4 in VexFlow).
 *   Dur:        C – E – G
 *   Moll:       C – Eb – G
 *   Vermindert: C – Eb – Gb
 *   Übermäßig:  C – E – G#
 */
export const TRIAD_DATA: Record<TriadType, {
    keys: string[];
    accidentals: (string | null)[];
}> = {
    Dur: {
        keys: ['c/4', 'e/4', 'g/4'],
        accidentals: [null, null, null],
    },
    Moll: {
        keys: ['c/4', 'eb/4', 'g/4'],
        accidentals: [null, 'b', null],
    },
    Vermindert: {
        keys: ['c/4', 'eb/4', 'gb/4'],
        accidentals: [null, 'b', 'b'],
    },
    Übermäßig: {
        keys: ['c/4', 'e/4', 'g#/4'],
        accidentals: [null, null, '#'],
    },
};

const TriadNotation: React.FC<TriadNotationProps> = ({ type, width = 240, height = 160 }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        try {
            containerRef.current.innerHTML = '';

            const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
            renderer.resize(width, height);
            const context = renderer.getContext();
            context.setFont('Arial', 10, '');

            const stave = new Stave(10, 20, width - 20);
            stave.addClef('treble');
            stave.setContext(context).draw();

            const data = TRIAD_DATA[type];

            // Create a single chord with all three notes stacked vertically
            const chord = new StaveNote({
                clef: 'treble',
                keys: data.keys,
                duration: 'w',
            });

            // Add accidentals where needed
            data.accidentals.forEach((acc, i) => {
                if (acc) {
                    chord.addModifier(new Accidental(acc), i);
                }
            });

            const voice = new Voice({ numBeats: 4, beatValue: 4 });
            voice.addTickables([chord]);

            new Formatter().joinVoices([voice]).format([voice], width - 80);
            voice.draw(context, stave);

        } catch (e) {
            console.error('VexFlow TriadNotation Error:', e);
            if (containerRef.current) {
                containerRef.current.innerHTML = `<div class="text-red-500 p-4">Notationsfehler: ${(e as Error).message}</div>`;
            }
        }
    }, [type, width, height]);

    return (
        <div
            ref={containerRef}
            className="bg-white rounded-xl shadow-inner border border-slate-200 flex justify-center items-center overflow-hidden"
        />
    );
};

export default TriadNotation;
