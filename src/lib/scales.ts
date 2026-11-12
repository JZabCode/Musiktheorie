// Musiktheorie-Logik für das Tonleiter-Modul: Aufgabenauswahl, Lösung und Prüfung
// von Dur- und (natürlichen) Moll-Tonleitern.

import type { Clef } from '../types';
import { ALL_KEYS, keyName, signatureAccidental, type KeyDef, type KeyMode } from './circleOfFifths';
import { toGermanNote } from './music';

/**
 * Eine notierte Note: diatonische Position plus Vorzeichen.
 * `dia` = Oktave · 7 + Buchstabe (c = 0 … h = 6), z. B. c1 (C4) = 28, e1 (E4) = 30.
 */
export interface ScaleNote {
    dia: number;
    acc: number; // -1 = ♭, 0 = ohne, +1 = ♯
}

export type NoteResult = 'correct' | 'wrong' | 'extra';

export interface ScaleCheckResult {
    correct: boolean;
    /** Bewertung jeder eingegebenen Note (Reihenfolge wie eingegeben). */
    noteResults: NoteResult[];
    /** Wie viele Töne bis zur Mindestzahl (7) fehlen (0, wenn genug). */
    missing: number;
    /** Wie viele Töne über 8 hinaus eingegeben wurden. */
    extra: number;
    /** Richtig, aber ohne den Grundton oben (7 statt 8 Töne). */
    withoutOctave: boolean;
    /** Die richtige Tonleiter (8 Töne) in der Oktave, die zur Eingabe passt. */
    solution: ScaleNote[];
}

/** Vollständige Tonleiter inkl. Grundton oben. */
export const SCALE_LENGTH = 8;
/** Ohne den Grundton oben (7 verschiedene Töne) gilt die Tonleiter ebenfalls als richtig. */
export const MIN_SCALE_LENGTH = 7;

/** Ganz- (2) und Halbtonschritte (1) zwischen den 8 Tönen. */
export const STEP_PATTERN: Record<KeyMode, number[]> = {
    major: [2, 2, 1, 2, 2, 2, 1], // Halbtöne zwischen 3–4 und 7–8
    minor: [2, 1, 2, 2, 1, 2, 2], // Halbtöne zwischen 2–3 und 5–6 (natürliches Moll)
};

/** Positionen (0-basiert, Schritt i = zwischen Ton i+1 und i+2) der Halbtonschritte. */
export function halfStepIndices(mode: KeyMode): number[] {
    return STEP_PATTERN[mode].flatMap((s, i) => (s === 1 ? [i] : []));
}

const NATURAL_SEMITONES = [0, 2, 4, 5, 7, 9, 11];
const LETTERS_EN = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Diatonische Position der untersten Notenlinie: e1 (Violin) bzw. G (Bass). */
export const BOTTOM_LINE_DIA: Record<Clef, number> = { treble: 30, bass: 18 };

/** Erlaubter Bereich (in Schritten ab unterster Linie) für die Eingabe. */
export const STEP_RANGE = { min: -5, max: 13 };

export function semitoneOf(note: ScaleNote): number {
    const octave = Math.floor(note.dia / 7);
    return 12 * (octave + 1) + NATURAL_SEMITONES[mod(note.dia, 7)] + note.acc;
}

/** Deutscher Notenname mit Oktavbezeichnung wie im Notenlesen-Modul (z. B. fis1, B, es). */
export function noteLabel(note: ScaleNote): string {
    const acc = note.acc > 0 ? '#' : note.acc < 0 ? 'b' : '';
    return toGermanNote(LETTERS_EN[mod(note.dia, 7)], acc, Math.floor(note.dia / 7));
}

/** Tone.js-Notenname, z. B. "F#4". */
export function toneName(note: ScaleNote): string {
    const acc = note.acc > 0 ? '#' : note.acc < 0 ? 'b' : '';
    return `${LETTERS_EN[mod(note.dia, 7)]}${acc}${Math.floor(note.dia / 7)}`;
}

/** Abstand in Halbtönen zwischen zwei aufeinanderfolgenden Noten. */
export function stepSizes(notes: ScaleNote[]): number[] {
    return notes.slice(1).map((n, i) => semitoneOf(n) - semitoneOf(notes[i]));
}

/** Anzeige eines Abstands in Ganztönen: 2 → „1", 1 → „½", 3 → „1½", 0 → „0". */
export function formatStep(semitones: number): string {
    if (semitones < 0) return '↓';
    const whole = Math.floor(semitones / 2);
    const half = semitones % 2 === 1;
    if (whole === 0) return half ? '½' : '0';
    return `${whole}${half ? '½' : ''}`;
}

/** Die 8 Töne der Tonleiter ab dem Grundton auf Position `tonicDia`. */
export function scaleFrom(key: KeyDef, tonicDia: number): ScaleNote[] {
    return Array.from({ length: SCALE_LENGTH }, (_, i) => {
        const dia = tonicDia + i;
        return { dia, acc: signatureAccidental(key.signature, mod(dia, 7)) };
    });
}

/** Standard-Oktave für die Lösung, damit die Tonleiter gut im System liegt. */
export function defaultTonicDia(key: KeyDef, clef: Clef): number {
    const letter = key.tonic.letter;
    if (clef === 'treble') return (letter >= 5 ? 3 : 4) * 7 + letter; // a/h ab kleiner Oktave
    return (letter >= 3 ? 2 : 3) * 7 + letter; // f, g, a, h ab großer Oktave
}

/** Liegt die ganze Tonleiter ab `tonicDia` im Eingabebereich? */
function fitsRange(tonicDia: number, clef: Clef): boolean {
    const bottom = BOTTOM_LINE_DIA[clef];
    return tonicDia - bottom >= STEP_RANGE.min && tonicDia + SCALE_LENGTH - 1 - bottom <= STEP_RANGE.max;
}

/**
 * Wählt die Oktave der Lösung passend zur Eingabe: der Grundton, der dem ersten
 * eingegebenen Ton am nächsten liegt (bei richtigem Buchstaben also genau dieser).
 */
function solutionTonicDia(key: KeyDef, clef: Clef, first?: ScaleNote): number {
    if (!first) return defaultTonicDia(key, clef);
    const letter = key.tonic.letter;
    const candidates = [-1, 0, 1]
        .map((o) => (Math.floor(first.dia / 7) + o) * 7 + letter)
        .filter((d) => fitsRange(d, clef));
    if (candidates.length === 0) return defaultTonicDia(key, clef);
    return candidates.reduce((best, d) => (Math.abs(d - first.dia) < Math.abs(best - first.dia) ? d : best));
}

/**
 * Prüft eine eingegebene Tonleiter (Töne in Eingabereihenfolge, aufsteigend erwartet).
 * Richtig sind 7 Töne (ohne Grundton oben) oder 8 Töne (mit Grundton oben).
 */
export function checkScale(key: KeyDef, clef: Clef, notes: ScaleNote[]): ScaleCheckResult {
    const solution = scaleFrom(key, solutionTonicDia(key, clef, notes[0]));
    const noteResults: NoteResult[] = notes.map((n, i) => {
        if (i >= SCALE_LENGTH) return 'extra';
        const target = solution[i];
        return n.dia === target.dia && n.acc === target.acc ? 'correct' : 'wrong';
    });
    const missing = Math.max(0, MIN_SCALE_LENGTH - notes.length);
    const extra = Math.max(0, notes.length - SCALE_LENGTH);
    const correct = missing === 0 && extra === 0 && noteResults.every((r) => r === 'correct');
    return { correct, noteResults, missing, extra, withoutOctave: correct && notes.length === MIN_SCALE_LENGTH, solution };
}

// --- Aufgabenauswahl ---

export type ModeSelection = 'major' | 'minor' | 'both';

/**
 * Gewicht einer Tonart: Tonarten mit bis zu 4 Vorzeichen kommen deutlich häufiger
 * vor als solche mit 5 oder 6 Vorzeichen (≈ 7 % aller Aufgaben).
 */
export function keyWeight(key: KeyDef): number {
    return Math.abs(key.signature) <= 4 ? 6 : 1;
}

export interface ScaleTask {
    key: KeyDef;
    name: string; // „Es-Dur“ / „fis-Moll“
}

/** Zufällige Tonleiter-Aufgabe; die vorherige Tonart wird nicht direkt wiederholt. */
export function pickScaleTask(selection: ModeSelection, previousId?: string, random: () => number = Math.random): ScaleTask {
    const modes: KeyMode[] = selection === 'both' ? ['major', 'minor'] : [selection];
    const pool = ALL_KEYS.filter((k) => modes.includes(k.mode) && k.id !== previousId);
    const total = pool.reduce((sum, k) => sum + keyWeight(k), 0);
    let r = random() * total;
    for (const key of pool) {
        r -= keyWeight(key);
        if (r < 0) return { key, name: keyName(key) };
    }
    const key = pool[pool.length - 1];
    return { key, name: keyName(key) };
}
