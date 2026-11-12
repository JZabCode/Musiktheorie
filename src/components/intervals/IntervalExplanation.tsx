import React from 'react';
import { BookOpen, ArrowLeft, Calculator } from 'lucide-react';

interface IntervalExplanationProps {
    onBack: () => void;
}

const IntervalExplanation: React.FC<IntervalExplanationProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col items-center px-4 py-6">
            <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-lg border border-slate-100 text-left max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-indigo-500">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <ArrowLeft size={20} /> Zurück
                    </button>
                    <div className="flex items-center gap-2">
                        <BookOpen size={24} className="text-indigo-600" />
                        <h2 className="text-xl font-bold text-indigo-600 m-0">
                            Intervall-Bestimmung
                        </h2>
                    </div>
                </div>

                {/* Intro */}
                <div className="mb-8">
                    <p className="text-lg leading-relaxed text-slate-700">
                        Jedes Intervall hat einen Vornamen (z.B. "große") und einen Nachnamen (z.B. "Terz"). <br />
                        Folgende Methode zeigt dir den korrekten Intervallnamen:
                    </p>
                </div>

                {/* Step 1 */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-indigo-600">
                    <h3 className="mt-0 mb-4 text-indigo-600 font-bold text-lg flex items-center gap-2">
                        1. Die Grobbestimmung (Stammtöne)
                    </h3>
                    <p className="text-slate-700">
                        Zähle die <strong>beteiligten Buchstaben</strong> (C, D, E, F, G, A, H). Vorzeichen (# oder b) werden ignoriert.
                    </p>

                    <div className="bg-white p-4 rounded-lg my-4 border border-slate-200">
                        <strong>Anleitung:</strong> Zähle die Notennamen vom ersten bis zum letzten Ton. <br />
                        <span className="text-rose-600 font-bold">WICHTIG:</span> Der erste Ton wird mitgezählt!
                    </div>

                    <div className="flex gap-3 items-center flex-wrap mt-4">
                        <div className="font-bold text-slate-700">Beispiel: C bis E</div>
                        <span className="text-slate-400">→</span>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-slate-100 rounded text-sm font-medium">1. C</span>
                            <span className="px-2 py-1 bg-slate-100 rounded text-sm font-medium">2. D</span>
                            <span className="px-2 py-1 bg-indigo-500 text-white rounded text-sm font-medium">3. E</span>
                        </div>
                        <span className="text-slate-700">= <strong>Terz</strong> (3)</span>
                    </div>
                </section>

                {/* Step 2 */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-amber-500">
                    <h3 className="mt-0 mb-4 text-amber-600 font-bold text-lg flex items-center gap-2">
                        2. Die Feinbestimmung (Halbtonschritte)
                    </h3>
                    <p className="text-slate-700">
                        Zähle alle <strong>Halbtonschritte (HT)</strong> auf der Tastatur (schwarze & weiße Tasten).
                    </p>

                    <div className="bg-white p-4 rounded-lg my-4 border border-slate-200">
                        <span className="text-rose-600 font-bold">ACHTUNG:</span> Jetzt startest du beim ersten Ton, aber zählst ihn <strong>NICHT</strong> mit (wie bei einem Brettspiel - erst beim Loslaufen zählen).
                    </div>

                    <ul className="list-none p-0 space-y-3">
                        <li className="flex items-center gap-2 text-slate-700">
                            <Calculator size={16} className="text-slate-400 flex-shrink-0" />
                            <span>
                                <strong>C bis E (4 Schritte):</strong> C → Cis → D → Dis → E = <span className="text-emerald-600 font-bold">große Terz</span>
                            </span>
                        </li>
                        <li className="flex items-center gap-2 text-slate-700">
                            <Calculator size={16} className="text-slate-400 flex-shrink-0" />
                            <span>
                                <strong>C bis Es (3 Schritte):</strong> C → Cis → D → Es = <span className="text-blue-600 font-bold">kleine Terz</span>
                            </span>
                        </li>
                    </ul>
                </section>

                {/* Reference Table */}
                <section>
                    <h3 className="text-center mb-4 text-slate-700 font-bold text-lg">Referenztabelle</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm bg-white border border-slate-200 rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-slate-100 border-b-2 border-slate-200">
                                    <th className="p-3 text-left font-bold text-slate-700">Intervall</th>
                                    <th className="p-3 text-center font-bold text-slate-700">Grob (Stammtöne)</th>
                                    <th className="p-3 text-center font-bold text-slate-700">Fein (Halbtonschritte)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {([
                                    ['Reine Prime', 1, 0],
                                    ['Kleine Sekunde', 2, 1],
                                    ['Große Sekunde', 2, 2],
                                    ['Kleine Terz', 3, 3],
                                    ['Große Terz', 3, 4],
                                    ['Reine Quarte', 4, 5],
                                    ['Überm. Quarte', 4, 6],
                                    ['Verm. Quinte', 5, 6],
                                    ['Reine Quinte', 5, 7],
                                    ['Kleine Sexte', 6, 8],
                                    ['Große Sexte', 6, 9],
                                    ['Kleine Septime', 7, 10],
                                    ['Große Septime', 7, 11],
                                    ['Reine Oktave', 8, 12],
                                ] as [string, number, number][]).map(([name, rough, semitones], idx) => (
                                    <tr key={name} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                        <td className="p-3 text-slate-700">{name}</td>
                                        <td className="p-3 text-center text-slate-400">{rough}</td>
                                        <td className="p-3 text-center font-bold text-indigo-600">{semitones}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-colors"
                    >
                        Zurück zur Übersicht
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntervalExplanation;
