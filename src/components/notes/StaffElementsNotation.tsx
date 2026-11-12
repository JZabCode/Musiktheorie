import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Annotation, AnnotationVerticalJustify } from 'vexflow';

/**
 * Beschriftetes Notensystem-Diagramm für die Einführung "Noten lesen lernen".
 * Zeigt Violinschlüssel, 5 Notenlinien, 4 Zwischenräume und eine Hilfslinie
 * mit dem eingestrichenen c. Alle Elemente sind mit Pfeilen beschriftet.
 */
const StaffElementsNotation: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Layout-Konstanten (müssen mit den Pfeil-Koordinaten im SVG übereinstimmen)
    const WIDTH = 560;
    const HEIGHT = 300;
    const STAVE_X = 160;
    const STAVE_Y = 90;
    const STAVE_WIDTH = 320;

    useEffect(() => {
        if (!containerRef.current) return;

        try {
            containerRef.current.innerHTML = '';

            const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
            renderer.resize(WIDTH, HEIGHT);
            const context = renderer.getContext();

            const stave = new Stave(STAVE_X, STAVE_Y, STAVE_WIDTH);
            stave.addClef('treble');
            stave.setContext(context).draw();

            // Eingestrichenes c (Hilfslinie unter dem System)
            const note = new StaveNote({ clef: 'treble', keys: ['c/4'], duration: 'w' });
            const annotation = new Annotation('c')
                .setVerticalJustification(AnnotationVerticalJustify.BOTTOM);
            note.addModifier(annotation);

            const voice = new Voice({ numBeats: 4, beatValue: 4 });
            voice.setStrict(false);
            voice.addTickables([note]);
            new Formatter().joinVoices([voice]).format([voice], STAVE_WIDTH - 80);
            voice.draw(context, stave);
        } catch (e) {
            console.error('VexFlow StaffElementsNotation Error:', e);
        }
    }, []);

    // Y-Koordinaten der Notenlinien (10px Standard-Abstand)
    const lineTopY = STAVE_Y;            // 5. Linie (oberste)
    const space2Y = STAVE_Y + 15;        // 3. Zwischenraum
    const ledgerY = STAVE_Y + 50;        // Hilfslinie unter dem System (c')
    const clefX = STAVE_X + 25;
    const noteX = STAVE_X + 130;

    return (
        <div className="relative bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div ref={containerRef} style={{ width: WIDTH, height: HEIGHT, margin: '0 auto' }} />

            {/* Beschriftungs-Overlay */}
            <svg
                className="absolute inset-0 pointer-events-none"
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                style={{ width: '100%', height: '100%' }}
            >
                <defs>
                    <marker
                        id="arrow"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
                    </marker>
                </defs>

                {/* Violinschlüssel */}
                <line
                    x1="80" y1="50" x2={clefX - 10} y2={STAVE_Y + 25}
                    stroke="#4f46e5" strokeWidth="1.5" markerEnd="url(#arrow)"
                />
                <text x="20" y="42" fontSize="13" fontWeight="600" fill="#4f46e5">
                    Violinschlüssel
                </text>

                {/* 5 Notenlinien */}
                <line
                    x1={STAVE_X + STAVE_WIDTH - 60} y1="100" x2={STAVE_X + STAVE_WIDTH - 60} y2={lineTopY + 50}
                    stroke="#0891b2" strokeWidth="1.5" markerEnd="url(#arrow)"
                />
                <text x={STAVE_X + STAVE_WIDTH - 90} y="90" fontSize="13" fontWeight="600" fill="#0891b2">
                    5 Notenlinien
                </text>

                {/* 4 Zwischenräume */}
                <line
                    x1={STAVE_X + STAVE_WIDTH} y1={space2Y + 80} x2={STAVE_X + STAVE_WIDTH - 20} y2={space2Y + 52}
                    stroke="#d97706" strokeWidth="1.5" markerEnd="url(#arrow)"
                />
                <text x={STAVE_X + STAVE_WIDTH - 30} y={space2Y + 100} fontSize="13" fontWeight="600" fill="#d97706">
                    4 Zwischenräume
                </text>
               
                {/* Hilfslinie + Note */}
                <line
                    x1={noteX - 160} y1={ledgerY + 80} x2={noteX - 92} y2={ledgerY + 42}
                    stroke="#059669" strokeWidth="1.5" markerEnd="url(#arrow)"
                />
                <text x="70" y={ledgerY + 90} fontSize="13" fontWeight="600" fill="#059669">
                    Hilfslinie
                </text>
                <text x="70" y={ledgerY + 106} fontSize="11" fill="#059669">
                    (für Töne außerhalb des Notensystems)
                </text>

                {/* Note "eingestrichenes c" */}
                <line
                    x1={noteX} y1={ledgerY + 80} x2={noteX - 60} y2={ledgerY + 45}
                    stroke="#be185d" strokeWidth="1.5" markerEnd="url(#arrow)"
                />
                <text x={noteX} y={ledgerY + 90} fontSize="13" fontWeight="600" fill="#be185d">
                    eingestrichenes c (c1) 
                </text>
                <text x={noteX} y={ledgerY + 106} fontSize="11" fill="#be185d">
                    (mittleres c auf dem Klavier)
                </text>
            </svg>
        </div>
    );
};

export default StaffElementsNotation;
