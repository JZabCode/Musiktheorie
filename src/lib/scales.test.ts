import { describe, it, expect } from 'vitest';
import { ALL_KEYS, getKey } from './circleOfFifths';
import {
    checkScale,
    defaultTonicDia,
    formatStep,
    noteLabel,
    pickScaleTask,
    scaleFrom,
    stepSizes,
    STEP_PATTERN,
    type ScaleNote,
} from './scales';

const labels = (notes: ScaleNote[]) => notes.map(noteLabel).join(' ');

describe('scaleFrom', () => {
    it('baut C-Dur und a-Moll ohne Vorzeichen', () => {
        expect(labels(scaleFrom(getKey('major', 0), 28))).toBe('c1 d1 e1 f1 g1 a1 h1 c2');
        expect(labels(scaleFrom(getKey('minor', 0), 26))).toBe('a h c1 d1 e1 f1 g1 a1');
    });

    it('setzt die Vorzeichen der Tonart', () => {
        expect(labels(scaleFrom(getKey('major', -3), 30))).toBe('es1 f1 g1 as1 b1 c2 d2 es2');
        expect(labels(scaleFrom(getKey('minor', 6), 29))).toBe('dis1 eis1 fis1 gis1 ais1 h1 cis2 dis2');
    });

    it('hält für jede Tonart den Bauplan ein', () => {
        for (const key of ALL_KEYS) {
            const scale = scaleFrom(key, defaultTonicDia(key, 'treble'));
            expect(stepSizes(scale), key.id).toEqual(STEP_PATTERN[key.mode]);
        }
    });
});

describe('checkScale', () => {
    const dDur = getKey('major', 2);

    it('akzeptiert die richtige Tonleiter in jeder passenden Oktave', () => {
        expect(checkScale(dDur, 'treble', scaleFrom(dDur, 29)).correct).toBe(true);
        expect(checkScale(dDur, 'treble', scaleFrom(dDur, 36)).correct).toBe(true);
        expect(checkScale(dDur, 'bass', scaleFrom(dDur, 22)).correct).toBe(true);
    });

    it('markiert ein fehlendes Vorzeichen als falsch', () => {
        const notes = scaleFrom(dDur, 29).map((n, i) => (i === 2 ? { ...n, acc: 0 } : n)); // f statt fis
        const result = checkScale(dDur, 'treble', notes);
        expect(result.correct).toBe(false);
        expect(result.noteResults[2]).toBe('wrong');
        expect(result.noteResults.filter((r) => r === 'correct')).toHaveLength(7);
    });

    it('akzeptiert 7 Töne (ohne Grundton oben) und 8 Töne', () => {
        const scale = scaleFrom(dDur, 29);
        const seven = checkScale(dDur, 'treble', scale.slice(0, 7));
        expect(seven.correct).toBe(true);
        expect(seven.withoutOctave).toBe(true);

        const eight = checkScale(dDur, 'treble', scale);
        expect(eight.correct).toBe(true);
        expect(eight.withoutOctave).toBe(false);
    });

    it('lehnt 7 Töne mit einem Fehler ab', () => {
        const notes = scaleFrom(dDur, 29).slice(0, 7).map((n, i) => (i === 6 ? { ...n, acc: 0 } : n)); // c statt cis
        expect(checkScale(dDur, 'treble', notes).correct).toBe(false);
    });

    it('verlangt mindestens 7 und höchstens 8 Töne', () => {
        const scale = scaleFrom(dDur, 29);
        const tooShort = checkScale(dDur, 'treble', scale.slice(0, 6));
        expect(tooShort.correct).toBe(false);
        expect(tooShort.missing).toBe(1);

        const tooLong = checkScale(dDur, 'treble', [...scale, { dia: 37, acc: 0 }]);
        expect(tooLong.correct).toBe(false);
        expect(tooLong.extra).toBe(1);
        expect(tooLong.noteResults[8]).toBe('extra');
    });

    it('lehnt enharmonisch gleiche, aber falsch geschriebene Töne ab', () => {
        const fDur = getKey('major', -1);
        const notes = scaleFrom(fDur, 31).map((n, i) => (i === 3 ? { dia: n.dia - 1, acc: 1 } : n)); // ais statt b
        expect(checkScale(fDur, 'treble', notes).noteResults[3]).toBe('wrong');
    });

    it('richtet die Lösung am ersten eingegebenen Ton aus', () => {
        const result = checkScale(dDur, 'treble', [{ dia: 36, acc: 0 }]); // d2
        expect(noteLabel(result.solution[0])).toBe('d2');
    });
});

describe('formatStep', () => {
    it('zeigt Ganz- und Halbtonschritte', () => {
        expect([0, 1, 2, 3, 4].map(formatStep)).toEqual(['0', '½', '1', '1½', '2']);
        expect(formatStep(-2)).toBe('↓');
    });
});

describe('pickScaleTask', () => {
    it('bevorzugt Tonarten mit höchstens 4 Vorzeichen', () => {
        let rare = 0;
        const runs = 4000;
        for (let i = 0; i < runs; i++) {
            if (Math.abs(pickScaleTask('both').key.signature) >= 5) rare++;
        }
        expect(rare / runs).toBeGreaterThan(0.03);
        expect(rare / runs).toBeLessThan(0.13);
    });

    it('wählt nur das gewünschte Tongeschlecht und wiederholt die Tonart nicht direkt', () => {
        for (let i = 0; i < 200; i++) {
            const task = pickScaleTask('minor', 'minor:0');
            expect(task.key.mode).toBe('minor');
            expect(task.key.id).not.toBe('minor:0');
        }
    });
});
