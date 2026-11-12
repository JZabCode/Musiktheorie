import { describe, it, expect } from 'vitest';
import {
    MAJOR_KEYS,
    MINOR_KEYS,
    getKey,
    keyName,
    germanNoteName,
    scaleNotes,
    scaleVexKeys,
    triadVexKeys,
    diatonicChords,
    vexKeySignatureSpec,
} from './circleOfFifths.js';

describe('Tonarten im Quintenzirkel', () => {
    it('benennt alle Dur-Tonarten korrekt', () => {
        expect(MAJOR_KEYS.map(keyName)).toEqual([
            'C-Dur', 'G-Dur', 'D-Dur', 'A-Dur', 'E-Dur', 'H-Dur', 'Fis-Dur', 'Ges-Dur',
            'Des-Dur', 'As-Dur', 'Es-Dur', 'B-Dur', 'F-Dur',
        ]);
    });

    it('benennt alle Moll-Tonarten korrekt', () => {
        expect(MINOR_KEYS.map(keyName)).toEqual([
            'a-Moll', 'e-Moll', 'h-Moll', 'fis-Moll', 'cis-Moll', 'gis-Moll', 'dis-Moll', 'es-Moll',
            'b-Moll', 'f-Moll', 'c-Moll', 'g-Moll', 'd-Moll',
        ]);
    });

    it('legt Fis-Dur und Ges-Dur auf dieselbe Position', () => {
        expect(getKey('major', 6).position).toBe(6);
        expect(getKey('major', -6).position).toBe(6);
        expect(getKey('major', -1).position).toBe(11);
    });

    it('liefert VexFlow-Tonartangaben', () => {
        expect(vexKeySignatureSpec(0)).toBe('C');
        expect(vexKeySignatureSpec(6)).toBe('F#');
        expect(vexKeySignatureSpec(-6)).toBe('Gb');
        expect(vexKeySignatureSpec(-2)).toBe('Bb');
    });
});

describe('Tonnamen', () => {
    it('bildet deutsche Sonderfälle', () => {
        expect(germanNoteName({ letter: 6, acc: 0 })).toBe('H');
        expect(germanNoteName({ letter: 6, acc: -1 })).toBe('B');
        expect(germanNoteName({ letter: 2, acc: -1 })).toBe('Es');
        expect(germanNoteName({ letter: 5, acc: -1 })).toBe('As');
        expect(germanNoteName({ letter: 0, acc: -1 })).toBe('Ces');
        expect(germanNoteName({ letter: 2, acc: 1 })).toBe('Eis');
    });
});

describe('Tonleitern', () => {
    it('Fis-Dur enthält eis', () => {
        expect(scaleNotes(getKey('major', 6)).map(germanNoteName)).toEqual(['Fis', 'Gis', 'Ais', 'H', 'Cis', 'Dis', 'Eis']);
    });

    it('Ges-Dur enthält ces', () => {
        expect(scaleNotes(getKey('major', -6)).map(germanNoteName)).toEqual(['Ges', 'As', 'B', 'Ces', 'Des', 'Es', 'F']);
    });

    it('a-Moll ist natürliches Moll', () => {
        expect(scaleVexKeys(getKey('minor', 0))).toEqual(['a/3', 'b/3', 'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4']);
    });

    it('notiert Dreiklänge aufsteigend', () => {
        expect(triadVexKeys(getKey('major', 2), 7)).toEqual(['c#/5', 'e/5', 'g/5']);
    });
});

describe('Diatonische Dreiklänge', () => {
    it('C-Dur: Stufen, Funktionen und Zirkelfelder', () => {
        const chords = diatonicChords(getKey('major', 0));
        expect(chords.map((c) => c.symbol)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'H°']);
        expect(chords.map((c) => c.functionAbbr).slice(0, 6)).toEqual(['T', 'Sp', 'Dp', 'S', 'D', 'Tp']);
        expect(chords[3].circle).toEqual({ ring: 'outer', position: 11 });
        expect(chords[1].circle).toEqual({ ring: 'inner', position: 11 });
        expect(chords[2].circle).toEqual({ ring: 'inner', position: 1 });
        expect(chords[6].circle).toBeNull();
    });

    it('a-Moll: gleiche Akkorde, andere Funktionen', () => {
        const chords = diatonicChords(getKey('minor', 0));
        expect(chords.map((c) => c.symbol)).toEqual(['Am', 'H°', 'C', 'Dm', 'Em', 'F', 'G']);
        expect(chords.map((c) => c.functionAbbr)).toEqual(['t', '–', 'tP', 's', 'd', 'sP', 'dP']);
        expect(chords[0].circle).toEqual({ ring: 'inner', position: 0 });
        expect(chords[6].circle).toEqual({ ring: 'outer', position: 1 });
        expect(chords[1].circle).toBeNull();
    });

    it('Fis-Dur: Dominante Cis-Dur liegt im Des-Feld', () => {
        const chords = diatonicChords(getKey('major', 6));
        expect(chords[4].symbol).toBe('Cis');
        expect(chords[4].circle).toEqual({ ring: 'outer', position: 7 });
    });
});
