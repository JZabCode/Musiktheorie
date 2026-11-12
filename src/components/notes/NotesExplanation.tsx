import React from 'react';
import { BookOpen, ArrowLeft, Lightbulb, AlertTriangle } from 'lucide-react';
import StaffElementsNotation from './StaffElementsNotation';
import MnemonicNotation from './MnemonicNotation';
import AccidentalNotation, { type LabeledNote } from './AccidentalNotation';
import HalftoneKeyboard, { type HalftoneStep } from './HalftoneKeyboard';

interface NotesExplanationProps {
    onBack: () => void;
}

// --- Beispiel-Notenbilder (VexFlow: 'b' = deutsches h) ---

const SAME_POSITION: LabeledNote[][] = [[
    { key: 'g/4', label: 'g1' },
    { key: 'g/4', accidental: '#', label: 'gis1' },
    { key: 'g/4', accidental: 'b', label: 'ges1' },
]];

const ALL_SHARPS: LabeledNote[][] = [[
    { key: 'c/4', accidental: '#', label: 'cis1' },
    { key: 'd/4', accidental: '#', label: 'dis1' },
    { key: 'e/4', accidental: '#', label: 'eis1' },
    { key: 'f/4', accidental: '#', label: 'fis1' },
    { key: 'g/4', accidental: '#', label: 'gis1' },
    { key: 'a/4', accidental: '#', label: 'ais1' },
    { key: 'b/4', accidental: '#', label: 'his1' },
]];

const ALL_FLATS: LabeledNote[][] = [[
    { key: 'c/4', accidental: 'b', label: 'ces1' },
    { key: 'd/4', accidental: 'b', label: 'des1' },
    { key: 'e/4', accidental: 'b', label: 'es1' },
    { key: 'f/4', accidental: 'b', label: 'fes1' },
    { key: 'g/4', accidental: 'b', label: 'ges1' },
    { key: 'a/4', accidental: 'b', label: 'as1' },
    { key: 'b/4', accidental: 'b', label: 'b1' },
]];

const SAME_KEY_DIFFERENT_NAME: LabeledNote[][] = [
    [
        { key: 'c/4', accidental: '#', label: 'cis1' },
        { key: 'd/4', accidental: 'b', label: 'des1' },
    ],
    [
        { key: 'e/4', accidental: '#', label: 'eis1' },
        { key: 'f/4', label: 'f1' },
    ],
];

const BASS_EXAMPLES: LabeledNote[][] = [[
    { key: 'f/2', accidental: '#', label: 'Fis' },
    { key: 'b/2', accidental: 'b', label: 'B' },
    { key: 'c/3', accidental: '#', label: 'cis' },
    { key: 'e/3', accidental: 'b', label: 'es' },
    { key: 'g/3', accidental: '#', label: 'gis' },
    { key: 'a/3', accidental: 'b', label: 'as' },
]];

const VALIDITY_IN_BAR: LabeledNote[][] = [
    [
        { key: 'f/4', accidental: '#', label: 'fis1' },
        { key: 'f/4', label: 'fis1' },
        { key: 'f/4', accidental: 'n', label: 'f1' },
    ],
    [
        { key: 'f/4', label: 'f1' },
    ],
];

// Generalvorzeichen: ein Kreuz (fis) gilt für alle f in jeder Oktave und in jedem Takt
const KEY_SIGNATURE_EXAMPLE: LabeledNote[][] = [
    [
        { key: 'f/4', label: 'fis1' },
        { key: 'f/5', label: 'fis2' },
        { key: 'f/4', accidental: 'n', label: 'f1' },
    ],
    [
        { key: 'f/4', label: 'fis1' },
    ],
];

// --- Klaviatur-Beispiele (Halbtonposition: 0 = c … 12 = c1) ---

const SHARP_STEPS: HalftoneStep[] = [
    { from: 0, to: 1, label: 'cis' },
    { from: 4, to: 5, label: 'eis', hint: '(Taste f)' },
];

const FLAT_STEPS: HalftoneStep[] = [
    { from: 2, to: 1, label: 'des' },
    { from: 5, to: 4, label: 'fes', hint: '(Taste e)' },
];

// --- Namenstabellen ---

interface NamePair {
    from: string;
    to: string;
    exception?: boolean;
}

const SHARP_NAMES: NamePair[] = [
    { from: 'c', to: 'cis' }, { from: 'd', to: 'dis' }, { from: 'e', to: 'eis' }, { from: 'f', to: 'fis' },
    { from: 'g', to: 'gis' }, { from: 'a', to: 'ais' }, { from: 'h', to: 'his' },
];

const FLAT_NAMES: NamePair[] = [
    { from: 'c', to: 'ces' }, { from: 'd', to: 'des' }, { from: 'e', to: 'es', exception: true },
    { from: 'f', to: 'fes' }, { from: 'g', to: 'ges' }, { from: 'a', to: 'as', exception: true },
    { from: 'h', to: 'b', exception: true },
];

const NameGrid: React.FC<{ pairs: NamePair[]; accentClass: string }> = ({ pairs, accentClass }) => (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 my-4">
        {pairs.map(({ from, to, exception }) => (
            <div
                key={from}
                className={`flex flex-col items-center py-2 rounded-lg border ${exception ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
            >
                <span className="text-slate-500 text-sm">{from}</span>
                <span className="text-slate-400 text-xs leading-none">↓</span>
                <span className={`font-bold text-lg ${exception ? 'text-red-600' : accentClass}`}>{to}</span>
            </div>
        ))}
    </div>
);

const FigureTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="font-semibold text-slate-800 mt-6 mb-0">{children}</h4>
);

const NotesExplanation: React.FC<NotesExplanationProps> = ({ onBack }) => {
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
                            Noten lesen lernen
                        </h2>
                    </div>
                </div>

                {/* Intro */}
                <div className="mb-8">
                    <p className="text-lg leading-relaxed text-slate-700">
                        Das Lesen von Noten ist eine grundlegende Fähigkeit in der Musiktheorie.
                        Hier lernst du, wie du Noten im Violin- und Bassschlüssel sicher erkennst und benennen kannst –
                        auch mit den Vorzeichen <strong>Kreuz (♯)</strong> und <strong>Be (♭)</strong>.
                    </p>
                </div>

                {/* Section 1: Notensystem */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-indigo-600">
                    <h3 className="mt-0 mb-4 text-indigo-600 font-bold text-lg">
                        Das Notensystem
                    </h3>
                    <p className="text-slate-700 mb-4">
                        Noten werden auf einem System aus <strong>fünf Linien</strong> und <strong>vier Zwischenräumen</strong> notiert.
                        Ganz links steht ein <strong>Notenschlüssel</strong> – er legt fest, wie die Noten im System heißen.
                        Die Position der Note auf dem System bestimmt ihre Tonhöhe: je höher die Note steht, desto höher klingt sie.
                    </p>
                    <div className="overflow-x-auto">
                        <StaffElementsNotation />
                    </div>
                    <p className="text-sm text-slate-600 mt-3">
                        Reicht ein Ton über das System hinaus, bekommt er eine kurze <strong>Hilfslinie</strong>.
                        Das eingestrichene c (das mittlere c auf dem Klavier = c1) sitzt zum Beispiel
                        auf einer Hilfslinie direkt unter dem Violinschlüssel-System.
                    </p>
                </section>

                {/* Section 2: Aha-Hinweis */}
                <section className="bg-amber-50 p-6 rounded-xl mb-6 border-l-4 border-amber-400">
                    <h3 className="mt-0 mb-3 text-amber-700 font-bold text-lg flex items-center gap-2">
                        <Lightbulb size={20} /> Aha! Linie – Zwischenraum – Linie …
                    </h3>
                    <p className="text-slate-700">
                        Die Stammtöne (C, D, E, F, G, A, H) wechseln sich immer ab:
                        Eine Note auf einer Linie, die nächsthöhere im Zwischenraum darüber,
                        die nächste wieder auf der Linie. Wenn du <em>einen</em> Ton sicher kennst,
                        kannst du dich Schritt für Schritt zu den anderen hochzählen.
                    </p>
                </section>

                {/* Section 3: Merksätze Violinschlüssel */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-amber-500">
                    <h3 className="mt-0 mb-4 text-amber-600 font-bold text-lg">
                        Merksätze – Violinschlüssel
                    </h3>
                    <div className="space-y-6 text-slate-700">
                        <div>
                            <strong>Linien (von unten nach oben):</strong> E – G – H – D – F
                            <div className="text-amber-700 font-medium mt-1">„Eine Gans Hat Dicke Füße"</div>
                            <MnemonicNotation clef="treble" type="lines" />
                        </div>
                        <div>
                            <strong>Zwischenräume (von unten nach oben):</strong> F – A – C – E
                            <div className="text-amber-700 font-medium mt-1">Die Buchstaben ergeben „FACE"</div>
                            <MnemonicNotation clef="treble" type="spaces" />
                        </div>
                    </div>
                </section>

                {/* Section 4: Merksätze Bassschlüssel */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-emerald-500">
                    <h3 className="mt-0 mb-4 text-emerald-600 font-bold text-lg">
                        Merksätze – Bassschlüssel
                    </h3>
                    <div className="space-y-6 text-slate-700">
                        <div>
                            <strong>Linien (von unten nach oben):</strong> G – H – D – F – A
                            <div className="text-emerald-700 font-medium mt-1">„Gute Herren Danken Frau Ada"</div>
                            <MnemonicNotation clef="bass" type="lines" />
                        </div>
                        <div>
                            <strong>Zwischenräume (von unten nach oben):</strong> A – C – E – G
                            <div className="text-emerald-700 font-medium mt-1">„Alle Clowns Essen Gummibärchen"</div>
                            <MnemonicNotation clef="bass" type="spaces" />
                        </div>
                    </div>
                </section>

                {/* Section 5: Vorzeichen – Grundlagen */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-violet-500">
                    <h3 className="mt-0 mb-4 text-violet-600 font-bold text-lg">
                        Vorzeichen – Töne um einen Halbton verändern
                    </h3>
                    <p className="text-slate-700 mb-4">
                        Mit den sieben Stammtönen allein kommt man nicht aus: Auf dem Klavier liegen zwischen den
                        weißen Tasten noch die schwarzen. Um auch diese Töne aufzuschreiben, gibt es
                        <strong> Vorzeichen</strong>. Ein Vorzeichen verändert einen Ton um genau einen <strong>Halbton</strong>.
                    </p>
                    <div className="bg-white border border-violet-200 rounded-lg p-4 mb-4 text-slate-700">
                        <strong>Halbton:</strong> der kleinste Abstand zwischen zwei Tönen. Auf dem Klavier ist das der
                        Schritt zur <em>direkt benachbarten</em> Taste – egal, ob sie schwarz oder weiß ist.
                    </div>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 mb-4">
                        <li><strong>Kreuz (♯)</strong> – erhöht den Ton um einen Halbton.</li>
                        <li><strong>Be (♭)</strong> – erniedrigt den Ton um einen Halbton.</li>
                    </ul>
                    <p className="text-slate-700">
                        Das Vorzeichen steht <strong>links vor der Note</strong> – genau auf derselben Linie oder im
                        selben Zwischenraum wie der Notenkopf. Die Note selbst bleibt an ihrem Platz.
                    </p>

                    <FigureTitle>Beispiel: dreimal dieselbe Stelle im System</FigureTitle>
                    <AccidentalNotation clef="treble" groups={SAME_POSITION} borderClass="border-violet-200" />
                    <p className="text-sm text-slate-600 mt-3">
                        Alle drei Noten stehen auf der 2. Linie von unten. Ohne Vorzeichen heißt die Note <strong>g1</strong>,
                        mit Kreuz <strong>gis1</strong> und mit Be <strong>ges1</strong>.
                    </p>
                </section>

                {/* Section 6: Kreuz */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-orange-500">
                    <h3 className="mt-0 mb-4 text-orange-600 font-bold text-lg">
                        Das Kreuz (♯) – Endung „-is"
                    </h3>
                    <p className="text-slate-700">
                        Ein Kreuz erhöht den Ton um einen Halbton. Für den Namen hängst du an den Stammton
                        die Endung <strong>„-is"</strong> an. Das gilt für alle sieben Stammtöne – ohne Ausnahme:
                    </p>
                    <NameGrid pairs={SHARP_NAMES} accentClass="text-orange-600" />

                    <FigureTitle>Alle Stammtöne mit Kreuz im Violinschlüssel</FigureTitle>
                    <AccidentalNotation clef="treble" groups={ALL_SHARPS} borderClass="border-orange-200" />

                    <FigureTitle>Auf dem Klavier: ein Halbton nach rechts</FigureTitle>
                    <HalftoneKeyboard steps={SHARP_STEPS} variant="sharp" />
                    <p className="text-sm text-slate-600 mt-3">
                        Von <strong>c</strong> geht es einen Halbton nach rechts auf die schwarze Taste <strong>cis</strong>.
                        Rechts neben <strong>e</strong> liegt keine schwarze Taste – der nächste Halbton ist die weiße
                        Taste f. Weil die Note aber an der Stelle von e steht, heißt sie trotzdem <strong>eis</strong>.
                        Genauso liegt <strong>his</strong> auf der Taste c.
                    </p>
                </section>

                {/* Section 7: Be */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-sky-500">
                    <h3 className="mt-0 mb-4 text-sky-700 font-bold text-lg">
                        Das Be (♭) – Endung „-es"
                    </h3>
                    <p className="text-slate-700">
                        Ein Be erniedrigt den Ton um einen Halbton. Für den Namen hängst du an den Stammton
                        die Endung <strong>„-es"</strong> an:
                    </p>
                    <NameGrid pairs={FLAT_NAMES} accentClass="text-sky-700" />

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-slate-700">
                        <div className="font-bold text-red-700 mb-2 flex items-center gap-2">
                            <AlertTriangle size={18} /> Drei Ausnahmen (rot markiert)
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                            <li>e mit Be heißt <strong>es</strong> (nicht „ees")</li>
                            <li>a mit Be heißt <strong>as</strong> (nicht „aes")</li>
                            <li>h mit Be heißt <strong>b</strong> (nicht „hes")</li>
                        </ul>
                        <p className="text-sm mt-3 mb-0">
                            Nicht verwechseln: <strong>Be</strong> ist der Name des Zeichens ♭. Der <strong>Ton b</strong> ist
                            ein h mit diesem Zeichen davor.
                        </p>
                    </div>

                    <FigureTitle>Alle Stammtöne mit Be im Violinschlüssel</FigureTitle>
                    <AccidentalNotation clef="treble" groups={ALL_FLATS} borderClass="border-sky-200" />

                    <FigureTitle>Auf dem Klavier: ein Halbton nach links</FigureTitle>
                    <HalftoneKeyboard steps={FLAT_STEPS} variant="flat" />
                    <p className="text-sm text-slate-600 mt-3">
                        Von <strong>d</strong> geht es einen Halbton nach links auf die schwarze Taste <strong>des</strong>.
                        Links neben <strong>f</strong> liegt keine schwarze Taste – der nächste Halbton ist die weiße
                        Taste e. Weil die Note an der Stelle von f steht, heißt sie trotzdem <strong>fes</strong>.
                        Genauso liegt <strong>ces</strong> auf der Taste h.
                    </p>
                </section>

                {/* Section 8: Aha – Name kommt von der Stelle im System */}
                <section className="bg-amber-50 p-6 rounded-xl mb-6 border-l-4 border-amber-400">
                    <h3 className="mt-0 mb-3 text-amber-700 font-bold text-lg flex items-center gap-2">
                        <Lightbulb size={20} /> Aha! Der Name kommt von der Stelle im Notensystem
                    </h3>
                    <p className="text-slate-700 mb-3">
                        Auf dem Klavier haben manche Tasten mehrere Namen: Die schwarze Taste zwischen c und d ist
                        <strong> cis</strong> und <strong>des</strong>, die weiße Taste f kann auch <strong>eis</strong> sein.
                        Welcher Name richtig ist, siehst du nur an der Note:
                    </p>
                    <ol className="list-decimal list-inside text-slate-700 space-y-1">
                        <li>Auf welcher Linie oder in welchem Zwischenraum steht die Note? → <strong>Stammton</strong></li>
                        <li>Welches Vorzeichen steht davor? → <strong>Endung</strong></li>
                    </ol>

                    <FigureTitle>Gleiche Taste – verschiedene Noten</FigureTitle>
                    <AccidentalNotation clef="treble" groups={SAME_KEY_DIFFERENT_NAME} borderClass="border-amber-200" />
                    <p className="text-sm text-slate-600 mt-3">
                        <strong>cis1</strong> und <strong>des1</strong> werden auf derselben Taste gespielt, stehen aber an
                        verschiedenen Stellen im System. Dasselbe gilt für <strong>eis1</strong> und <strong>f1</strong>.
                        Dass ein Ton zwei Namen haben kann, nennt man <strong>enharmonische Verwechslung</strong>.
                    </p>
                </section>

                {/* Section 9: Vorzeichen im Bassschlüssel */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-emerald-500">
                    <h3 className="mt-0 mb-4 text-emerald-600 font-bold text-lg">
                        Vorzeichen im Bassschlüssel
                    </h3>
                    <p className="text-slate-700">
                        Die Regeln gelten in jedem Notenschlüssel gleich. Bestimme zuerst den Stammton mit den
                        Merksätzen für den Bassschlüssel und hänge dann die passende Endung an.
                    </p>

                    <FigureTitle>Beispiele im Bassschlüssel</FigureTitle>
                    <AccidentalNotation clef="bass" groups={BASS_EXAMPLES} borderClass="border-emerald-200" />
                    <p className="text-sm text-slate-600 mt-3">
                        Groß- und Kleinschreibung zeigt wie bei den Stammtönen die Oktavlage an:
                        <strong> Fis</strong> und <strong>B</strong> liegen in der großen Oktave,
                        <strong> cis</strong>, <strong>es</strong>, <strong>gis</strong> und <strong>as</strong> in der kleinen Oktave.
                    </p>
                </section>

                {/* Section 10: Gültigkeit von Vorzeichen */}
                <section className="bg-slate-50 p-6 rounded-xl mb-6 border-l-4 border-slate-400">
                    <h3 className="mt-0 mb-4 text-slate-700 font-bold text-lg">
                        Gut zu wissen: Wie lange gilt ein Vorzeichen?
                    </h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-2">
                        <li>
                            Ein Vorzeichen direkt vor einer Note (<strong>Versetzungszeichen</strong>) gilt bis zum
                            Ende des <strong>Takts</strong> – auch für weitere Noten auf derselben Linie bzw. im selben Zwischenraum.
                        </li>
                        <li>
                            Das <strong>Auflösungszeichen (♮)</strong> hebt das Vorzeichen auf. Die Note ist dann wieder der Stammton.
                        </li>
                        <li>
                            Nach dem <strong>Taktstrich</strong> gilt das Vorzeichen nicht mehr.
                        </li>
                    </ul>

                    <FigureTitle>Beispiel: zwei Takte</FigureTitle>
                    <AccidentalNotation clef="treble" groups={VALIDITY_IN_BAR} borderClass="border-slate-300" />
                    <p className="text-sm text-slate-600 mt-3">
                        Im 1. Takt gilt das Kreuz auch für die zweite Note – sie heißt ebenfalls <strong>fis1</strong>.
                        Das Auflösungszeichen macht aus der dritten Note wieder <strong>f1</strong>.
                        Im 2. Takt gilt das Kreuz nicht mehr: <strong>f1</strong>.
                    </p>

                    <h4 className="font-bold text-slate-700 mt-8 mb-3 pt-6 border-t border-slate-200">
                        Generalvorzeichen
                    </h4>
                    <p className="text-slate-700 mb-3">
                        Stehen Vorzeichen am Anfang jeder Notenzeile direkt hinter dem Notenschlüssel, heißen sie
                        <strong> Generalvorzeichen</strong>. Anders als ein Versetzungszeichen gelten sie
                    </p>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 mb-3">
                        <li>für das <strong>ganze Stück</strong>,</li>
                        <li>für <strong>jede Oktave</strong> – also für alle Noten mit diesem Stammton,</li>
                        <li>in <strong>jedem Takt</strong> neu.</li>
                    </ul>
                    <p className="text-slate-700">
                        Ein <strong>Auflösungszeichen (♮)</strong> hebt ein Generalvorzeichen nur bis zum Ende des Takts auf.
                    </p>

                    <FigureTitle>Beispiel: ein Kreuz als Generalvorzeichen</FigureTitle>
                    <AccidentalNotation
                        clef="treble"
                        groups={KEY_SIGNATURE_EXAMPLE}
                        keySignature="G"
                        borderClass="border-slate-300"
                    />
                    <p className="text-sm text-slate-600 mt-3">
                        Das Kreuz steht auf der obersten Linie, dort wo f2 notiert wird. Es gilt aber für
                        <strong> alle f</strong>, egal in welcher Oktave: Die erste Note heißt <strong>fis1</strong>,
                        die zweite <strong>fis2</strong> – obwohl vor keiner der beiden ein Kreuz steht.
                        Das Auflösungszeichen macht aus der dritten Note <strong>f1</strong>.
                        Im 2. Takt gilt das Generalvorzeichen wieder: <strong>fis1</strong>.
                    </p>
                    <p className="text-sm text-slate-600 mt-3">
                        Mehr zu Generalvorzeichen und Tonarten erfährst du im Modul <strong>Quintenzirkel</strong>.
                    </p>
                </section>

                {/* Section 11: Lesestrategie */}
                <section className="bg-indigo-50 p-6 rounded-xl mb-6 border-l-4 border-indigo-500">
                    <h3 className="mt-0 mb-3 text-indigo-700 font-bold text-lg flex items-center gap-2">
                        <Lightbulb size={20} /> Tipp zum Notenlesen
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-slate-700">
                        <li>
                            <strong>Welcher Notenschlüssel?</strong> Schau zuerst ganz nach links –
                            Violin- oder Bassschlüssel?
                        </li>
                        <li>
                            <strong>Linie oder Zwischenraum?</strong> Sitzt die Note auf einer Linie
                            (Linie geht mitten durch die Note) oder in einem Zwischenraum?
                        </li>
                        <li>
                            <strong>Merkspruch anwenden:</strong> Zähle von unten nach oben mit dem
                            passenden Merkspruch durch – so findest du den Stammton.
                        </li>
                        <li>
                            <strong>Vorzeichen prüfen:</strong> Steht links vor der Note ein Kreuz (♯), hängst du
                            „-is" an. Steht dort ein Be (♭), hängst du „-es" an – Ausnahmen: es, as und b.
                        </li>
                    </ol>
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

export default NotesExplanation;
