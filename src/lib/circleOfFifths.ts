// Musiktheorie-Logik für den Quintenzirkel: Tonarten, Vorzeichen,
// Tonleitern und diatonische Dreiklänge (Stufen- und Funktionsbezeichnung).

export type KeyMode = 'major' | 'minor';

/** Buchstabe (0=c … 6=h) plus Vorzeichen-Offset (-1 = ♭, +1 = ♯). */
export interface SpelledNote {
    letter: number;
    acc: number;
}

export interface KeyDef {
    id: string;
    mode: KeyMode;
    /** Position im Zirkel, 0 = oben (C / a), im Uhrzeigersinn. */
    position: number;
    /** Anzahl Vorzeichen: positiv = ♯, negativ = ♭. */
    signature: number;
    tonic: SpelledNote;
}

export type CircleRing = 'outer' | 'inner';
export type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented';

export interface DiatonicChord {
    degree: number; // 1–7
    roman: string;
    notes: SpelledNote[];
    quality: TriadQuality;
    symbol: string;
    functionAbbr: string;
    functionName: string;
    /** Feld im Quintenzirkel – `null` für den verminderten Dreiklang. */
    circle: { ring: CircleRing; position: number } | null;
}

const LETTER_NAMES_DE = ['C', 'D', 'E', 'F', 'G', 'A', 'H'];
const LETTER_NAMES_EN = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const VEX_LETTERS = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
const NATURAL_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

/** Reihenfolge der Kreuze: f c g d a e h */
export const SHARP_ORDER = [3, 0, 4, 1, 5, 2, 6];
/** Reihenfolge der Be: b es as des ges ces fes */
export const FLAT_ORDER = [6, 2, 5, 1, 4, 0, 3];

export const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Vorzeichen, das die Tonart auf einen Buchstaben legt (-1, 0, +1). */
export function signatureAccidental(signature: number, letter: number): number {
    if (signature > 0) return SHARP_ORDER.slice(0, signature).includes(letter) ? 1 : 0;
    if (signature < 0) return FLAT_ORDER.slice(0, -signature).includes(letter) ? -1 : 0;
    return 0;
}

/** Die Vorzeichen einer Tonart in Notationsreihenfolge. */
export function signatureNotes(signature: number): SpelledNote[] {
    if (signature > 0) return SHARP_ORDER.slice(0, signature).map((letter) => ({ letter, acc: 1 }));
    if (signature < 0) return FLAT_ORDER.slice(0, -signature).map((letter) => ({ letter, acc: -1 }));
    return [];
}

export function positionOfSignature(signature: number): number {
    return mod(signature, 12);
}

function majorTonic(signature: number): SpelledNote {
    // Jede Quinte aufwärts = 4 Buchstaben weiter, jede Quinte abwärts = 3 Buchstaben weiter
    const letter = signature >= 0 ? mod(4 * signature, 7) : mod(-3 * signature, 7);
    return { letter, acc: signatureAccidental(signature, letter) };
}

function minorTonic(signature: number): SpelledNote {
    // Paralleles Moll = 6. Stufe der Dur-Tonleiter
    const letter = mod(majorTonic(signature).letter + 5, 7);
    return { letter, acc: signatureAccidental(signature, letter) };
}

/** Vorzeichenzahlen je Zirkelposition – unten stehen Fis-Dur (6♯) und Ges-Dur (6♭) gemeinsam. */
export const SIGNATURES_BY_POSITION: number[][] = [
    [0], [1], [2], [3], [4], [5], [6, -6], [-5], [-4], [-3], [-2], [-1],
];

function buildKeys(mode: KeyMode): KeyDef[] {
    return SIGNATURES_BY_POSITION.flat().map((signature) => ({
        id: `${mode}:${signature}`,
        mode,
        position: positionOfSignature(signature),
        signature,
        tonic: mode === 'major' ? majorTonic(signature) : minorTonic(signature),
    }));
}

export const MAJOR_KEYS: KeyDef[] = buildKeys('major');
export const MINOR_KEYS: KeyDef[] = buildKeys('minor');
export const ALL_KEYS: KeyDef[] = [...MAJOR_KEYS, ...MINOR_KEYS];

export function getKey(mode: KeyMode, signature: number): KeyDef {
    return ALL_KEYS.find((k) => k.mode === mode && k.signature === signature)!;
}

export function getKeyById(id: string): KeyDef | undefined {
    return ALL_KEYS.find((k) => k.id === id);
}

// --- Namen ---

/** Deutscher Tonname mit großem Anfangsbuchstaben: C, Cis, Es, B, H, Eis … */
export function germanNoteName(note: SpelledNote): string {
    const { letter, acc } = note;
    if (acc === 0) return LETTER_NAMES_DE[letter];
    if (acc > 0) return LETTER_NAMES_DE[letter] + 'is'.repeat(acc);
    if (letter === 6) return acc === -1 ? 'B' : 'Heses';
    if (letter === 2 || letter === 5) return LETTER_NAMES_DE[letter] + 's' + 'es'.repeat(-acc - 1);
    return LETTER_NAMES_DE[letter] + 'es'.repeat(-acc);
}

/** „C-Dur“ bzw. „a-Moll“ */
export function keyName(key: KeyDef): string {
    const name = germanNoteName(key.tonic);
    return key.mode === 'major' ? `${name}-Dur` : `${name.toLowerCase()}-Moll`;
}

/** Kurzname fürs Zirkelfeld: Dur groß („Fis“), Moll klein („dis“) */
export function keyShortName(key: KeyDef): string {
    const name = germanNoteName(key.tonic);
    return key.mode === 'major' ? name : name.toLowerCase();
}

/** VexFlow-Tonartspezifikation (immer über die Dur-Tonart mit gleicher Vorzeichnung). */
export function vexKeySignatureSpec(signature: number): string {
    const t = majorTonic(signature);
    return LETTER_NAMES_EN[t.letter] + (t.acc > 0 ? '#' : t.acc < 0 ? 'b' : '');
}

function noteSemitone(note: SpelledNote): number {
    return NATURAL_SEMITONES[note.letter] + note.acc;
}

// --- Tonleiter ---

/** Die 7 leitereigenen Töne (natürliches Moll bei Molltonarten). */
export function scaleNotes(key: KeyDef): SpelledNote[] {
    return Array.from({ length: 7 }, (_, i) => {
        const letter = mod(key.tonic.letter + i, 7);
        return { letter, acc: signatureAccidental(key.signature, letter) };
    });
}

/** Grundton-Oktave so gewählt, dass Tonleiter und Dreiklänge gut im Violinschlüssel liegen. */
function tonicOctave(key: KeyDef): number {
    return key.tonic.letter >= 5 ? 3 : 4;
}

function toVexKey(note: SpelledNote, octave: number): string {
    const acc = note.acc > 0 ? '#'.repeat(note.acc) : 'b'.repeat(-note.acc);
    return `${VEX_LETTERS[note.letter]}${acc}/${octave}`;
}

/** Tonleiter über eine Oktave als VexFlow-Keys, z. B. ['d/4', 'e/4', 'f#/4', …, 'd/5']. */
export function scaleVexKeys(key: KeyDef): string[] {
    const base = tonicOctave(key);
    return Array.from({ length: 8 }, (_, i) => {
        const raw = key.tonic.letter + i;
        const letter = mod(raw, 7);
        return toVexKey({ letter, acc: signatureAccidental(key.signature, letter) }, base + Math.floor(raw / 7));
    });
}

/** Leitereigener Dreiklang auf Stufe `degree` (1–7) in Grundstellung als VexFlow-Keys. */
export function triadVexKeys(key: KeyDef, degree: number): string[] {
    const base = tonicOctave(key);
    return [0, 2, 4].map((offset) => {
        const raw = key.tonic.letter + degree - 1 + offset;
        const letter = mod(raw, 7);
        return toVexKey({ letter, acc: signatureAccidental(key.signature, letter) }, base + Math.floor(raw / 7));
    });
}

// --- Diatonische Dreiklänge ---

function triadQuality(notes: SpelledNote[]): TriadQuality {
    const third = mod(noteSemitone(notes[1]) - noteSemitone(notes[0]), 12);
    const fifth = mod(noteSemitone(notes[2]) - noteSemitone(notes[0]), 12);
    if (third === 4 && fifth === 7) return 'major';
    if (third === 3 && fifth === 7) return 'minor';
    if (third === 3 && fifth === 6) return 'diminished';
    return 'augmented';
}

export function chordSymbol(root: SpelledNote, quality: TriadQuality): string {
    const name = germanNoteName(root);
    switch (quality) {
        case 'major': return name;
        case 'minor': return `${name}m`;
        case 'diminished': return `${name}°`;
        case 'augmented': return `${name}+`;
    }
}

const MAJOR_FUNCTIONS: [string, string][] = [
    ['T', 'Tonika'],
    ['Sp', 'Subdominantparallele'],
    ['Dp', 'Dominantparallele'],
    ['S', 'Subdominante'],
    ['D', 'Dominante'],
    ['Tp', 'Tonikaparallele'],
    ['D̸⁷', 'verkürzter Dominantseptakkord'],
];

const MINOR_FUNCTIONS: [string, string][] = [
    ['t', 'Tonika'],
    ['–', 'verminderter Dreiklang'],
    ['tP', 'Tonikaparallele'],
    ['s', 'Subdominante'],
    ['d', 'Dominante'],
    ['sP', 'Subdominantparallele'],
    ['dP', 'Dominantparallele'],
];

/**
 * Lage der Stufen im Zirkel relativ zur Tonika (Positionsversatz, Ring).
 * Dur: IV–I–V außen, II–VI–III innen. Moll: IV–I–V innen, VI–III–VII außen.
 */
const MAJOR_LAYOUT: Record<number, [number, CircleRing]> = {
    1: [0, 'outer'], 4: [-1, 'outer'], 5: [1, 'outer'],
    6: [0, 'inner'], 2: [-1, 'inner'], 3: [1, 'inner'],
};
const MINOR_LAYOUT: Record<number, [number, CircleRing]> = {
    1: [0, 'inner'], 4: [-1, 'inner'], 5: [1, 'inner'],
    3: [0, 'outer'], 6: [-1, 'outer'], 7: [1, 'outer'],
};

export function diatonicChords(key: KeyDef): DiatonicChord[] {
    const scale = scaleNotes(key);
    const functions = key.mode === 'major' ? MAJOR_FUNCTIONS : MINOR_FUNCTIONS;
    const layout = key.mode === 'major' ? MAJOR_LAYOUT : MINOR_LAYOUT;

    return scale.map((root, i) => {
        const degree = i + 1;
        const notes = [scale[i], scale[(i + 2) % 7], scale[(i + 4) % 7]];
        const quality = triadQuality(notes);
        const place = layout[degree];
        return {
            degree,
            roman: ROMAN_NUMERALS[i],
            notes,
            quality,
            symbol: chordSymbol(root, quality),
            functionAbbr: functions[i][0],
            functionName: functions[i][1],
            circle: place ? { ring: place[1], position: mod(key.position + place[0], 12) } : null,
        };
    });
}

/**
 * Unten im Zirkel (Position 6) teilen sich Fis/Ges bzw. dis/es ein Feld.
 * Liefert, welche Hälfte eine Tonbezeichnung meint.
 */
export function enharmonicHalf(note: SpelledNote): 'sharp' | 'flat' {
    return note.acc > 0 ? 'sharp' : 'flat';
}
