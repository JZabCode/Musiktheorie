import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import type { NoteSelection } from './TriadBuildInput';
import { computeDisplayKeys } from './TriadBuildInput';

interface TriadBuildNotationProps {
    /** User's note selections so far */
    selections: NoteSelection[];
    width?: number;
    height?: number;
}

/**
 * Interactive VexFlow notation that renders the user's selected notes
 * progressively as a chord using Terzschichtung.
 * Shows an empty staff when no notes are selected.
 */
const TriadBuildNotation: React.FC<TriadBuildNotationProps> = ({
    selections,
    width = 200,
    height = 200,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        try {
            containerRef.current.innerHTML = '';

            const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
            renderer.resize(width, height);
            const context = renderer.getContext();
            context.setFont('Arial', 10, '');

            const stave = new Stave(10, 40, width - 20);
            stave.addClef('treble');
            stave.setContext(context).draw();

            const displayKeys = computeDisplayKeys(selections);

            if (displayKeys.length > 0) {
                const chord = new StaveNote({
                    clef: 'treble',
                    keys: displayKeys,
                    duration: 'w',
                });

                // Add accidentals
                displayKeys.forEach((key, index) => {
                    const [notePart] = key.split('/');
                    if (notePart.length > 1) {
                        const accidental = notePart.substring(1);
                        chord.addModifier(new Accidental(accidental), index);
                    }
                });

                const voice = new Voice({ numBeats: 4, beatValue: 4 });
                voice.addTickables([chord]);

                new Formatter().joinVoices([voice]).format([voice], width - 80);
                voice.draw(context, stave);
            }
        } catch (e) {
            console.error('VexFlow TriadBuildNotation Error:', e);
            if (containerRef.current) {
                containerRef.current.innerHTML = `<div class="text-red-500 p-4">Notationsfehler: ${(e as Error).message}</div>`;
            }
        }
    }, [selections, width, height]);

    return (
        <div
            ref={containerRef}
            className="bg-white rounded-xl shadow-inner border border-slate-200 flex justify-center items-center overflow-hidden"
        />
    );
};

export default TriadBuildNotation;
