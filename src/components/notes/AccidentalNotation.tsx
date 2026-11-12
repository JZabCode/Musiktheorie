import React, { useEffect, useRef } from 'react';
import {
    Renderer, Stave, StaveNote, Voice, Formatter, Annotation, AnnotationVerticalJustify,
    Accidental, BarNote, BarlineType,
} from 'vexflow';
import type { Clef } from '../../types';

/**
 * Eine Note im Beispielbild.
 * `key` bestimmt nur die Position im System (VexFlow-Format, z. B. 'f/4'),
 * `accidental` das tatsächlich gezeichnete Vorzeichen. So lässt sich auch zeigen,
 * dass ein Vorzeichen im Takt weiter gilt, ohne erneut gezeichnet zu werden.
 */
export interface LabeledNote {
    key: string;
    accidental?: '#' | 'b' | 'n';
    label: string;
}

interface AccidentalNotationProps {
    clef: Clef;
    /** Notengruppen; zwischen zwei Gruppen wird ein Taktstrich gezeichnet. */
    groups: LabeledNote[][];
    /** Tailwind-Rahmenfarbe passend zum Abschnitt. */
    borderClass?: string;
    /** Optionale Generalvorzeichen als VexFlow-Tonartangabe (z. B. 'G' = ein Kreuz). */
    keySignature?: string;
}

/**
 * Beispiel-Notenbild für die Vorzeichen-Abschnitte der Anleitung "Noten lesen lernen".
 * Zeigt ganze Noten mit deutschem Notennamen darunter.
 */
const AccidentalNotation: React.FC<AccidentalNotationProps> = ({ clef, groups, borderClass = 'border-slate-200', keySignature }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        try {
            containerRef.current.innerHTML = '';

            const noteCount = groups.reduce((sum, g) => sum + g.length, 0);
            const width = Math.max(300, noteCount * 62 + (groups.length - 1) * 20 + 90 + (keySignature ? 40 : 0));
            const height = 160;

            const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
            renderer.resize(width, height);
            const context = renderer.getContext();

            const stave = new Stave(10, 25, width - 20);
            stave.addClef(clef);
            if (keySignature) stave.addKeySignature(keySignature);
            stave.setContext(context).draw();

            const tickables: (StaveNote | BarNote)[] = [];
            groups.forEach((group, gi) => {
                if (gi > 0) tickables.push(new BarNote(BarlineType.SINGLE));
                group.forEach(({ key, accidental, label }) => {
                    const note = new StaveNote({ clef, keys: [key], duration: 'w' });
                    if (accidental) note.addModifier(new Accidental(accidental), 0);
                    note.addModifier(
                        new Annotation(label).setVerticalJustification(AnnotationVerticalJustify.BOTTOM)
                    );
                    tickables.push(note);
                });
            });

            const voice = new Voice({ numBeats: noteCount * 4, beatValue: 4 });
            voice.setStrict(false);
            voice.addTickables(tickables);
            new Formatter().joinVoices([voice]).format([voice], width - 100 - (keySignature ? 40 : 0));
            voice.draw(context, stave);
        } catch (e) {
            console.error('VexFlow AccidentalNotation Error:', e);
            if (containerRef.current) {
                containerRef.current.innerHTML = `<div class="text-red-500 p-2 text-xs">Notationsfehler</div>`;
            }
        }
    }, [clef, groups, keySignature]);

    return (
        <div className="overflow-x-auto mt-3">
            <div
                ref={containerRef}
                className={`bg-white rounded-lg border ${borderClass} overflow-hidden w-fit mx-auto`}
                style={{ minHeight: 160 }}
            />
        </div>
    );
};

export default AccidentalNotation;
