import React from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import CircleOfFifths from './CircleOfFifths';
import InteractiveCircle from './InteractiveCircle';
import {
    BlockFigure,
    FifthStepsFigure,
    FifthsChainFigure,
    FlatChainFigure,
    RuleFigure,
    ScaleCompareFigure,
    ScaleTriadsFigure,
} from './ExplanationFigures';
import { getKey } from '../../lib/circleOfFifths';

interface CircleOfFifthsExplanationProps {
    onBack: () => void;
}

const SectionTitle: React.FC<{ number: number; children: React.ReactNode }> = ({ number, children }) => (
    <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 mt-10 mb-4 pb-2 border-b border-slate-200">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 text-white text-base">{number}</span>
        {children}
    </h3>
);

const Rule: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-violet-50 border-l-4 border-violet-500 rounded-r-xl px-4 py-3 my-4">
        <p className="font-bold text-violet-800 m-0 mb-1">{title}</p>
        <div className="text-slate-700 text-sm leading-relaxed">{children}</div>
    </div>
);

const Legend: React.FC<{ items: [string, string][] }> = ({ items }) => (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-600 mt-2">
        {items.map(([color, label]) => (
            <span key={label} className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded border border-slate-300" style={{ background: color }} />
                {label}
            </span>
        ))}
    </div>
);

const CircleOfFifthsExplanation: React.FC<CircleOfFifthsExplanationProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col items-center px-2 sm:px-4 py-6">
            <div className="w-full max-w-4xl bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-slate-100 text-left">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-violet-500">
                    <button onClick={onBack} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors">
                        <ArrowLeft size={20} /> Zurück
                    </button>
                    <div className="flex items-center gap-2">
                        <BookOpen size={24} className="text-violet-600" />
                        <h2 className="text-xl font-bold text-violet-600 m-0">Der Quintenzirkel</h2>
                    </div>
                </div>

                <p className="text-lg leading-relaxed text-slate-700">
                    Der Quintenzirkel ordnet alle Dur- und Molltonarten in einem Kreis an. Aus ihm lässt sich ablesen,
                    wie viele Vorzeichen eine Tonart hat, welche Tonarten miteinander verwandt sind und welche Dreiklänge
                    zu einer Tonart gehören.
                </p>

                <nav className="flex flex-wrap gap-2 mt-4 text-sm">
                    {[
                        ['#aufbau', '1. Aufbau'],
                        ['#funktion', '2. Funktion'],
                        ['#nutzen', '3. Nutzen'],
                        ['#interaktiv', '4. Interaktiver Quintenzirkel'],
                    ].map(([href, label]) => (
                        <a
                            key={href}
                            href={href}
                            onClick={(e) => {
                                e.preventDefault();
                                document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 font-semibold hover:bg-violet-100"
                        >
                            {label}
                        </a>
                    ))}
                </nav>

                {/* 1. Aufbau */}
                <section id="aufbau" className="scroll-mt-4">
                    <SectionTitle number={1}>Aufbau: Tonarten im Quintabstand</SectionTitle>
                    <p className="text-slate-700 leading-relaxed">
                        Ganz oben steht <strong>C-Dur</strong>, die Tonart ohne Vorzeichen. Geht man{' '}
                        <strong>im Uhrzeigersinn</strong> weiter, liegt der Grundton der nächsten Tonart jeweils eine{' '}
                        <strong>reine Quinte höher</strong>: C → G → D → A …
                    </p>
                    <FifthStepsFigure />
                    <p className="text-slate-700 leading-relaxed">
                        Mit jedem Quintschritt aufwärts kommt ein <strong>♯</strong> hinzu. Geht man{' '}
                        <strong>gegen den Uhrzeigersinn</strong>, liegt der Grundton jeweils eine Quinte tiefer
                        (C → F → B → Es …), und mit jedem Schritt kommt ein <strong>♭</strong> hinzu.
                    </p>
                    <FifthsChainFigure />
                    <p className="text-slate-700 leading-relaxed">
                        Beide Richtungen treffen sich unten: <strong>Fis-Dur</strong> (6 ♯) und <strong>Ges-Dur</strong> (6 ♭)
                        klingen gleich, werden aber unterschiedlich notiert (<em>enharmonische Verwechslung</em>). Nach
                        12 Quintschritten ist man wieder bei C angekommen, der Kreis schließt sich.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                        Im vollständigen Quintenzirkel stehen <strong>außen die Dur-Tonarten</strong> (Großbuchstaben),{' '}
                        <strong>innen die Moll-Tonarten</strong> (Kleinbuchstaben) und <strong>am Rand die Vorzeichen</strong>{' '}
                        als Generalvorzeichen im Violinschlüssel.
                    </p>
                    <div className="my-4 bg-slate-50 rounded-xl border border-slate-200 p-3">
                        <CircleOfFifths showDirectionArrows className="w-full max-w-2xl mx-auto block" />
                        <p className="text-xs text-slate-500 text-center mt-2 mb-0">
                            Pfeil rechts: Quinten aufwärts, ein ♯ mehr · Pfeil links: Quinten abwärts, ein ♭ mehr
                        </p>
                    </div>
                </section>

                {/* 2. Funktion */}
                <section id="funktion" className="scroll-mt-4">
                    <SectionTitle number={2}>Funktion: Tonartverwandtschaften</SectionTitle>
                    <p className="text-slate-700 leading-relaxed">
                        Der Quintenzirkel zeigt auf einen Blick, wie eng Tonarten miteinander verwandt sind. Je näher zwei
                        Tonarten im Kreis beieinanderliegen, desto mehr Töne haben sie gemeinsam.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-700">
                        <li>
                            <strong className="text-emerald-700">Quintverwandte Tonarten</strong> sind die direkten Nachbarn
                            links und rechts. Sie unterscheiden sich um genau <strong>ein Vorzeichen</strong> und haben{' '}
                            <strong>6 von 7 Tönen</strong> gemeinsam.
                        </li>
                        <li>
                            <strong className="text-amber-700">Paralleltonarten</strong> stehen im selben Feld, eine außen
                            (Dur), eine innen (Moll). Sie haben <strong>dieselben Vorzeichen</strong> und damit{' '}
                            <strong>denselben Tonvorrat</strong>, nur mit einem anderen Grundton.
                        </li>
                        <li>
                            Die <strong>Entfernung</strong> im Kreis entspricht der Anzahl unterschiedlicher Vorzeichen.
                            Gegenüberliegende Tonarten (z. B. C-Dur und Fis-Dur) sind am weitesten voneinander entfernt.
                        </li>
                    </ul>
                    <div className="my-4 bg-slate-50 rounded-xl border border-slate-200 p-3">
                        <CircleOfFifths
                            className="w-full max-w-2xl mx-auto block"
                            centerTitle="C-Dur"
                            centerSubtitle="Verwandte"
                            highlights={[
                                { ring: 'outer', position: 0, variant: 'tonic' },
                                { ring: 'outer', position: 1, variant: 'fifth' },
                                { ring: 'outer', position: 11, variant: 'fifth' },
                                { ring: 'inner', position: 0, variant: 'parallel' },
                            ]}
                        />
                        <Legend items={[['#7c3aed', 'Ausgangstonart C-Dur'], ['#a7f3d0', 'quintverwandt (G-Dur, F-Dur)'], ['#fde68a', 'parallel (a-Moll)']]} />
                    </div>
                    <h4 className="text-lg font-bold text-violet-700 mt-6 mb-2">Welche Töne haben verwandte Tonarten gemeinsam?</h4>
                    <p className="text-slate-700 leading-relaxed">
                        Hier stehen die Töne von vier Tonleitern untereinander. Vergleiche jede Zeile mit C-Dur:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-slate-700">
                        <li><strong>F-Dur</strong> (links neben C) hat statt <strong>h</strong> ein <strong>b</strong>, alle anderen Töne sind gleich.</li>
                        <li><strong>G-Dur</strong> (rechts neben C) hat statt <strong>f</strong> ein <strong>fis</strong>, alle anderen Töne sind gleich.</li>
                        <li><strong>a-Moll</strong> (innen unter C) hat <strong>genau dieselben Töne</strong> wie C-Dur.</li>
                    </ul>
                    <ScaleCompareFigure
                        reference={getKey('major', 0)}
                        keys={[getKey('major', -1), getKey('major', 0), getKey('major', 1), getKey('minor', 0)]}
                    />
                </section>

                {/* 3. Nutzen */}
                <section id="nutzen" className="scroll-mt-4">
                    <SectionTitle number={3}>Nutzen</SectionTitle>

                    <h4 className="text-lg font-bold text-violet-700 mt-6 mb-2">a) Vorzeichen einer Tonart ablesen</h4>
                    <p className="text-slate-700 leading-relaxed">
                        Zu jeder Tonart steht im Quintenzirkel die Vorzeichnung. Umgekehrt lässt sich aus einer
                        Vorzeichnung die Tonart bestimmen:
                    </p>

                    <Rule title="Kreuz-Tonarten: letztes ♯ + 1 Halbtonschritt = Dur-Grundton">
                        Das letzte (am weitesten rechts stehende) Kreuz liegt einen Halbtonschritt unter dem Grundton.
                    </Rule>
                    <RuleFigure
                        signature={4}
                        highlightAccidental={3}
                        from={{ step: 6, name: 'dis' }}
                        to={{ step: 7, name: 'e' }}
                        arrowLabel="+ 1 Halbton"
                        result="E-Dur"
                        caption="4 ♯: das letzte Kreuz ist dis, einen Halbtonschritt darüber liegt e, also E-Dur."
                    />

                    <Rule title="Be-Tonarten: das neue ♭ ist der nächste Grundton">
                        Gegen den Uhrzeigersinn kommt mit jeder Tonart ein ♭ dazu. Das Vorzeichen, das neu dazukommt, ist
                        der Grundton der nächsten Tonart: <strong>F-Dur</strong> hat das Vorzeichen b → die nächste Tonart
                        ist <strong>B-Dur</strong>. B-Dur hat b und neu dazu es → die nächste Tonart ist{' '}
                        <strong>Es-Dur</strong>. Und so weiter.
                    </Rule>
                    <FlatChainFigure />

                    <h4 className="text-lg font-bold text-violet-700 mt-8 mb-2">
                        b) Paralleltonart finden: Wie komme ich von außen nach innen?
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                        Zu jeder Dur-Tonart außen gehört die Moll-Tonart innen im selben Feld, ihre{' '}
                        <strong>Paralleltonart</strong>. So findest du sie:
                    </p>
                    <Rule title="Paralleltonart: kleine Terz abwärts">
                        Vom Dur-Grundton eine <strong>kleine Terz</strong> (3 Halbtonschritte) abwärts liegt der Grundton der
                        parallelen Moll-Tonart. Die Vorzeichen bleiben gleich.
                    </Rule>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <RuleFigure
                            signature={0}
                            from={{ step: 5, name: 'c' }}
                            to={{ step: 3, name: 'a' }}
                            arrowLabel="kl. Terz ↓"
                            result="a-Moll"
                            caption="C-Dur → a-Moll (keine Vorzeichen)"
                        />
                        <RuleFigure
                            signature={-3}
                            from={{ step: 7, name: 'es' }}
                            to={{ step: 5, name: 'c' }}
                            arrowLabel="kl. Terz ↓"
                            result="c-Moll"
                            caption="Es-Dur → c-Moll (3 ♭)"
                        />
                    </div>

                    <h4 className="text-lg font-bold text-violet-700 mt-8 mb-2">c) Diatonische Dreiklänge: Stufenprinzip</h4>
                    <p className="text-slate-700 leading-relaxed">
                        Auf jedem Ton einer Tonleiter lässt sich ein Dreiklang aus <strong>leitereigenen Tönen</strong>{' '}
                        bilden. Die Stufen werden mit römischen Ziffern bezeichnet. In Dur entstehen dabei immer drei
                        Dur-Dreiklänge (I, IV, V), drei Moll-Dreiklänge (II, III, VI) und ein verminderter Dreiklang (VII).
                    </p>
                    <ScaleTriadsFigure />
                    <p className="text-slate-700 leading-relaxed">
                        Im Quintenzirkel liegen sechs dieser Dreiklänge in einem <strong>Block aus sechs Feldern</strong> um
                        die I. Stufe herum: außen die Dur-Dreiklänge IV – I – V, innen darunter die Moll-Dreiklänge II – VI –
                        III. Nur der verminderte Dreiklang (VII) hat kein eigenes Feld. Dieses Muster ist in jeder
                        Dur-Tonart gleich, man muss den Block nur so drehen, dass die I. Stufe auf der gewünschten Tonart liegt.
                    </p>

                    <h4 className="text-lg font-bold text-violet-700 mt-8 mb-2">d) Funktionsprinzip in Dur</h4>
                    <p className="text-slate-700 leading-relaxed">
                        In der Funktionstheorie heißen die Dreiklänge nach ihrer Beziehung zur Tonika:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-slate-700">
                        <li><strong>Tonika (T)</strong>: der Dreiklang auf dem Grundton</li>
                        <li><strong>Dominante (D)</strong>: eine Quinte über der Tonika, im Zirkel rechts daneben</li>
                        <li><strong>Subdominante (S)</strong>: eine Quinte unter der Tonika, im Zirkel links daneben</li>
                        <li>
                            <strong>Parallelen (Tp, Sp, Dp)</strong>: jeweils eine kleine Terz unter der Hauptfunktion, im
                            Zirkel direkt innen darunter
                        </li>
                    </ul>
                    <BlockFigure
                        mode="major"
                        caption="C-Dur: außen die Hauptfunktionen S – T – D, innen ihre Parallelen Sp – Tp – Dp."
                    />

                    <h4 className="text-lg font-bold text-violet-700 mt-8 mb-2">e) Funktionsprinzip in Moll</h4>
                    <p className="text-slate-700 leading-relaxed">
                        In <strong>Moll</strong> (natürliches Moll) liegt der Block spiegelbildlich. Die Hauptfunktionen
                        stehen innen, die Parallelen außen. Kleinbuchstaben kennzeichnen Moll-Dreiklänge.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-slate-700">
                        <li><strong>Tonika (t)</strong>: der Moll-Dreiklang auf dem Grundton, im Zirkel innen</li>
                        <li><strong>Dominante (d)</strong>: eine Quinte über der Tonika, innen rechts daneben</li>
                        <li><strong>Subdominante (s)</strong>: eine Quinte unter der Tonika, innen links daneben</li>
                        <li>
                            <strong>Parallelen (tP, sP, dP)</strong>: jeweils eine kleine Terz über der Hauptfunktion, im
                            Zirkel direkt außen darüber
                        </li>
                    </ul>
                    <p className="text-slate-700 leading-relaxed mt-2">
                        Der verminderte Dreiklang liegt in Moll auf der II. Stufe und hat kein eigenes Feld.
                    </p>
                    <BlockFigure
                        mode="minor"
                        caption="a-Moll: innen die Hauptfunktionen s – t – d, außen ihre Parallelen sP – tP – dP."
                    />
                </section>

                {/* 4. Interaktiv */}
                <section id="interaktiv" className="scroll-mt-4">
                    <SectionTitle number={4}>Interaktiver Quintenzirkel</SectionTitle>
                    <InteractiveCircle />
                </section>

                <div className="mt-10 text-center">
                    <button onClick={onBack} className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg transition-colors">
                        Zurück zur Übersicht
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CircleOfFifthsExplanation;
