import React from 'react';
import { BookOpen, ArrowLeft } from 'lucide-react';
import KeyboardOverview from './KeyboardOverview';
import BlackKeysKeyboard from './BlackKeysKeyboard';
import StepIntervalsKeyboard from './StepIntervalsKeyboard';

interface KeyboardNotesExplanationProps {
    onBack: () => void;
}

const KeyboardNotesExplanation: React.FC<KeyboardNotesExplanationProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col items-center px-4 py-6">
            <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-lg border border-slate-100 text-left max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-blue-500">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <ArrowLeft size={20} /> Zurück
                    </button>
                    <div className="flex items-center gap-2">
                        <BookOpen size={24} className="text-blue-600" />
                        <h2 className="text-xl font-bold text-blue-600 m-0">
                            Töne auf der Klaviatur
                        </h2>
                    </div>
                </div>

                {/* Intro */}
                <div className="mb-8">
                    <p className="text-lg leading-relaxed text-slate-700">
                        Die Klaviatur ist das wichtigste Werkzeug, um Musiktheorie zu verstehen.
                        Hier lernst du, wie die Noten auf der Tastatur angeordnet sind.
                    </p>
                </div>

                {/* Section 1: Aufbau */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-blue-600">
                    <h3 className="mt-0 mb-4 text-blue-600 font-bold text-lg">
                        Aufbau der Klaviatur
                    </h3>
                    <p className="text-slate-700 mb-4">
                        Die Klaviatur besteht aus weißen und schwarzen Tasten. Die weißen Tasten
                        entsprechen den Stammtönen <strong>C, D, E, F, G, A, H</strong>.
                        Die schwarzen Tasten sind in <strong>Zweier- und Dreiergruppen</strong> angeordnet.
                        Dieses Muster wiederholt sich in jeder Oktave – wenn du es einmal erkannt hast,
                        findest du jede Note.
                    </p>
                    <KeyboardOverview />
                    <p className="text-sm text-slate-600 mt-3">
                        <strong>Tipp zum Orientieren:</strong> Das <span className="text-amber-700 font-semibold">C</span> liegt
                        immer <em>links</em> von der 2er-Gruppe schwarzer Tasten. Das <strong>F</strong> liegt links von der 3er-Gruppe.
                    </p>
                </section>

                {/* Section 2: Schwarze Tasten */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-amber-500">
                    <h3 className="mt-0 mb-4 text-amber-600 font-bold text-lg">
                        Die schwarzen Tasten
                    </h3>
                    <p className="text-slate-700 mb-4">
                        Schwarze Tasten liegen jeweils zwischen zwei weißen Tasten – mit zwei Ausnahmen:
                        Zwischen <strong>E und F</strong> sowie zwischen <strong>H und C</strong> gibt es keine schwarze Taste.
                        Jede schwarze Taste hat <strong>zwei Namen</strong>:
                    </p>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 mb-4">
                        <li>
                            <strong>Mit Kreuz erhöht</strong> (Endung „-is"): die Taste rechts von C heißt
                            dann <em>Cis</em> (= C ein Halbton höher).
                        </li>
                        <li>
                            <strong>Mit B erniedrigt</strong> (Endung „-es" oder „-s"): dieselbe Taste heißt
                            auch <em>Des</em> (= D ein Halbton tiefer).
                        </li>
                    </ul>
                    <BlackKeysKeyboard />
                    <p className="text-sm text-slate-600 mt-3">
                        <strong>Achtung – deutsche Sonderfälle:</strong> aus „Ees" wird <strong>Es</strong>,
                        aus „Aes" wird <strong>As</strong>, und „Hes" heißt einfach <strong>B</strong>
                        (das deutsche H wird mit b zum B).
                    </p>
                </section>

                {/* Section 3: Halbton- und Ganztonschritt */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-emerald-500">
                    <h3 className="mt-0 mb-4 text-emerald-600 font-bold text-lg">
                        Halbton- und Ganztonschritt
                    </h3>
                    <p className="text-slate-700 mb-4">
                        Von einer Taste zur direkt benachbarten (egal ob weiß oder schwarz) ist immer
                        ein <strong>Halbtonschritt</strong>. Zwei Halbtonschritte zusammen ergeben einen
                        <strong> Ganztonschritt</strong>.
                    </p>
                    <StepIntervalsKeyboard />
                    <p className="text-sm text-slate-600 mt-3">
                        Zwischen <strong>E–F</strong> und <strong>H–C</strong> liegen die einzigen Halbtonschritte
                        zwischen zwei weißen Tasten – genau dort, wo die schwarze Taste „fehlt".
                    </p>
                </section>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition-colors"
                    >
                        Zurück zur Übersicht
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KeyboardNotesExplanation;
