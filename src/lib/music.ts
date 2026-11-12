import type { Clef, Question } from '../types';
import * as Tone from 'tone';

// Constants

interface IntervalDef {
    label: string;
    semitones: number;
    abbrev: string;
}

export interface TriadDef {
    label: string;
    type: 'major' | 'minor' | 'diminished' | 'augmented';
    intervals: number[];
}

const INTERVALS: IntervalDef[] = [
    { label: 'Reine Prime', semitones: 0, abbrev: 'P1' },
    { label: 'Kleine Sekunde', semitones: 1, abbrev: 'm2' },
    { label: 'Große Sekunde', semitones: 2, abbrev: 'M2' },
    { label: 'Kleine Terz', semitones: 3, abbrev: 'm3' },
    { label: 'Große Terz', semitones: 4, abbrev: 'M3' },
    { label: 'Reine Quarte', semitones: 5, abbrev: 'P4' },
    { label: 'Übermäßige Quarte / Verm. Quinte', semitones: 6, abbrev: 'A4/d5' },
    { label: 'Reine Quinte', semitones: 7, abbrev: 'P5' },
    { label: 'Kleine Sexte', semitones: 8, abbrev: 'm6' },
    { label: 'Große Sexte', semitones: 9, abbrev: 'M6' },
    { label: 'Kleine Septime', semitones: 10, abbrev: 'm7' },
    { label: 'Große Septime', semitones: 11, abbrev: 'M7' },
    { label: 'Reine Oktave', semitones: 12, abbrev: 'P8' }
];

// --- Interval Module Data (adapted from IntervallApp) ---

export const INTERVAL_NOTES = ['C', 'Cis/Des', 'D', 'Dis/Es', 'E', 'F', 'Fis/Ges', 'G', 'Gis/As', 'A', 'Ais/B', 'H'];

export interface QuizInterval {
    semitones: number;
    name: string;
}

export const QUIZ_INTERVALS: QuizInterval[] = [
    { semitones: 0, name: 'Prime (Rein)' },
    { semitones: 1, name: 'Kleine Sekunde' },
    { semitones: 2, name: 'Große Sekunde' },
    { semitones: 3, name: 'Kleine Terz' },
    { semitones: 4, name: 'Große Terz' },
    { semitones: 5, name: 'Quarte (Rein)' },
    { semitones: 6, name: 'Übermäßige Quarte' },
    { semitones: 6, name: 'Verminderte Quinte' },
    { semitones: 7, name: 'Quinte (Rein)' },
    { semitones: 8, name: 'Kleine Sexte' },
    { semitones: 9, name: 'Große Sexte' },
    { semitones: 10, name: 'Kleine Septime' },
    { semitones: 11, name: 'Große Septime' },
    { semitones: 12, name: 'Oktave' },
];

export interface PracticeChallenge {
    semitones: number;
    name: string;
    rough: number;
}

export const PRACTICE_CHALLENGES: PracticeChallenge[] = [
    { semitones: 1, name: 'Kleine Sekunde', rough: 2 },
    { semitones: 2, name: 'Große Sekunde', rough: 2 },
    { semitones: 3, name: 'Kleine Terz', rough: 3 },
    { semitones: 4, name: 'Große Terz', rough: 3 },
    { semitones: 5, name: 'Quarte (Rein)', rough: 4 },
    { semitones: 6, name: 'Übermäßige Quarte', rough: 4 },
    { semitones: 6, name: 'Verminderte Quinte', rough: 5 },
    { semitones: 7, name: 'Quinte (Rein)', rough: 5 },
    { semitones: 8, name: 'Kleine Sexte', rough: 6 },
    { semitones: 9, name: 'Große Sexte', rough: 6 },
    { semitones: 10, name: 'Kleine Septime', rough: 7 },
    { semitones: 11, name: 'Große Septime', rough: 7 },
    { semitones: 12, name: 'Oktave', rough: 8 }
];

export function getRandomInterval(mode: 'quiz' | 'practice' = 'quiz'): PracticeChallenge {
    if (mode === 'practice') {
        return getRandomElement(PRACTICE_CHALLENGES);
    }
    // Quiz Mode: pick a random entry from QUIZ_INTERVALS (excluding Prime)
    const quizEntries = QUIZ_INTERVALS.filter(e => e.semitones > 0);
    const entry = getRandomElement(quizEntries);
    return {
        semitones: entry.semitones,
        name: entry.name,
        rough: 0, // not used in quiz
    };
}

// ---

export const TRIADS: TriadDef[] = [
    { label: 'Dur', type: 'major', intervals: [4, 7] },
    { label: 'Moll', type: 'minor', intervals: [3, 7] },
    { label: 'Vermindert', type: 'diminished', intervals: [3, 6] },
    { label: 'Übermäßig', type: 'augmented', intervals: [4, 8] }
];

export const INVERSIONS = ['Grundstellung', '1. Umkehrung', '2. Umkehrung'] as const;
export type Inversion = typeof INVERSIONS[number];

// Helper to get random integer
const getRandomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to get random element
const getRandomElement = <T>(arr: readonly T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];


export const toGermanNote = (note: string, accidental: string, octave: number): string => {
    let noteName = note.toUpperCase();
    let accSuffix = '';

    // Accidentals
    if (accidental === '#') {
        accSuffix = 'is';
    } else if (accidental === 'b') {
        accSuffix = 'es';
    }

    // Special cases for Note Names + Accidental
    if (noteName === 'E' && accidental === 'b') {
        noteName = 'Es'; // Not Ees
        accSuffix = '';
    } else if (noteName === 'A' && accidental === 'b') {
        noteName = 'As'; // Not Aes
        accSuffix = '';
    } else if (noteName === 'B') {
        if (accidental === 'b') {
            noteName = 'B'; // English Bb is German B
            accSuffix = '';
        } else {
            noteName = 'H'; // English B is German H
        }
    }

    let fullNote = noteName + accSuffix;

    // Octave mapping (Helmholtz)
    // C4 (MIDI 60) = c' (eingestrichen) -> c1
    // C3 (MIDI 48) = c (kleine oktave)
    // C2 (MIDI 36) = C (große oktave)

    // User requested: "Notennamen im Violinschlüssel Kleinbuchstaben"
    // Treble clef is usually C4+, so c1, c2 etc.
    // Let's implement standard logic:
    // Octave 4 (C4-B4) -> '1' suffix, lowercase
    // Octave 5 (C5-B5) -> '2' suffix, lowercase
    // Octave 3 (C3-B3) -> no suffix, lowercase
    // Octave 2 (C2-B2) -> no suffix, uppercase

    let octaveSuffix = '';
    let isLowerCase = false;

    if (octave >= 4) {
        isLowerCase = true;
        octaveSuffix = (octave - 3).toString(); // 4->1, 5->2, 6->3
    } else if (octave === 3) {
        isLowerCase = true;
        octaveSuffix = '';
    } else {
        isLowerCase = false;
        octaveSuffix = ''; // Großbuchstaben für C2 und tiefer (Große Oktave etc)
    }

    if (isLowerCase) {
        fullNote = fullNote.toLowerCase();
    } else {
        // Ensure first letter uppercase (should be already from toUpperCase)
        // But 'cis' if lowercase, 'Cis' if uppercase.
        // Wait, if H maps to B/H, standard capitalization rules apply.
    }

    return fullNote + octaveSuffix;
};

export const generateNoteQuestion = (
    clef: Clef,
    useAccidentals: boolean = true,
    noteRange?: { startOctave: number, endOctave: number }
): Question => {
    const accidentals = useAccidentals ? ['', '#', 'b'] : [''];

    // Notes definition
    const allNotes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

    // Generate all valid note/octave combinations first
    // This ensures uniform distribution across all notes, rather than biasing towards octaves with fewer notes (edges)
    const validCombinations: { note: string, octave: number, acc?: string }[] = [];

    if (noteRange) {
        // Custom range matches the on-screen keyboard: white keys from C(startOctave)
        // up to the closing C(endOctave). We pre-build note/accidental combinations and
        // keep only those whose *sounding* pitch lies within the playable key range, so
        // edge notes like Ces1 (Cb4 → sounds B3, below the lowest key) are never asked.
        const noteToMidi = (n: string, a: string, o: number): number => {
            const accOffset = a === '#' ? 1 : a === 'b' ? -1 : 0;
            return 12 * (o + 1) + NATURAL_SEMITONES[allNotes.indexOf(n)] + accOffset;
        };
        const lowMidi = 12 * (noteRange.startOctave + 1);   // C(startOctave) = lowest key
        const highMidi = 12 * (noteRange.endOctave + 1);    // C(endOctave) = highest (closing) key
        const isPlayable = (n: string, a: string, o: number) => {
            const m = noteToMidi(n, a, o);
            return m >= lowMidi && m <= highMidi;
        };

        // Full octaves from startOctave to endOctave-1, plus just 'c' in the endOctave (closing C)
        for (let o = noteRange.startOctave; o < noteRange.endOctave; o++) {
            allNotes.forEach(n => accidentals.forEach(a => {
                if (isPlayable(n, a, o)) validCombinations.push({ note: n, octave: o, acc: a });
            }));
        }
        accidentals.forEach(a => {
            if (isPlayable('c', a, noteRange.endOctave)) {
                validCombinations.push({ note: 'c', octave: noteRange.endOctave, acc: a });
            }
        });
    } else if (clef === 'treble') {
        // Range: E3 - E6
        // Octave 3 (E3-B3)
        ['e', 'f', 'g', 'a', 'b'].forEach(n => validCombinations.push({ note: n, octave: 3 }));
        // Octave 4, 5 (C-B)
        allNotes.forEach(n => validCombinations.push({ note: n, octave: 4 }));
        allNotes.forEach(n => validCombinations.push({ note: n, octave: 5 }));
        // Octave 6 (C6-E6)
        ['c', 'd', 'e'].forEach(n => validCombinations.push({ note: n, octave: 6 }));
    } else {
        // Bass Clef Range: C2 - E4
        // Octave 2 (C2-B2)
        allNotes.forEach(n => validCombinations.push({ note: n, octave: 2 }));
        // Octave 3 (C3-B3)
        allNotes.forEach(n => validCombinations.push({ note: n, octave: 3 }));
        // Octave 4 (C4-E4)
        ['c', 'd', 'e'].forEach(n => validCombinations.push({ note: n, octave: 4 }));
    }

    const selection = getRandomElement(validCombinations);
    const note = selection.note;
    const octave = selection.octave;
    // For the keyboard ranges the accidental is part of the pre-filtered combination;
    // for the staff (clef) ranges it is chosen freely as before.
    const acc = selection.acc ?? getRandomElement(accidentals);

    const key = `${note}${acc}/${octave}`; // VexFlow format
    const scientific = `${note.toUpperCase()}${acc}${octave}`; // Audio/Logic format (Technical)

    // Generate German Display Answer
    const germanAnswer = toGermanNote(note, acc, octave);

    return {
        type: 'note',
        question: { keys: [key], clef },
        answer: germanAnswer,
        technicalAnswer: scientific,
        options: generateOptions(germanAnswer, 'note', useAccidentals)
    };
};

// Basic Transposition Map for C4 Root
const INTERVAL_MAP: Record<string, string> = {
    'P1': 'c/4',
    'm2': 'db/4',
    'M2': 'd/4',
    'm3': 'eb/4',
    'M3': 'e/4',
    'P4': 'f/4',
    'A4/d5': 'f#/4',
    'P5': 'g/4',
    'm6': 'ab/4',
    'M6': 'a/4',
    'm7': 'bb/4',
    'M7': 'b/4',
    'P8': 'c/5'
};

export const generateIntervalQuestion = (): Question => {
    const rootNote = 'c/4';
    const interval = getRandomElement(INTERVALS);
    const note2 = INTERVAL_MAP[interval.abbrev] || 'c/5';

    return {
        type: 'interval',
        question: { keys: [rootNote, note2], clef: 'treble' },
        answer: interval.label,
        options: generateOptions(interval.label, 'interval')
    };
};

// --- Triad with variable root notes (Quintenzirkel) ---
// Notes MUST be built using letter-name offsets (Terzschichtung):
// Root → +2 letters = Third → +2 letters = Fifth
// This ensures notes always sit on alternating lines or spaces.

const NOTE_LETTERS = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
const NATURAL_SEMITONES = [0, 2, 4, 5, 7, 9, 11]; // C=0, D=2, E=4, F=5, G=7, A=9, B=11

export interface RootNoteDef {
    germanName: string;
    letterIndex: number;       // Index in NOTE_LETTERS (0-6)
    accidentalSemitones: number; // -1=flat, 0=natural, +1=sharp
    octave: number;
}

// Quintenzirkel root notes — lowest root is a/3 (kleines a)
export const QUINTENZIRKEL_ROOTS: RootNoteDef[] = [
    { germanName: 'C', letterIndex: 0, accidentalSemitones: 0, octave: 4 },
    { germanName: 'G', letterIndex: 4, accidentalSemitones: 0, octave: 3 },
    { germanName: 'D', letterIndex: 1, accidentalSemitones: 0, octave: 4 },
    { germanName: 'A', letterIndex: 5, accidentalSemitones: 0, octave: 3 },
    { germanName: 'E', letterIndex: 2, accidentalSemitones: 0, octave: 4 },
    { germanName: 'H', letterIndex: 6, accidentalSemitones: 0, octave: 3 },
    { germanName: 'Fis', letterIndex: 3, accidentalSemitones: 1, octave: 4 },
    { germanName: 'F', letterIndex: 3, accidentalSemitones: 0, octave: 4 },
    { germanName: 'B', letterIndex: 6, accidentalSemitones: -1, octave: 3 },
    { germanName: 'Es', letterIndex: 2, accidentalSemitones: -1, octave: 4 },
    { germanName: 'As', letterIndex: 5, accidentalSemitones: -1, octave: 3 },
    { germanName: 'Des', letterIndex: 1, accidentalSemitones: -1, octave: 4 },
    { germanName: 'Ges', letterIndex: 4, accidentalSemitones: -1, octave: 4 },
];

/** Convert accidental semitone offset to VexFlow accidental string */
function accidentalToVex(offset: number): string {
    switch (offset) {
        case -2: return 'bb';
        case -1: return 'b';
        case 0: return '';
        case 1: return '#';
        case 2: return '##';
        default: return '';
    }
}

/** Build a VexFlow key string from letter index, accidental offset, and octave */
function buildVexKey(letterIndex: number, accOffset: number, octave: number): string {
    return `${NOTE_LETTERS[letterIndex]}${accidentalToVex(accOffset)}/${octave}`;
}

/**
 * Build VexFlow keys for a triad using proper Terzschichtung (third-stacking).
 * The third is always 2 letter names above root, the fifth is 4 letter names above.
 * Accidentals are computed to match the required semitone intervals.
 * Returns null if the highest note exceeds c/6 or requires triple accidentals.
 */
export function buildTriadKeys(root: RootNoteDef, intervals: number[]): string[] | null {
    const rootAbsSemitone = root.octave * 12 + NATURAL_SEMITONES[root.letterIndex] + root.accidentalSemitones;
    const keys: string[] = [];

    // Root note
    keys.push(buildVexKey(root.letterIndex, root.accidentalSemitones, root.octave));

    // Letter offsets for third (+2) and fifth (+4)
    const LETTER_OFFSETS = [2, 4];

    for (let i = 0; i < intervals.length; i++) {
        const rawLetterIndex = root.letterIndex + LETTER_OFFSETS[i];
        const targetLetterIndex = rawLetterIndex % 7;
        const targetOctave = root.octave + Math.floor(rawLetterIndex / 7);
        const targetNaturalAbsSemitone = targetOctave * 12 + NATURAL_SEMITONES[targetLetterIndex];
        const targetAbsSemitone = rootAbsSemitone + intervals[i];

        const accidentalNeeded = targetAbsSemitone - targetNaturalAbsSemitone;

        // Only allow single accidentals [-1, +1] (flat to sharp) — no double accidentals
        if (accidentalNeeded < -1 || accidentalNeeded > 1) {
            return null;
        }

        keys.push(buildVexKey(targetLetterIndex, accidentalNeeded, targetOctave));
    }

    // Check: highest note must be <= c/6 (c3 in Helmholtz)
    const lastInterval = intervals[intervals.length - 1];
    const highestAbsSemitone = rootAbsSemitone + lastInterval;
    const maxAbsSemitone = 6 * 12 + 0; // c/6 = 72

    if (highestAbsSemitone > maxAbsSemitone) {
        return null;
    }

    return keys;
}

// --- Helpers for inversions and wide voicing ---

const ACC_OFFSETS: Record<string, number> = { '': 0, '#': 1, 'b': -1, '##': 2, 'bb': -2 };

function parseKey(key: string): { letter: string; accidental: string; octave: number } {
    const [notePart, octStr] = key.split('/');
    return { letter: notePart.charAt(0), accidental: notePart.substring(1), octave: parseInt(octStr) };
}

function keyToAbsSemitone(key: string): number {
    const { letter, accidental, octave } = parseKey(key);
    const letterIdx = NOTE_LETTERS.indexOf(letter);
    return octave * 12 + NATURAL_SEMITONES[letterIdx] + (ACC_OFFSETS[accidental] ?? 0);
}

function oktavateKeyUp(key: string): string {
    const { letter, accidental, octave } = parseKey(key);
    return `${letter}${accidental}/${octave + 1}`;
}

/** Apply an inversion to a Grundstellung triad. Returns spatially-sorted keys (Bass first). */
function applyInversion(grundKeys: string[], inversionIndex: number): string[] | null {
    if (inversionIndex === 0) return grundKeys.slice();
    const result: string[] = [];
    for (let i = inversionIndex; i < grundKeys.length; i++) result.push(grundKeys[i]);
    for (let i = 0; i < inversionIndex; i++) result.push(oktavateKeyUp(grundKeys[i]));
    const maxAbs = 6 * 12; // c/6
    for (const k of result) if (keyToAbsSemitone(k) > maxAbs) return null;
    return result;
}

/** Sort VexFlow keys by absolute pitch (ascending). */
function sortKeysAscending(keys: string[]): string[] {
    return [...keys].sort((a, b) => keyToAbsSemitone(a) - keyToAbsSemitone(b));
}

/** A voicing is valid if no two adjacent tones are a Terz (3 or 4 semitones) apart and all tones fit within range. */
function isValidWideVoicing(sortedKeys: string[], maxAbs: number): boolean {
    for (const k of sortedKeys) {
        if (keyToAbsSemitone(k) > maxAbs) return false;
    }
    for (let i = 1; i < sortedKeys.length; i++) {
        const diff = keyToAbsSemitone(sortedKeys[i]) - keyToAbsSemitone(sortedKeys[i - 1]);
        if (diff === 3 || diff === 4) return false;
    }
    return true;
}

/**
 * Apply a wide voicing to a triad. Tries multiple spread patterns and picks one
 * at random from those without adjacent Terz intervals.
 */
function applyWideVoicing(spatialKeys: string[]): string[] | null {
    if (spatialKeys.length !== 3) return null;
    const maxAbs = 7 * 12; // c/7

    const candidates: string[][] = [];

    // Pattern A: middle voice oktavated up → "open" voicing
    // (bass and top stay, middle jumps over the top)
    const patternA = sortKeysAscending([
        spatialKeys[0],
        oktavateKeyUp(spatialKeys[1]),
        spatialKeys[2],
    ]);
    if (isValidWideVoicing(patternA, maxAbs)) candidates.push(patternA);

    // Pattern B: both outer voices oktavated up → very wide "spread" voicing
    // (bass and top both up an octave, middle stays — the original middle becomes the new bass)
    const patternB = sortKeysAscending([
        oktavateKeyUp(spatialKeys[0]),
        spatialKeys[1],
        oktavateKeyUp(spatialKeys[2]),
    ]);
    if (isValidWideVoicing(patternB, maxAbs)) candidates.push(patternB);

    // Pattern C: bass stays, middle oktavated up by two → extremely wide spread
    // (rarer and only valid when no Terz adjacency results)
    const patternC = sortKeysAscending([
        spatialKeys[0],
        oktavateKeyUp(oktavateKeyUp(spatialKeys[1])),
        spatialKeys[2],
    ]);
    if (isValidWideVoicing(patternC, maxAbs)) candidates.push(patternC);

    if (candidates.length === 0) return null;
    return getRandomElement(candidates);
}

// --- Triad question generators ---

export interface GenerateTriadOptions {
    allowInversions?: boolean;
    allowWideVoicing?: boolean;
}

export const generateTriadQuestion = (opts: GenerateTriadOptions = {}): Question => {
    const { allowInversions = false, allowWideVoicing = false } = opts;

    let triad: TriadDef = TRIADS[0];
    let root: RootNoteDef = QUINTENZIRKEL_ROOTS[0];
    let inversionIndex = 0;
    let keys: string[] | null = null;
    let isWide = false;

    let attempts = 0;
    do {
        triad = getRandomElement(TRIADS);
        root = getRandomElement(QUINTENZIRKEL_ROOTS);
        inversionIndex = allowInversions ? getRandomInt(0, 2) : 0;
        const grund = buildTriadKeys(root, triad.intervals);
        if (!grund) { attempts++; continue; }

        keys = applyInversion(grund, inversionIndex);
        if (!keys) { attempts++; continue; }

        // Apply wide voicing in 80% of cases when enabled — leaves room for occasional enge Lage
        isWide = false;
        if (allowWideVoicing && Math.random() < 0.8) {
            const wide = applyWideVoicing(keys);
            if (wide) { keys = wide; isWide = true; }
        }
        attempts++;
    } while (!keys && attempts < 100);

    if (!keys) {
        root = QUINTENZIRKEL_ROOTS[0];
        triad = TRIADS[0];
        inversionIndex = 0;
        isWide = false;
        keys = ['c/4', 'e/4', 'g/4'];
    }

    const inversion: Inversion = INVERSIONS[inversionIndex];
    const answer = allowInversions
        ? `${root.germanName}-${triad.label} ${inversion}`
        : `${root.germanName}-${triad.label}`;

    // Suppress unused warning — isWide reserved for future stats/logging
    void isWide;

    return {
        type: 'triad',
        question: { keys, clef: 'treble' },
        answer,
        options: generateOptions(answer, 'triad', true, allowInversions)
    };
};

// --- Triad "Bilden" (Build) Mode ---

export interface TriadBuildQuestion {
    /** The triad name to display, e.g. "C-Dur" */
    triadName: string;
    /** Which inversion the user must build */
    inversion: Inversion;
    /** The correct VexFlow keys the user must enter — in spatial order (Bass first) */
    correctKeys: string[];
}

/**
 * Generate a question for the "Bilden" mode.
 * Returns a triad name, the required inversion, and the expected VexFlow keys (spatial order).
 *
 * When `emphasizeInversions` is true (and `allowInversions` is true), the inversion is sampled
 * with weights 20 % Grundstellung / 40 % 1. Umk. / 40 % 2. Umk. Otherwise uniform 1/3-each.
 */
export const generateTriadBuildQuestion = (
    opts: { allowInversions?: boolean; emphasizeInversions?: boolean } = {}
): TriadBuildQuestion => {
    const { allowInversions = false, emphasizeInversions = false } = opts;

    let triad: TriadDef = TRIADS[0];
    let root: RootNoteDef = QUINTENZIRKEL_ROOTS[0];
    let inversionIndex = 0;
    let keys: string[] | null = null;

    const pickInversionIndex = (): number => {
        if (!allowInversions) return 0;
        if (!emphasizeInversions) return getRandomInt(0, 2);
        const r = Math.random();
        if (r < 0.2) return 0;       // 20 % Grundstellung
        if (r < 0.6) return 1;       // 40 % 1. Umkehrung
        return 2;                    // 40 % 2. Umkehrung
    };

    let attempts = 0;
    do {
        triad = getRandomElement(TRIADS);
        root = getRandomElement(QUINTENZIRKEL_ROOTS);
        inversionIndex = pickInversionIndex();
        const grund = buildTriadKeys(root, triad.intervals);
        if (!grund) { attempts++; continue; }
        keys = applyInversion(grund, inversionIndex);
        attempts++;
    } while (!keys && attempts < 100);

    if (!keys) {
        root = QUINTENZIRKEL_ROOTS[0];
        triad = TRIADS[0];
        inversionIndex = 0;
        keys = ['c/4', 'e/4', 'g/4'];
    }

    return {
        triadName: `${root.germanName}-${triad.label}`,
        inversion: INVERSIONS[inversionIndex],
        correctKeys: keys,
    };
};

/**
 * Check whether the user-selected VexFlow keys match the correct triad keys.
 * Keys must match exactly (same note letter, accidental, and octave).
 */
export const checkTriadBuildAnswer = (userKeys: string[], correctKeys: string[]): boolean => {
    if (userKeys.length !== correctKeys.length) return false;
    // Sort both arrays to allow any order of selection
    const sortedUser = [...userKeys].sort();
    const sortedCorrect = [...correctKeys].sort();
    return sortedUser.every((key, i) => key === sortedCorrect[i]);
};

// --- Interval "Bilden" (Build) Mode ---

export interface IntervalBuildQuestion {
    intervalName: string;
    intervalSemitones: number;
    intervalRough: number;
    correctKeys: string[];
}

/**
 * Build VexFlow keys for an interval using proper Terzschichtung-style offset.
 * The interval rough size determines the letter offset.
 * e.g., Terz (rough=3) -> letter offset = 2
 */
export function buildIntervalKeys(root: RootNoteDef, interval: PracticeChallenge): string[] | null {
    const rootAbsSemitone = root.octave * 12 + NATURAL_SEMITONES[root.letterIndex] + root.accidentalSemitones;
    const keys: string[] = [];

    // Root note
    keys.push(buildVexKey(root.letterIndex, root.accidentalSemitones, root.octave));

    // Target note
    // Note: interval.rough is 1-based (Prime=1, Sekunde=2, Terz=3, etc.)
    // Letter offset is rough - 1
    const letterOffset = interval.rough - 1;

    const rawLetterIndex = root.letterIndex + letterOffset;
    const targetLetterIndex = rawLetterIndex % 7;
    const targetOctave = root.octave + Math.floor(rawLetterIndex / 7);
    const targetNaturalAbsSemitone = targetOctave * 12 + NATURAL_SEMITONES[targetLetterIndex];
    const targetAbsSemitone = rootAbsSemitone + interval.semitones;

    const accidentalNeeded = targetAbsSemitone - targetNaturalAbsSemitone;

    // Only allow single accidentals [-1, +1] (flat to sharp) — no double accidentals
    if (accidentalNeeded < -1 || accidentalNeeded > 1) {
        return null;
    }

    // Check: highest note must be <= c/6 (c3 in Helmholtz)
    const maxAbsSemitone = 6 * 12 + 0; // c/6 = 72
    if (targetAbsSemitone > maxAbsSemitone) {
        return null;
    }

    keys.push(buildVexKey(targetLetterIndex, accidentalNeeded, targetOctave));

    return keys;
}

/**
 * @param clefMode
 *   - 'treble' (default for practice): nur Roots in Oktave ≥ 4 → ausschließlich Violinschlüssel.
 *   - 'mixed': 50/50 zwischen Bass- und Violinschlüssel.
 *   - 'auto': beliebiger Root aus QUINTENZIRKEL_ROOTS (Standardverhalten des Quiz).
 */
export const generateIntervalBuildQuestion = (
    mode: 'practice' | 'quiz',
    opts: { clefMode?: 'treble' | 'mixed' | 'auto' } = {}
): IntervalBuildQuestion => {
    const { clefMode = 'auto' } = opts;
    let interval: PracticeChallenge;
    let root: RootNoteDef;
    let keys: string[] | null = null;

    const trebleRoots = QUINTENZIRKEL_ROOTS.filter(r => r.octave >= 4);
    const bassRoots = QUINTENZIRKEL_ROOTS.filter(r => r.octave < 4);

    const pickRoot = (): RootNoteDef => {
        if (clefMode === 'treble') return getRandomElement(trebleRoots);
        if (clefMode === 'mixed') {
            return Math.random() < 0.5
                ? getRandomElement(bassRoots)
                : getRandomElement(trebleRoots);
        }
        return getRandomElement(QUINTENZIRKEL_ROOTS);
    };

    let attempts = 0;
    do {
        // get a random interval (use the practice challenges logic which has the rough interval numbers we need)
        const practiceChallengesToUse = mode === 'quiz' ? PRACTICE_CHALLENGES.filter(p => p.semitones > 0) : PRACTICE_CHALLENGES;
        interval = getRandomElement(practiceChallengesToUse);
        root = pickRoot();
        keys = buildIntervalKeys(root, interval);
        attempts++;
    } while (!keys && attempts < 100);

    // Fallback to C-Dur grosse Terz
    if (!keys) {
        root = QUINTENZIRKEL_ROOTS[0];
        interval = PRACTICE_CHALLENGES.find(c => c.name === 'Große Terz')!;
        keys = ['c/4', 'e/4'];
    }

    return {
        intervalName: interval.name,
        intervalSemitones: interval.semitones,
        intervalRough: interval.rough,
        correctKeys: keys,
    };
};

export const checkIntervalBuildAnswer = (userKeys: string[], correctKeys: string[]): boolean => {
    if (userKeys.length !== correctKeys.length) return false;
    const sortedUser = [...userKeys].sort();
    const sortedCorrect = [...correctKeys].sort();
    return sortedUser.every((key, i) => key === sortedCorrect[i]);
};

export const generateEarTrainingQuestion = (): Question => {
    const isInterval = Math.random() > 0.5;
    if (isInterval) {
        const q = generateIntervalQuestion();
        return { ...q, type: 'ear-training-interval' };
    } else {
        const q = generateTriadQuestion();
        return { ...q, type: 'ear-training-triad' };
    }
};

type OptionType = 'note' | 'interval' | 'triad';

function generateOptions(
    correctAnswer: string,
    type: OptionType,
    useAccidentals: boolean = true,
    withInversion: boolean = false
): string[] {
    let pool: string[] = [];
    if (type === 'note') {
        // Generate a pool of likely German notes around the correct answer or just random ones
        // To be safe and simple, let's generate a bunch of random German notes
        // But we need to match the "style" (octave etc).
        // Simplification: Generate variants of the correct answer (different notes, same octave? different octaves?)

        // Better approach: Generate 10 random notes in valid ranges and convert to German
        for (let i = 0; i < 15; i++) {
            const n = getRandomElement(['c', 'd', 'e', 'f', 'g', 'a', 'b']);
            const a = useAccidentals ? getRandomElement(['', '#', 'b']) : '';
            const o = getRandomInt(2, 6);
            pool.push(toGermanNote(n, a, o));
        }
    } else if (type === 'interval') {
        pool = INTERVALS.map(i => i.label);
    } else if (type === 'triad') {
        // Generate Root-Form combinations as options
        for (let i = 0; i < 30; i++) {
            const r = getRandomElement(QUINTENZIRKEL_ROOTS);
            const t = getRandomElement(TRIADS);
            if (withInversion) {
                const inv = getRandomElement(INVERSIONS as readonly Inversion[]);
                pool.push(`${r.germanName}-${t.label} ${inv}`);
            } else {
                pool.push(`${r.germanName}-${t.label}`);
            }
        }
    }

    // Unique options
    pool = [...new Set(pool)];

    const wrong = pool.filter(o => o !== correctAnswer);
    const shuffledWrong = wrong.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [...shuffledWrong, correctAnswer].sort(() => 0.5 - Math.random());

    return options;
}

export const checkAnswer = (userAnswer: string, correctAnswer: string, inputType: 'piano' | 'choice'): boolean => {
    if (inputType === 'choice') {
        const strictEqual = userAnswer === correctAnswer;
        // Also facilitate simple choice checking if the option text differs but means the same (unlikely for now, but safe)
        return strictEqual;
    }

    // For piano, check MIDI values to allow enharmonic equivalents (e.g. Fb == E)
    try {
        // Tone.Frequency handles "Fb4", "E4", "B#3", "C4" correctly
        const userMidi = Tone.Frequency(userAnswer).toMidi();
        const correctMidi = Tone.Frequency(correctAnswer).toMidi();
        return userMidi === correctMidi;
    } catch (e) {
        console.error("Error comparing notes via Tone.js", e);
        // Fallback to strict string comparison if Tone fails
        return userAnswer === correctAnswer;
    }
};
