// Music theory types

export type Clef = 'treble' | 'bass';
export type QuestionType = 'note' | 'interval' | 'triad' | 'ear-training-interval' | 'ear-training-triad';

export interface Question {
    type: QuestionType;
    question: {
        keys: string[];
        clef: Clef;
    };
    answer: string;
    technicalAnswer?: string; // Scientific pitch for logic/audio (e.g. "C4")
    options: string[];
}
