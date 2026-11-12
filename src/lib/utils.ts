import { toGermanNote } from './music';

/**
 * Formats seconds into a "m:ss" string for timer display.
 */
export function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Converts a MIDI note number to a scientific note string (e.g. 60 → "C4").
 */
export function midiToNote(midiNote: number): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    return `${noteNames[noteIndex]}${octave}`;
}

/**
 * Represents a user's note selection (pitch class only, no octave).
 * Used in interval and triad build modes.
 */
export interface NoteSelection {
    letter: string;     // VexFlow letter: 'c' | 'd' | 'e' | 'f' | 'g' | 'a' | 'b'
    accidental: string; // '' | '#' | 'b'
}

/**
 * Convert a NoteSelection to a German note name display string.
 * e.g. { letter: 'c', accidental: '#' } → "Cis"
 */
export function toGermanLabel(sel: NoteSelection): string {
    const BASE: Record<string, string> = {
        'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F', 'g': 'G', 'a': 'A', 'b': 'H'
    };
    const base = BASE[sel.letter] || sel.letter;

    if (sel.accidental === '#') {
        return base + 'is';
    }
    if (sel.accidental === 'b') {
        if (sel.letter === 'e') return 'Es';
        if (sel.letter === 'a') return 'As';
        if (sel.letter === 'b') return 'B';
        return base + 'es';
    }
    return base;
}

/**
 * Formats a scientific note name (e.g. "C#4") to German notation (e.g. "cis1").
 */
export function getFormattedNoteName(scientificNote: string): string {
    const match = scientificNote.match(/^([A-G])([#b]?)(-?\d+)$/);
    if (!match) return scientificNote;
    const [, note, acc, octave] = match;
    return toGermanNote(note, acc, parseInt(octave));
}
