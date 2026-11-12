import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import type { NoteSelection } from './IntervalBuildInput';

interface IntervalBuildNotationProps {
    /** The root note to display (e.g., 'c/4') */
    rootKey: string;
    /** The selected note from the user, if any */
    selection: NoteSelection | null;
    width?: number;
    height?: number;
}

const IntervalBuildNotation: React.FC<IntervalBuildNotationProps> = ({
    rootKey,
    selection,
    width = 200,
    height = 180
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<Renderer | null>(null);

    // Compute display keys
    const getDisplayKeys = (): string[] => {
        const keys = [rootKey];
        if (selection) {
            const rootParts = rootKey.split('/');
            const rootLetter = rootParts[0].charAt(0).toLowerCase();
            const rootOctave = parseInt(rootParts[1], 10);

            const letters = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
            const rIdx = letters.indexOf(rootLetter);
            const sIdx = letters.indexOf(selection.letter.toLowerCase());

            let oct = rootOctave;
            if (sIdx <= rIdx) {
                oct += 1;
            }
            if (sIdx === rIdx) oct = rootOctave;

            keys.push(`${selection.letter}${selection.accidental}/${oct}`);
        }
        return keys;
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // Cleanup existing SVG
        while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
        }

        // Create renderer (or recreate if dimensions changed)
        const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
        renderer.resize(width, height);
        rendererRef.current = renderer;

        // Draw notation
        const context = renderer.getContext();

        const scale = 1.3;
        context.scale(scale, scale);
        const scaledWidth = width / scale;

        const stave = new Stave(10, 10, scaledWidth - 20);

        const rootOctave = parseInt(rootKey.split('/')[1], 10) || 4;
        const clef = rootOctave < 4 ? 'bass' : 'treble';
        stave.addClef(clef);
        stave.setContext(context).draw();

        const keys = getDisplayKeys();

        const note = new StaveNote({ clef, keys: keys, duration: 'w' });

        keys.forEach((key, index) => {
            const [noteName] = key.split('/');
            const accidental = noteName.slice(1);
            if (accidental) {
                note.addModifier(new Accidental(accidental), index);
            }
        });

        const voice = new Voice({ numBeats: 4, beatValue: 4 });
        voice.addTickables([note]);

        new Formatter().joinVoices([voice]).format([voice], scaledWidth - 50);
        voice.draw(context, stave);

        return () => {
            if (containerRef.current) {
                while (containerRef.current.firstChild) {
                    containerRef.current.removeChild(containerRef.current.firstChild);
                }
            }
            rendererRef.current = null;
        };
    }, [width, height, rootKey, selection]);

    return (
        <div
            ref={containerRef}
            className="flex justify-center items-center bg-white rounded-xl shadow-inner border border-slate-200"
        />
    );
};

export default IntervalBuildNotation;
