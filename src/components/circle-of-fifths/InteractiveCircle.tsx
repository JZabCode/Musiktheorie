import React, { useState } from 'react';
import CircleOfFifths from './CircleOfFifths';
import type { FieldHighlight } from './CircleOfFifths';
import { DiatonicChordsNotation, ScaleNotation, chordLabel } from './KeyNotation';
import type { ChordLabelMode } from './KeyNotation';
import {
    MAJOR_KEYS,
    MINOR_KEYS,
    diatonicChords,
    enharmonicHalf,
    getKey,
    germanNoteName,
    keyName,
    keyShortName,
} from '../../lib/circleOfFifths';
import type { DiatonicChord, KeyDef } from '../../lib/circleOfFifths';

/** Name, der im Zirkelfeld gedruckt ist, auf das ein Akkord fällt. */
function printedFieldName(chord: DiatonicChord): string {
    const { ring, position } = chord.circle!;
    const keys = (ring === 'outer' ? MAJOR_KEYS : MINOR_KEYS).filter((k) => k.position === position);
    const key = keys.length > 1 ? keys.find((k) => enharmonicHalf(k.tonic) === enharmonicHalf(chord.notes[0]))! : keys[0];
    return keyShortName(key);
}

export function chordHighlights(chords: DiatonicChord[], labelMode: ChordLabelMode, activeDegree: number | null): FieldHighlight[] {
    return chords
        .filter((c) => c.circle)
        .map((c) => {
            const { ring, position } = c.circle!;
            const rootName = germanNoteName(c.notes[0]);
            const shown = ring === 'outer' ? rootName : rootName.toLowerCase();
            const printed = printedFieldName(c);
            return {
                ring,
                position,
                half: position === 6 ? enharmonicHalf(c.notes[0]) : undefined,
                variant: c.degree === 1 ? 'tonic' : 'diatonic',
                badge: chordLabel(c, labelMode),
                altName: printed !== shown ? shown : undefined,
                active: c.degree === activeDegree,
            };
        });
}

const InteractiveCircle: React.FC = () => {
    const [selectedKey, setSelectedKey] = useState<KeyDef>(getKey('major', 0));
    const [labelMode, setLabelMode] = useState<ChordLabelMode>('degree');
    const [activeDegree, setActiveDegree] = useState<number | null>(null);

    const chords = diatonicChords(selectedKey);
    const highlights = chordHighlights(chords, labelMode, activeDegree);

    const selectKey = (key: KeyDef) => {
        setSelectedKey(key);
        setActiveDegree(null);
    };

    const signatureText =
        selectedKey.signature === 0
            ? 'keine Vorzeichen'
            : `${Math.abs(selectedKey.signature)} ${selectedKey.signature > 0 ? '♯' : '♭'}`;

    return (
        <div className="flex flex-col gap-6">
            <p className="text-slate-600 text-center m-0">
                Klicke auf eine Dur-Tonart (außen) oder eine Moll-Tonart (innen).
            </p>

            <CircleOfFifths
                highlights={highlights}
                onSelectKey={selectKey}
                centerTitle={keyName(selectedKey)}
                centerSubtitle={signatureText}
                className="w-full max-w-2xl mx-auto select-none"
            />

            {/* Umschalter Stufen / Funktionen */}
            <div className="flex flex-col items-center gap-3">
                <div className="inline-flex rounded-xl border border-violet-200 bg-violet-50 p-1">
                    {([
                        ['degree', 'Stufen'],
                        ['function', 'Funktionen'],
                    ] as [ChordLabelMode, string][]).map(([mode, label]) => (
                        <button
                            key={mode}
                            onClick={() => setLabelMode(mode)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                labelMode === mode ? 'bg-violet-600 text-white shadow' : 'text-violet-700 hover:bg-violet-100'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full text-xs">
                    {chords.map((c) => (
                        <div
                            key={c.degree}
                            className={`rounded-lg border px-2 py-1.5 ${c.circle ? 'border-violet-200 bg-white' : 'border-slate-200 bg-slate-50 text-slate-400'}`}
                        >
                            <span className="font-bold text-violet-700">{chordLabel(c, labelMode)}</span>{' '}
                            <span className="font-semibold">{c.symbol}</span>
                            {labelMode === 'function' && <span className="block text-slate-500">{c.functionName}</span>}
                            {labelMode === 'degree' && <span className="block text-slate-500">{c.degree}. Stufe</span>}
                        </div>
                    ))}
                </div>
            </div>

            <section>
                <h4 className="font-bold text-slate-700 mb-2">Tonleiter: {keyName(selectedKey)}</h4>
                <ScaleNotation keyDef={selectedKey} />
            </section>

            <section>
                <h4 className="font-bold text-slate-700 mb-1">Leitereigene Dreiklänge</h4>
                <p className="text-sm text-slate-500 mb-2">
                    Klicke auf einen Akkord, um ihn anzuhören. Grau: der verminderte Dreiklang auf der{' '}
                    {selectedKey.mode === 'major' ? 'VII.' : 'II.'} Stufe hat kein eigenes Feld im Quintenzirkel.
                </p>
                <DiatonicChordsNotation
                    keyDef={selectedKey}
                    labelMode={labelMode}
                    activeDegree={activeDegree}
                    onPlay={setActiveDegree}
                />
            </section>
        </div>
    );
};

export default InteractiveCircle;
