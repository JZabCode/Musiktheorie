import React from 'react';
import { BookOpen, ArrowLeft, Lightbulb } from 'lucide-react';
import { getKey, type KeyMode } from '../../lib/circleOfFifths';
import { STEP_PATTERN, formatStep, halfStepIndices, noteLabel, scaleFrom, stepSizes, type ScaleNote } from '../../lib/scales';
import ScaleStaff from './ScaleStaff';
import ScaleKeyboard from './ScaleKeyboard';
import { ListenButton } from './ScaleShared';

interface ScalesExplanationProps {
    onBack: () => void;
}

// --- Beispiel-Tonleitern (diatonische Position: c1 = 28, a = 26, d1 = 29) ---

const C_MAJOR = scaleFrom(getKey('major', 0), 28);
const A_MINOR = scaleFrom(getKey('minor', 0), 26);
const D_MAJOR = scaleFrom(getKey('major', 2), 29);
const D_NATURALS: ScaleNote[] = D_MAJOR.map((n) => ({ ...n, acc: 0 }));

const STEP_OK = '#059669';
const STEP_WRONG = '#e11d48';
const TEAL = '#0f766e';

const nameLabels = (notes: ScaleNote[], color = TEAL) => notes.map((n) => ({ text: noteLabel(n), color }));

/** Schrittgrößen, wahlweise mit dem Bauplan verglichen (grün = passt, rot = passt nicht). */
const stepLabels = (notes: ScaleNote[], compareWith?: KeyMode) =>
    stepSizes(notes).map((s, i) => ({
        text: formatStep(s),
        color: compareWith
            ? (s === STEP_PATTERN[compareWith][i] ? STEP_OK : STEP_WRONG)
            : (s === 1 ? '#0d9488' : '#475569'),
    }));

const FigureTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="font-semibold text-slate-800 mt-6 mb-2">{children}</h4>
);

const Figure: React.FC<{ children: React.ReactNode; listen?: ScaleNote[] }> = ({ children, listen }) => (
    <div className="bg-white rounded-lg border border-teal-200 px-2 py-1 overflow-x-auto">
        {children}
        {listen && (
            <div className="flex justify-end pb-1 pr-1">
                <ListenButton notes={listen} label="Anhören" />
            </div>
        )}
    </div>
);

const Pattern: React.FC<{ steps: number[] }> = ({ steps }) => (
    <div className="flex flex-wrap items-center justify-center gap-1 my-4 font-bold text-lg">
        {steps.map((s, i) => (
            <React.Fragment key={i}>
                <span className="text-slate-400 text-sm font-normal">{i + 1}</span>
                <span className={`px-2 py-1 rounded-md ${s === 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {formatStep(s)}
                </span>
            </React.Fragment>
        ))}
        <span className="text-slate-400 text-sm font-normal">8</span>
    </div>
);

const ScalesExplanation: React.FC<ScalesExplanationProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col items-center px-4 py-6">
            <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-lg border border-slate-100 text-left max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-teal-500">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <ArrowLeft size={20} /> Zurück
                    </button>
                    <div className="flex items-center gap-2">
                        <BookOpen size={24} className="text-teal-600" />
                        <h2 className="text-xl font-bold text-teal-600 m-0">Tonleitern verstehen</h2>
                    </div>
                </div>

                {/* Intro */}
                <div className="mb-8">
                    <p className="text-lg leading-relaxed text-slate-700">
                        Hier lernst du, wie <strong>Dur- und Moll-Tonleitern</strong> aufgebaut sind und wie du jede
                        Tonleiter selbst bilden kannst – mit einem einfachen Bauplan aus Ganz- und Halbtonschritten.
                    </p>
                </div>

                {/* Section 1: Was ist eine Tonleiter? */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-teal-600">
                    <h3 className="mt-0 mb-4 text-teal-700 font-bold text-lg">Was ist eine Tonleiter?</h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-2">
                        <li>
                            Eine Tonleiter besteht aus <strong>7 verschiedenen Tönen</strong>. Sie beginnt mit dem
                            <strong> Grundton</strong> – er gibt der Tonleiter ihren Namen. Meist schreibt man oben noch einmal
                            den Grundton eine Oktave höher dazu – dann sind es <strong>8 Töne</strong>.
                        </li>
                        <li>
                            Die Töne gehen <strong>stufenweise</strong> nach oben: Linie – Zwischenraum – Linie …
                            Jeder Notenname kommt genau einmal vor, nur der Grundton steht oben noch einmal.
                        </li>
                        <li>
                            Die Töne werden von unten nach oben gezählt: 1. Ton, 2. Ton … bis zum 8. Ton.
                        </li>
                    </ul>
                    <FigureTitle>Beispiel: die 8 Töne der C-Dur-Tonleiter</FigureTitle>
                    <Figure listen={C_MAJOR}>
                        <ScaleStaff clef="treble" notes={C_MAJOR} labels={nameLabels(C_MAJOR)} showDegrees ariaLabel="C-Dur-Tonleiter" />
                    </Figure>
                </section>

                {/* Section 2: Ganz- und Halbtonschritt */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-slate-400">
                    <h3 className="mt-0 mb-4 text-slate-700 font-bold text-lg">Ganztonschritt und Halbtonschritt</h3>
                    <p className="text-slate-700 mb-3">
                        Zwischen zwei benachbarten Tönen einer Tonleiter liegt entweder ein Ganztonschritt oder ein Halbtonschritt:
                    </p>
                    <ul className="list-disc list-inside text-slate-700 space-y-2 mb-3">
                        <li>
                            <strong>Halbtonschritt (½):</strong> zur direkt benachbarten Taste auf dem Klavier – egal, ob schwarz oder weiß.
                        </li>
                        <li>
                            <strong>Ganztonschritt (1):</strong> zwei Halbtonschritte – es liegt also genau eine Taste dazwischen.
                        </li>
                    </ul>
                    <p className="text-slate-700">
                        Zwischen den weißen Tasten <strong>e–f</strong> und <strong>h–c</strong> liegt keine schwarze Taste.
                        Dort ist der Abstand nur ein Halbtonschritt. Zwischen allen anderen benachbarten weißen Tasten liegt ein Ganztonschritt.
                    </p>
                </section>

                {/* Section 3: Dur */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-teal-500">
                    <h3 className="mt-0 mb-4 text-teal-700 font-bold text-lg">Die Dur-Tonleiter</h3>
                    <p className="text-slate-700">
                        In jeder Dur-Tonleiter liegen die <strong>Halbtonschritte zwischen dem 3. und 4. Ton</strong> sowie
                        <strong> zwischen dem 7. und 8. Ton</strong>. Alle anderen Abstände sind Ganztonschritte.
                    </p>
                    <div className="bg-white border border-teal-200 rounded-lg px-4 py-1 mt-4">
                        <div className="text-sm font-semibold text-teal-800 text-center mt-2">Bauplan Dur</div>
                        <Pattern steps={STEP_PATTERN.major} />
                    </div>

                    <FigureTitle>Beispiel: C-Dur im Notenbild</FigureTitle>
                    <Figure listen={C_MAJOR}>
                        <ScaleStaff
                            clef="treble"
                            notes={C_MAJOR}
                            labels={nameLabels(C_MAJOR)}
                            showDegrees
                            steps={stepLabels(C_MAJOR)}
                            halfStepArcs={halfStepIndices('major')}
                            ariaLabel="C-Dur mit Halbtonschritten"
                        />
                    </Figure>
                    <p className="text-sm text-slate-600 mt-3">
                        C-Dur braucht keine Vorzeichen: Die Halbtonschritte <strong>e–f</strong> (3.–4. Ton) und
                        <strong> h–c</strong> (7.–8. Ton) liegen genau an den richtigen Stellen.
                    </p>

                    <FigureTitle>C-Dur auf dem Klavier</FigureTitle>
                    <ScaleKeyboard startDia={28} halfSteps={halfStepIndices('major')} />
                    <p className="text-sm text-slate-600 mt-3">
                        Bei jedem Ganztonschritt liegt eine schwarze Taste dazwischen – bei den Halbtonschritten e–f und h–c nicht.
                    </p>
                </section>

                {/* Section 4: Moll */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-sky-500">
                    <h3 className="mt-0 mb-4 text-sky-700 font-bold text-lg">Die Moll-Tonleiter</h3>
                    <p className="text-slate-700">
                        In jeder Moll-Tonleiter liegen die <strong>Halbtonschritte zwischen dem 2. und 3. Ton</strong> sowie
                        <strong> zwischen dem 5. und 6. Ton</strong>. Alle anderen Abstände sind Ganztonschritte.
                        Diese Form heißt <strong>natürliches Moll</strong>.
                    </p>
                    <div className="bg-white border border-sky-200 rounded-lg px-4 py-1 mt-4">
                        <div className="text-sm font-semibold text-sky-800 text-center mt-2">Bauplan Moll</div>
                        <Pattern steps={STEP_PATTERN.minor} />
                    </div>

                    <FigureTitle>Beispiel: a-Moll im Notenbild</FigureTitle>
                    <Figure listen={A_MINOR}>
                        <ScaleStaff
                            clef="treble"
                            notes={A_MINOR}
                            labels={nameLabels(A_MINOR)}
                            showDegrees
                            steps={stepLabels(A_MINOR)}
                            halfStepArcs={halfStepIndices('minor')}
                            ariaLabel="a-Moll mit Halbtonschritten"
                        />
                    </Figure>
                    <p className="text-sm text-slate-600 mt-3">
                        Auch a-Moll braucht keine Vorzeichen: Die Halbtonschritte <strong>h–c</strong> (2.–3. Ton) und
                        <strong> e–f</strong> (5.–6. Ton) liegen genau an den richtigen Stellen.
                    </p>

                    <FigureTitle>a-Moll auf dem Klavier</FigureTitle>
                    <ScaleKeyboard startDia={26} halfSteps={halfStepIndices('minor')} />
                    <p className="text-sm text-slate-600 mt-3">
                        a-Moll benutzt dieselben Töne wie C-Dur, beginnt aber auf a. Zwei solche Tonarten heißen
                        <strong> Paralleltonarten</strong> – mehr dazu im Modul <strong>Quintenzirkel</strong>.
                    </p>
                </section>

                {/* Section 5: Aha – Vergleich */}
                <section className="bg-amber-50 p-6 rounded-xl mb-6 border-l-4 border-amber-400">
                    <h3 className="mt-0 mb-3 text-amber-700 font-bold text-lg flex items-center gap-2">
                        <Lightbulb size={20} /> Aha! Der Unterschied liegt bei den Halbtonschritten
                    </h3>
                    <p className="text-slate-700 mb-3">
                        Dur und Moll haben beide 5 Ganztonschritte und 2 Halbtonschritte. Sie unterscheiden sich nur darin,
                        <em> wo</em> die Halbtonschritte liegen:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white border border-amber-200 rounded-lg p-3 text-center">
                            <div className="font-bold text-slate-800">Dur</div>
                            <div className="text-slate-700">Halbtonschritte bei <strong>3–4</strong> und <strong>7–8</strong></div>
                        </div>
                        <div className="bg-white border border-amber-200 rounded-lg p-3 text-center">
                            <div className="font-bold text-slate-800">Moll</div>
                            <div className="text-slate-700">Halbtonschritte bei <strong>2–3</strong> und <strong>5–6</strong></div>
                        </div>
                    </div>
                </section>

                {/* Section 6: Mit Vorzeichen bilden */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-orange-500">
                    <h3 className="mt-0 mb-4 text-orange-600 font-bold text-lg">Tonleitern mit Vorzeichen bilden – Schritt für Schritt</h3>
                    <p className="text-slate-700">
                        Beginnt eine Tonleiter nicht auf c (Dur) oder a (Moll), passen die Halbtonschritte der weißen Tasten
                        nicht mehr zum Bauplan. Dann helfen Vorzeichen. Beispiel <strong>D-Dur</strong>:
                    </p>

                    <FigureTitle>Schritt 1: Alle 8 Töne ohne Vorzeichen notieren und die Abstände prüfen</FigureTitle>
                    <Figure>
                        <ScaleStaff
                            clef="treble"
                            notes={D_NATURALS}
                            labels={nameLabels(D_NATURALS, '#475569')}
                            showDegrees
                            steps={stepLabels(D_NATURALS, 'major')}
                            ariaLabel="D bis d ohne Vorzeichen"
                        />
                    </Figure>
                    <p className="text-sm text-slate-600 mt-3">
                        Grün = passt zum Bauplan Dur, rot = passt nicht. Zwischen dem 2. und 3. Ton (e–f) steht ein Halbtonschritt,
                        gebraucht wird ein Ganztonschritt. Zwischen dem 3. und 4. Ton (f–g) ist es genau umgekehrt.
                        Dasselbe passiert beim 6. bis 8. Ton (h–c–d).
                    </p>

                    <FigureTitle>Schritt 2: Von links nach rechts den oberen Ton anpassen</FigureTitle>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>e–f ist zu klein → <strong>f wird zu fis</strong>. Jetzt passt auch fis–g (½).</li>
                        <li>h–c ist zu klein → <strong>c wird zu cis</strong>. Jetzt passt auch cis–d (½).</li>
                    </ul>
                    <div className="mt-3">
                        <Figure listen={D_MAJOR}>
                            <ScaleStaff
                                clef="treble"
                                notes={D_MAJOR}
                                labels={nameLabels(D_MAJOR)}
                                showDegrees
                                steps={stepLabels(D_MAJOR, 'major')}
                                halfStepArcs={halfStepIndices('major')}
                                ariaLabel="D-Dur mit Vorzeichen"
                            />
                        </Figure>
                    </div>
                    <p className="text-sm text-slate-600 mt-3">
                        Fertig: D-Dur hat die Töne d – e – <strong>fis</strong> – g – a – h – <strong>cis</strong> – d.
                    </p>
                    <p className="text-sm text-slate-600 mt-3">
                        Mit ♭ funktioniert es genauso. In <strong>F-Dur</strong> wäre a–h (3.–4. Ton) ein Ganztonschritt –
                        gebraucht wird ein Halbtonschritt, also wird <strong>h zu b</strong>. Für Moll-Tonleitern nimmst du
                        einfach den Bauplan Moll.
                    </p>
                </section>

                {/* Section 7: Gut zu wissen */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-slate-400">
                    <h3 className="mt-0 mb-4 text-slate-700 font-bold text-lg">Gut zu wissen</h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-2">
                        <li>
                            <strong>Jeder Notenname genau einmal:</strong> Deshalb heißt der 4. Ton in F-Dur <strong>b</strong> und
                            nicht ais – sonst gäbe es zweimal a und kein h.
                        </li>
                        <li>
                            <strong>Nur ♯ oder nur ♭:</strong> In einer Dur- oder Moll-Tonleiter kommen entweder nur Kreuze
                            oder nur Be vor, nie beides gemischt.
                        </li>
                        <li>
                            <strong>Vorzeichen im Namen:</strong> Heißt die Tonleiter z. B. <strong>Es-Dur</strong> oder
                            <strong> fis-Moll</strong>, bekommt schon der Grundton das Vorzeichen.
                        </li>
                    </ul>
                </section>

                {/* Section 8: Tipp */}
                <section className="bg-teal-50 p-6 rounded-xl mb-6 border-l-4 border-teal-500">
                    <h3 className="mt-0 mb-3 text-teal-700 font-bold text-lg flex items-center gap-2">
                        <Lightbulb size={20} /> Tipp zum Tonleiter-Bilden
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-slate-700">
                        <li><strong>Grundton notieren</strong> – mit Vorzeichen, wenn der Name eins verlangt.</li>
                        <li><strong>Stufenweise aufwärts</strong> – 7 Töne, oder 8 mit dem Grundton oben.</li>
                        <li><strong>Abstände prüfen:</strong> von links nach rechts mit dem Bauplan Dur oder Moll vergleichen.</li>
                        <li><strong>Anpassen:</strong> Passt ein Abstand nicht, den oberen Ton mit ♯ erhöhen oder mit ♭ erniedrigen.</li>
                    </ol>
                </section>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg transition-colors"
                    >
                        Zurück zur Übersicht
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScalesExplanation;
