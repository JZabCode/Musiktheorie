import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Annotation, AnnotationVerticalJustify } from 'vexflow';
import type { Clef } from '../../types';

interface MnemonicNotationProps {
    clef: Clef;
    type: 'lines' | 'spaces';
}

/**
 * VexFlow key mappings for mnemonic notes.
 * VexFlow uses 'b' for the German 'H' (international B = German H).
 */
const MNEMONIC_KEYS: Record<string, Record<string, { keys: string[]; labels: string[] }>> = {
    treble: {
        lines: { keys: ['e/4', 'g/4', 'b/4', 'd/5', 'f/5'], labels: ['e1', 'g1', 'h1', 'd2', 'f2'] },
        spaces: { keys: ['f/4', 'a/4', 'c/5', 'e/5'], labels: ['f1', 'a1', 'c2', 'e2'] },
    },
    bass: {
        lines: { keys: ['g/2', 'b/2', 'd/3', 'f/3', 'a/3'], labels: ['G', 'H', 'd', 'f', 'a'] },
        spaces: { keys: ['a/2', 'c/3', 'e/3', 'g/3'], labels: ['A', 'c', 'e', 'g'] },
    },
};

const MnemonicNotation: React.FC<MnemonicNotationProps> = ({ clef, type }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const data = MNEMONIC_KEYS[clef]?.[type];
        if (!data) return;

        try {
            containerRef.current.innerHTML = '';

            const noteCount = data.keys.length;
            const width = Math.max(280, noteCount * 55 + 80);
            const height = 150;

            const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
            renderer.resize(width, height);
            const context = renderer.getContext();

            const stave = new Stave(10, 20, width - 20);
            stave.addClef(clef);
            stave.setContext(context).draw();

            // Create individual quarter notes with German note labels
            const notes = data.keys.map((key, i) => {
                const staveNote = new StaveNote({
                    clef,
                    keys: [key],
                    duration: 'q',
                });

                // Add German note name annotation below the note
                const annotation = new Annotation(data.labels[i])
                    .setVerticalJustification(AnnotationVerticalJustify.BOTTOM);
                staveNote.addModifier(annotation);

                return staveNote;
            });

            const voice = new Voice({ numBeats: noteCount, beatValue: 4 });
            voice.setStrict(false);
            voice.addTickables(notes);

            new Formatter().joinVoices([voice]).format([voice], width - 80);
            voice.draw(context, stave);
        } catch (e) {
            console.error('VexFlow MnemonicNotation Error:', e);
            if (containerRef.current) {
                containerRef.current.innerHTML = `<div class="text-red-500 p-2 text-xs">Notationsfehler</div>`;
            }
        }
    }, [clef, type]);

    return (
        <div
            ref={containerRef}
            className="bg-white rounded-lg border border-amber-200 overflow-hidden mt-2"
            style={{ minHeight: 150 }}
        />
    );
};

export default MnemonicNotation;
