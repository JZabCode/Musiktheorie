import React from 'react';
import { BookOpen, ArrowLeft, Play, AudioLines } from 'lucide-react';
import TriadNotation, { TRIAD_DATA } from './TriadNotation';
import type { TriadType } from './TriadNotation';
import NotationDisplay from '../game/NotationDisplay';
import { audio, vexKeyToToneNote } from '../../lib/audio';

interface TriadsExplanationProps {
    onBack: () => void;
}

const ChordPlayButtons: React.FC<{ vexKeys: string[] }> = ({ vexKeys }) => {
    const notes = vexKeys.map(vexKeyToToneNote);
    return (
        <div className="flex gap-2 mt-1">
            <button
                onClick={() => audio.playChord(notes)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
                aria-label="Akkord zusammen abspielen"
            >
                <Play size={12} fill="currentColor" /> Akkord
            </button>
            <button
                onClick={() => audio.playArpeggioChord(notes)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
                aria-label="Töne nacheinander abspielen"
            >
                <AudioLines size={12} /> Arpeggio
            </button>
        </div>
    );
};

const TriadsExplanation: React.FC<TriadsExplanationProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col items-center px-4 py-6">
            <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-lg border border-slate-100 text-left max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-rose-500">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <ArrowLeft size={20} /> Zurück
                    </button>
                    <div className="flex items-center gap-2">
                        <BookOpen size={24} className="text-rose-600" />
                        <h2 className="text-xl font-bold text-rose-600 m-0">
                            Dreiklänge bestimmen
                        </h2>
                    </div>
                </div>

                {/* Intro */}
                <div className="mb-8">
                    <p className="text-lg leading-relaxed text-slate-700">
                        Dreiklänge bestehen aus drei Tönen, die in Terzen aufeinandergestapelt werden.
                        Die vier Grundtypen unterscheiden sich durch die Kombination von großen und kleinen Terzen.
                    </p>
                </div>

                {/* Reference Table */}
                <section className="mb-6">
                    <h3 className="text-center mb-4 text-slate-700 font-bold text-lg">Die vier Dreiklang-Typen</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm bg-white border border-slate-200 rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-slate-100 border-b-2 border-slate-200">
                                    <th className="p-3 text-left font-bold text-slate-700">Typ</th>
                                    <th className="p-3 text-center font-bold text-slate-700">Aufbau</th>
                                    <th className="p-3 text-center font-bold text-slate-700">Halbtonschritte</th>
                                </tr>
                            </thead>
                            <tbody>
                                {([
                                    ['Dur', 'Große + Kleine Terz', '4 + 3'],
                                    ['Moll', 'Kleine + Große Terz', '3 + 4'],
                                    ['Vermindert', 'Kleine + Kleine Terz', '3 + 3'],
                                    ['Übermäßig', 'Große + Große Terz', '4 + 4'],
                                ] as [string, string, string][]).map(([type, structure, semitones], idx) => (
                                    <tr key={type} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                        <td className="p-3 font-bold text-slate-700">{type}</td>
                                        <td className="p-3 text-center text-slate-600">{structure}</td>
                                        <td className="p-3 text-center font-bold text-rose-600">{semitones}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Notation Examples */}
                <section className="mb-6">
                    <h3 className="text-center mb-4 text-slate-700 font-bold text-lg">Notenbeispiele auf C</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(['Dur', 'Moll', 'Vermindert', 'Übermäßig'] as TriadType[]).map((triadType) => {
                            const subtitles: Record<TriadType, string> = {
                                Dur: 'C – E – G',
                                Moll: 'C – Es – G',
                                Vermindert: 'C – Es – Ges',
                                Übermäßig: 'C – E – Gis',
                            };
                            return (
                                <div key={triadType} className="flex flex-col items-center gap-1 bg-slate-50 rounded-xl p-3 border border-slate-200">
                                    <span className="font-bold text-slate-700 text-sm">C-{triadType}</span>
                                    <TriadNotation type={triadType} width={240} height={160} />
                                    <span className="text-xs text-slate-500">{subtitles[triadType]}</span>
                                    <ChordPlayButtons vexKeys={TRIAD_DATA[triadType].keys} />
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* How to build a triad */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-rose-500">
                    <h3 className="mt-0 mb-4 text-rose-600 font-bold text-lg underline">
                        Wie bilde ich einen Dreiklang, z.&nbsp;B. A-Dur?
                    </h3>
                    <ol className="list-decimal list-outside pl-5 space-y-3 text-slate-700">
                        <li>
                            Den Grundton notieren, darauf zwei Notenköpfe &bdquo;stapeln&ldquo;, geforderte Halbtonschritte notieren
                        </li>
                        <li>
                            Die drei folgenden Fragen bearbeiten:
                            <div className="mt-2 space-y-1 pl-2">
                                <p><strong>a)</strong> Welche Abstände sind vorhanden?</p>
                                <p><strong>b)</strong> Welche Abstände sind gefordert?</p>
                                <p><strong>c)</strong> Was muss ich ändern? (gegebenenfalls Noten durch Vorzeichen erhöhen oder erniedrigen!)</p>
                            </div>
                        </li>
                    </ol>
                </section>

                {/* Inversions */}
                <section className="mb-6">
                    <h3 className="text-center mb-2 text-slate-700 font-bold text-lg">Umkehrungen — durch Oktavieren entstehen sie</h3>
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                        Aus der Grundstellung entstehen die Umkehrungen, indem der unterste Ton jeweils eine Oktave nach oben verschoben wird.
                        Die Tonbuchstaben bleiben dabei dieselben — nur ihre Oktavlage ändert sich. Hier am Beispiel von C-Dur:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            {
                                keys: ['c/4', 'e/4', 'g/4'],
                                rootIndex: 0,
                                label: 'Grundstellung',
                                notes: 'c1 – e1 – g1',
                                intervals: 'Terz unten, Terz oben',
                                desc: 'Grundton (c) liegt unten',
                            },
                            {
                                keys: ['e/4', 'g/4', 'c/5'],
                                rootIndex: 2,
                                label: '1. Umkehrung',
                                notes: 'e1 – g1 – c2',
                                intervals: 'Terz unten, Quart oben',
                                desc: 'Grundton (c) eine Oktave hochoktaviert — er liegt jetzt oben',
                            },
                            {
                                keys: ['g/4', 'c/5', 'e/5'],
                                rootIndex: 1,
                                label: '2. Umkehrung',
                                notes: 'g1 – c2 – e2',
                                intervals: 'Quart unten, Terz oben',
                                desc: 'Zusätzlich die Terz (e) eine Oktave hochoktaviert — Grundton liegt in der Mitte',
                            },
                        ].map((step) => (
                            <div key={step.label} className="flex flex-col items-center gap-1 bg-slate-50 rounded-xl p-3 border border-slate-200">
                                <span className="font-bold text-slate-700 text-sm">{step.label}</span>
                                <div className="overflow-hidden" style={{ height: 115, width: 200 }}>
                                    <div style={{ marginTop: -25 }}>
                                        <NotationDisplay
                                            question={{ keys: step.keys, clef: 'treble' as const }}
                                            width={200}
                                            height={150}
                                            keyStyles={step.keys.map((_, i) =>
                                                i === step.rootIndex ? { fillStyle: '#e11d48', strokeStyle: '#e11d48' } : null
                                            )}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-slate-500">{step.notes}</span>
                                <span className="text-xs font-semibold text-rose-600">{step.intervals}</span>
                                <span className="text-xs text-slate-600 italic text-center">{step.desc}</span>
                                <ChordPlayButtons vexKeys={step.keys} />
                            </div>
                        ))}
                    </div>
                    <p className="text-slate-600 mt-4 text-sm italic">
                        💡 Merkregel: <strong>1. Umkehrung</strong> = Grundton hochoktaviert · <strong>2. Umkehrung</strong> = zusätzlich die Terz hochoktaviert. Der Akkord bleibt derselbe — nur die Reihenfolge der Töne ändert sich.
                    </p>
                </section>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg transition-colors"
                    >
                        Zurück zur Übersicht
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TriadsExplanation;
