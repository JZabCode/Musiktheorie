import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import type { Question } from '../../types';

/** Per-note color override. `null`/`undefined` entries keep the default (black). */
export type KeyStyle = { fillStyle?: string; strokeStyle?: string } | null | undefined;

interface NotationDisplayProps {
    question: Question['question'];
    width?: number;
    height?: number;
    /** Optional per-key styling. Index matches `question.keys`. */
    keyStyles?: KeyStyle[];
}

const NotationDisplay: React.FC<NotationDisplayProps> = ({ question, width = 400, height = 200, keyStyles }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !question) return;

        try {
            containerRef.current.innerHTML = '';

            const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
            renderer.resize(width, height);
            const context = renderer.getContext();
            context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

            const stave = new Stave(10, 40, width - 20);
            stave.addClef(question.clef || "treble");
            stave.setContext(context).draw();

            if (question.keys && question.keys.length > 0) {
                const staveNote = new StaveNote({
                    clef: question.clef || "treble",
                    keys: question.keys,
                    duration: "w"
                });

                question.keys.forEach((key, index) => {
                    // Extract note part (before '/')
                    const [notePart] = key.split('/');

                    // Check if accidental exists (length > 1)
                    if (notePart.length > 1) {
                        // Extract full accidental string (handles #, b, ##, bb)
                        const accidental = notePart.substring(1);
                        staveNote.addModifier(new Accidental(accidental), index);
                    }

                    const style = keyStyles?.[index];
                    if (style) {
                        staveNote.setKeyStyle(index, style);
                    }
                });

                const notes = [staveNote];
                const voice = new Voice({ numBeats: 4, beatValue: 4 });
                voice.addTickables(notes);

                new Formatter().joinVoices([voice]).format([voice], width - 50);
                voice.draw(context, stave);
            }
        } catch (e) {
            console.error("VexFlow Rendering Error:", e);
            if (containerRef.current) {
                containerRef.current.innerHTML = `<div class="text-red-500 p-4">Notationsfehler: ${(e as Error).message}</div>`;
            }
        }

    }, [question, width, height, keyStyles]);

    return <div ref={containerRef} className="bg-white rounded-xl shadow-inner border border-slate-200 flex justify-center items-center overflow-hidden" />;
};

export default NotationDisplay;
