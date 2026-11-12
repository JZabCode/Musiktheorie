import { describe, it, expect } from 'vitest';
import {
    generateNoteQuestion,
    generateIntervalQuestion,
    generateTriadQuestion,
    generateEarTrainingQuestion,
    generateTriadBuildQuestion,
    checkTriadBuildAnswer,
} from './music.js';

describe('generateNoteQuestion', () => {
    it('should return a valid note question object', () => {
        const result = generateNoteQuestion('treble');

        expect(result).toHaveProperty('type', 'note');
        expect(result).toHaveProperty('question');
        expect(result).toHaveProperty('answer');
        expect(result).toHaveProperty('options');
        expect(result.question).toHaveProperty('keys');
        expect(result.question).toHaveProperty('clef', 'treble');
    });

    it('should generate treble clef notes in valid range (3-6)', () => {
        const result = generateNoteQuestion('treble');
        const key = result.question.keys[0];
        const octave = parseInt(key.split('/')[1]);

        expect(octave).toBeGreaterThanOrEqual(3);
        expect(octave).toBeLessThanOrEqual(6);
    });

    it('should generate bass clef notes in valid range (2-4)', () => {
        const result = generateNoteQuestion('bass');
        const key = result.question.keys[0];
        const octave = parseInt(key.split('/')[1]);

        expect(octave).toBeGreaterThanOrEqual(2);
        expect(octave).toBeLessThanOrEqual(4);
    });



    it('should have exactly 4 options including the correct answer', () => {
        const result = generateNoteQuestion('treble');

        expect(result.options).toHaveLength(4);
        expect(result.options).toContain(result.answer);
    });

    it('should not generate accidentals when useAccidentals is false', () => {
        for (let i = 0; i < 50; i++) {
            const result = generateNoteQuestion('treble', false);
            // German accidental suffixes: is (Kreuz), es/s/as (Be). 
            // Standard notes: c, d, e, f, g, a, h/b
            // If strict: c, d, e, f, g, a, h. 
            // "Bes" or "B" (german) usually means Bb. "H" is natural B.
            // Let's check technicalAnswer (C4, D4 etc) which is safer.
            // Technical answer should not have # or b.
            expect(result.technicalAnswer).not.toMatch(/[#b]/);
        }
    });

    it('should restrict notes to custom noteRange when provided', () => {
        const noteRange = { startOctave: 4, endOctave: 6 };
        for (let i = 0; i < 100; i++) {
            const result = generateNoteQuestion('treble', false, noteRange);
            const key = result.question.keys[0];
            const [notePart, octaveStr] = key.split('/');
            const octave = parseInt(octaveStr);

            expect(octave).toBeGreaterThanOrEqual(4);
            expect(octave).toBeLessThanOrEqual(6);

            // At octave 6, only 'c' is allowed
            if (octave === 6) {
                expect(notePart).toBe('c');
            }
        }
    });


});

describe('generateIntervalQuestion', () => {
    it('should return a valid interval question object', () => {
        const result = generateIntervalQuestion();

        expect(result).toHaveProperty('type', 'interval');
        expect(result).toHaveProperty('question');
        expect(result).toHaveProperty('answer');
        expect(result).toHaveProperty('options');
        expect(result.question).toHaveProperty('keys');
        expect(result.question.keys).toHaveLength(2);
    });

    it('should always use C4 as root note', () => {
        for (let i = 0; i < 10; i++) {
            const result = generateIntervalQuestion();
            expect(result.question.keys[0]).toBe('c/4');
        }
    });

    it('should return a valid interval label as answer', () => {
        const validIntervals = [
            'Reine Prime', 'Kleine Sekunde', 'Große Sekunde',
            'Kleine Terz', 'Große Terz', 'Reine Quarte',
            'Übermäßige Quarte / Verm. Quinte', 'Reine Quinte',
            'Kleine Sexte', 'Große Sexte', 'Kleine Septime',
            'Große Septime', 'Reine Oktave'
        ];

        const result = generateIntervalQuestion();
        expect(validIntervals).toContain(result.answer);
    });

    it('should have 4 unique options', () => {
        const result = generateIntervalQuestion();
        const uniqueOptions = [...new Set(result.options)];

        expect(result.options).toHaveLength(4);
        expect(uniqueOptions).toHaveLength(4);
    });
});

describe('generateTriadQuestion', () => {
    it('should return a valid triad question object', () => {
        const result = generateTriadQuestion();

        expect(result).toHaveProperty('type', 'triad');
        expect(result).toHaveProperty('question');
        expect(result).toHaveProperty('answer');
        expect(result).toHaveProperty('options');
        expect(result.question).toHaveProperty('keys');
        expect(result.question.keys).toHaveLength(3);
    });

    it('should return a Root-Form answer (e.g. "C-Dur", "A-Moll")', () => {
        const validRoots = ['C', 'G', 'D', 'A', 'E', 'H', 'Fis', 'F', 'B', 'Es', 'As', 'Des', 'Ges'];
        const validForms = ['Dur', 'Moll', 'Vermindert', 'Übermäßig'];

        for (let i = 0; i < 20; i++) {
            const result = generateTriadQuestion();
            const parts = result.answer.split('-');
            expect(parts).toHaveLength(2);
            expect(validRoots).toContain(parts[0]);
            expect(validForms).toContain(parts[1]);
        }
    });

    it('should have exactly 4 options (all Root-Form combos)', () => {
        const result = generateTriadQuestion();

        expect(result.options).toHaveLength(4);
        expect(result.options).toContain(result.answer);
    });

    it('should not have notes higher than c/6', () => {
        for (let i = 0; i < 50; i++) {
            const result = generateTriadQuestion();
            for (const key of result.question.keys) {
                const [notePart, octaveStr] = key.split('/');
                const octave = parseInt(octaveStr);
                if (octave === 6) {
                    // Only 'c' is allowed at octave 6
                    expect(notePart).toBe('c');
                } else {
                    expect(octave).toBeLessThanOrEqual(5);
                }
            }
        }
    });
});

describe('generateEarTrainingQuestion', () => {
    it('should return either interval or triad type', () => {
        const validTypes = ['ear-training-interval', 'ear-training-triad'];

        for (let i = 0; i < 20; i++) {
            const result = generateEarTrainingQuestion();
            expect(validTypes).toContain(result.type);
        }
    });

    it('should have the same structure as interval or triad questions', () => {
        const result = generateEarTrainingQuestion();

        expect(result).toHaveProperty('question');
        expect(result).toHaveProperty('answer');
        expect(result).toHaveProperty('options');
        expect(result.question).toHaveProperty('keys');
    });
});

describe('generateTriadBuildQuestion', () => {
    it('should return a valid build question with triadName and correctKeys', () => {
        const result = generateTriadBuildQuestion();

        expect(result).toHaveProperty('triadName');
        expect(result).toHaveProperty('correctKeys');
        expect(result.correctKeys).toHaveLength(3);
        expect(result.triadName).toMatch(/.+-.+/); // e.g. "C-Dur"
    });

    it('should return valid Root-Form triad names', () => {
        const validRoots = ['C', 'G', 'D', 'A', 'E', 'H', 'Fis', 'F', 'B', 'Es', 'As', 'Des', 'Ges'];
        const validForms = ['Dur', 'Moll', 'Vermindert', 'Übermäßig'];

        for (let i = 0; i < 20; i++) {
            const result = generateTriadBuildQuestion();
            const parts = result.triadName.split('-');
            expect(parts).toHaveLength(2);
            expect(validRoots).toContain(parts[0]);
            expect(validForms).toContain(parts[1]);
        }
    });

    it('should return VexFlow keys in the correct format (note/octave)', () => {
        for (let i = 0; i < 20; i++) {
            const result = generateTriadBuildQuestion();
            for (const key of result.correctKeys) {
                expect(key).toMatch(/^[a-g][#b]?\/\d$/); // e.g. "c/4", "eb/4", "g#/4"
            }
        }
    });
});

describe('checkTriadBuildAnswer', () => {
    it('should return true for exact match', () => {
        expect(checkTriadBuildAnswer(['c/4', 'e/4', 'g/4'], ['c/4', 'e/4', 'g/4'])).toBe(true);
    });

    it('should return true for match in different order', () => {
        expect(checkTriadBuildAnswer(['g/4', 'c/4', 'e/4'], ['c/4', 'e/4', 'g/4'])).toBe(true);
    });

    it('should return false for wrong notes', () => {
        expect(checkTriadBuildAnswer(['c/4', 'f/4', 'g/4'], ['c/4', 'e/4', 'g/4'])).toBe(false);
    });

    it('should return false for wrong octave', () => {
        expect(checkTriadBuildAnswer(['c/4', 'e/5', 'g/4'], ['c/4', 'e/4', 'g/4'])).toBe(false);
    });

    it('should return false for wrong number of keys', () => {
        expect(checkTriadBuildAnswer(['c/4', 'e/4'], ['c/4', 'e/4', 'g/4'])).toBe(false);
    });
});

