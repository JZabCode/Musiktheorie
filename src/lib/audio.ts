import * as Tone from 'tone';

type Duration = Tone.Unit.Time;

const SALAMANDER_BASE_URL = 'https://tonejs.github.io/audio/salamander/';

// Subset of the Salamander Grand piano sample set — covers the range used in
// this app (roughly C3–C6) with enough sample points for natural pitch shifting.
const SALAMANDER_URLS: Record<string, string> = {
    A2: 'A2.mp3',
    C3: 'C3.mp3',
    'D#3': 'Ds3.mp3',
    'F#3': 'Fs3.mp3',
    A3: 'A3.mp3',
    C4: 'C4.mp3',
    'D#4': 'Ds4.mp3',
    'F#4': 'Fs4.mp3',
    A4: 'A4.mp3',
    C5: 'C5.mp3',
    'D#5': 'Ds5.mp3',
    'F#5': 'Fs5.mp3',
    A5: 'A5.mp3',
    C6: 'C6.mp3',
};

class AudioEngine {
    // Alle Audio-Nodes werden LAZY erzeugt – ausschließlich aus einem
    // User-Gesture-Handler heraus. Das ist nötig für Safari, das Audio-Nodes,
    // die in einem suspendierten Context entstanden sind, oft nicht hörbar
    // wiedergibt.
    private synth: Tone.PolySynth | null = null;
    private sampler: Tone.Sampler | null = null;
    private samplerReady = false;
    private samplerLoadStarted = false;
    private unlocked = false;

    /**
     * Safari-Unlock: muss synchron innerhalb eines User-Gesture-Handlers
     * laufen. Resumed den AudioContext und spielt einen kurzen stummen
     * Oszillator-Ton ab. Wird nur beim allerersten Aufruf wirklich aktiv.
     */
    private unlockAudio(): void {
        if (this.unlocked) return;
        try {
            const ctx = Tone.getContext().rawContext as AudioContext;
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            // Tone.start() synchron – signalisiert Tone.js, dass der Context aktiv ist
            Tone.start();
            // Stummen Oszillator triggern – Safari verlangt das gelegentlich
            // zusätzlich zur resume()-Call, damit echte Audio-Ausgabe freigegeben wird
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, ctx.currentTime);
            osc.connect(gain).connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.001);
            this.unlocked = true;
        } catch (e) {
            console.warn('AudioContext unlock failed:', e);
        }
    }

    /** Erzeugt den Synth innerhalb der User-Geste (Safari-Anforderung). */
    private ensureSynth(): void {
        if (this.synth) return;
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
        }).toDestination();
    }

    /** Startet das Laden der Sampler-Samples, falls noch nicht geschehen. */
    private ensureSampler(): void {
        if (this.samplerLoadStarted) return;
        this.samplerLoadStarted = true;
        this.sampler = new Tone.Sampler({
            urls: SALAMANDER_URLS,
            baseUrl: SALAMANDER_BASE_URL,
            release: 1,
            onload: () => {
                this.samplerReady = true;
            },
        }).toDestination();
    }

    /**
     * Beibehalten für Aufrufer, die früh den AudioContext freischalten wollen
     * (z. B. aus einem Modul-Mount-Effect). Muss aus einer User-Geste stammen,
     * um Wirkung zu haben.
     */
    init(): Promise<void> {
        this.unlockAudio();
        this.ensureSynth();
        this.ensureSampler();
        return Promise.resolve();
    }

    /** Returns the piano sampler once loaded, otherwise the synth fallback. */
    private instrument(): Tone.Sampler | Tone.PolySynth {
        if (this.samplerReady && this.sampler) return this.sampler;
        return this.synth!;
    }

    playNote(note: string, duration: Duration = '8n'): void {
        this.unlockAudio();
        this.ensureSynth();
        this.ensureSampler();
        this.instrument().triggerAttackRelease(note, duration);
    }

    playChord(notes: string[], duration: Duration = '2n'): void {
        this.unlockAudio();
        this.ensureSynth();
        this.ensureSampler();
        this.instrument().triggerAttackRelease(notes, duration);
    }

    playArpeggio(note1: string, note2: string, delay: number = 0.5): void {
        this.unlockAudio();
        this.ensureSynth();
        this.ensureSampler();
        const inst = this.instrument();
        const now = Tone.now();
        inst.triggerAttackRelease(note1, '4n', now);
        inst.triggerAttackRelease(note2, '4n', now + delay);
    }

    /**
     * Plays a list of notes one after another (for triad arpeggios). Each note
     * sustains long enough to overlap the next, so the full chord is audible
     * by the end.
     */
    playArpeggioChord(
        notes: string[],
        noteDelay: number = 0.4,
        noteDuration: Duration = '2n',
    ): void {
        this.unlockAudio();
        this.ensureSynth();
        this.ensureSampler();
        const inst = this.instrument();
        const now = Tone.now();
        notes.forEach((note, i) => {
            inst.triggerAttackRelease(note, noteDuration, now + i * noteDelay);
        });
    }

    playFeedback(correct: boolean): void {
        this.unlockAudio();
        this.ensureSynth();
        this.ensureSampler();
        const inst = this.instrument();
        if (correct) {
            inst.triggerAttackRelease('C6', '16n');
        } else {
            inst.triggerAttackRelease('C2', '16n');
        }
    }
}

export const audio = new AudioEngine();

/**
 * Converts a VexFlow key (e.g. "c/4", "eb/4", "g#/5") into a Tone.js note
 * string (e.g. "C4", "Eb4", "G#5").
 */
export function vexKeyToToneNote(vexKey: string): string {
    const [pitch, octave] = vexKey.split('/');
    const letter = pitch[0].toUpperCase();
    const accidental = pitch.slice(1); // "", "b", "#", "bb", "##"
    return `${letter}${accidental}${octave}`;
}
