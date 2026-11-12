import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, CheckCircle2, MousePointerClick, HelpCircle } from 'lucide-react';
import { AccidentalGlyph, WholeNoteIcon } from './ScaleStaff';

/** Kleines Symbol im Stil der Buttons der Eingabe. */
const Chip: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <span className={`inline-flex items-center justify-center min-w-[28px] h-[28px] px-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-bold align-middle ${className}`}>
        {children}
    </span>
);

const STEPS: { icon: React.ReactNode; title: string; text: React.ReactNode }[] = [
    {
        icon: <WholeNoteIcon size={28} />,
        title: 'Note setzen',
        text: (
            <>
                Ziehe die <strong>„Ganze Note“</strong> in die Notenzeile – oder tippe direkt an die gewünschte Stelle
                in der Zeile. Neue Noten werden immer <strong>rechts angehängt</strong>, so entsteht die Tonleiter von
                links nach rechts.
            </>
        ),
    },
    {
        icon: <MousePointerClick size={22} className="text-teal-700" />,
        title: 'Note antippen',
        text: (
            <>
                Tippe eine gesetzte Note an. Sie wird farbig markiert, und unter der Notenzeile erscheinen die
                Werkzeuge für diese Note.
            </>
        ),
    },
    {
        icon: <span className="inline-flex gap-0.5"><Chip><AccidentalGlyph acc={1} /></Chip><Chip><AccidentalGlyph acc={-1} /></Chip></span>,
        title: 'Vorzeichen setzen',
        text: (
            <>
                Wähle <Chip><AccidentalGlyph acc={1} /></Chip> für ein Kreuz, <Chip><AccidentalGlyph acc={-1} /></Chip> für
                ein Be oder <Chip>ohne</Chip>, um das Vorzeichen wieder zu entfernen.
            </>
        ),
    },
    {
        icon: <span className="inline-flex gap-0.5"><Chip><ChevronUp size={16} /></Chip><Chip><ChevronDown size={16} /></Chip></span>,
        title: 'Tonhöhe ändern',
        text: (
            <>
                Mit <Chip><ChevronUp size={16} /></Chip> und <Chip><ChevronDown size={16} /></Chip> rutscht die markierte
                Note einen Ton höher oder tiefer. Du kannst eine Note auch direkt nach oben oder unten ziehen.
            </>
        ),
    },
    {
        icon: <Chip className="border-rose-300 text-rose-600"><Trash2 size={16} /></Chip>,
        title: 'Löschen',
        text: (
            <>
                <strong>„Note löschen“</strong> entfernt die markierte Note. Ohne Markierung gibt es
                <strong> „Letzte Note entfernen“</strong> und <strong>„Alle löschen“</strong>.
            </>
        ),
    },
    {
        icon: <CheckCircle2 size={22} className="text-teal-700" />,
        title: 'Prüfen',
        text: (
            <>
                Stehen alle Töne in der Zeile, klicke auf <strong>„Prüfen“</strong>. Erst dann wird ausgewertet – vorher
                kannst du so viel ändern, wie du willst.
            </>
        ),
    },
];

const GuideList: React.FC = () => (
    <ol className="space-y-3">
        {STEPS.map(({ icon, title, text }, i) => (
            <li key={title} className="flex gap-3 items-start">
                <span className="flex-none w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                </span>
                <span className="flex-none w-[64px] hidden sm:flex justify-center items-center min-h-[28px]">{icon}</span>
                <div className="text-sm text-slate-700 leading-relaxed">
                    <strong className="text-slate-800">{title}:</strong> {text}
                </div>
            </li>
        ))}
    </ol>
);

interface ScaleInputGuideProps {
    /** Als aufklappbarer Kasten (während der Aufgabe) statt als feste Liste (Einstellungsseite). */
    collapsible?: boolean;
    open?: boolean;
    onToggle?: () => void;
}

/** Erklärt die Bedienung der Notenzeile (Noten setzen, Vorzeichen, Tonhöhe, Löschen, Prüfen). */
const ScaleInputGuide: React.FC<ScaleInputGuideProps> = ({ collapsible = false, open, onToggle }) => {
    const [localOpen, setLocalOpen] = useState(true);
    const isOpen = open ?? localOpen;
    const toggle = onToggle ?? (() => setLocalOpen((o) => !o));

    if (!collapsible) {
        return (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 text-left">
                <h4 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
                    <HelpCircle size={18} /> So funktioniert die Eingabe
                </h4>
                <GuideList />
            </div>
        );
    }

    return (
        <div className="mb-4 text-left">
            <button
                onClick={toggle}
                className="flex items-center justify-between w-full px-4 py-2.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 font-semibold hover:bg-teal-100 transition-colors"
                aria-expanded={isOpen}
            >
                <span className="flex items-center gap-2"><HelpCircle size={18} /> So funktioniert die Eingabe</span>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isOpen && (
                <div className="mt-2 p-4 bg-teal-50 border border-teal-200 rounded-xl">
                    <GuideList />
                </div>
            )}
        </div>
    );
};

export default ScaleInputGuide;
