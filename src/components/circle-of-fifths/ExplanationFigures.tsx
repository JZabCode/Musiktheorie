import React, { useId } from 'react';
import StaffSvg, { staffHeaderWidth } from './StaffSvg';
import type { StaffNote } from './StaffSvg';
import {
    diatonicChords,
    germanNoteName,
    getKey,
    keyName,
    keyShortName,
    scaleNotes,
    signatureNotes,
} from '../../lib/circleOfFifths';
import type { KeyDef } from '../../lib/circleOfFifths';
import { chordLabel } from './KeyNotation';
import type { ChordLabelMode } from './KeyNotation';

const ACCENT = '#7c3aed';
const ACCENT_LIGHT = '#ede9fe';
const EMERALD = '#059669';
const AMBER = '#d97706';
const SLATE = '#475569';
const FONT = { fontFamily: 'ui-sans-serif, system-ui, sans-serif' };

const Figure: React.FC<{ caption?: string; children: React.ReactNode }> = ({ caption, children }) => (
    <figure className="my-4 bg-slate-50 rounded-xl border border-slate-200 p-3">
        {children}
        {caption && <figcaption className="text-xs text-slate-500 text-center mt-2">{caption}</figcaption>}
    </figure>
);

function Arrowhead({ id, color }: { id: string; color: string }) {
    return (
        <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
    );
}

// --- Aufbau: Quinten auf dem Notensystem ---

export const FifthStepsFigure: React.FC = () => {
    const uid = useId().replace(/:/g, '');
    const space = 10;
    const staffX = 20;
    const staffY = 70;
    const notes: (StaffNote & { name: string })[] = [
        { step: -2, x: 80, name: 'c1' },
        { step: 2, x: 170, name: 'g1' },
        { step: 6, x: 260, name: 'd2' },
        { step: 10, x: 350, name: 'a2' },
    ];
    const stepY = (s: number) => staffY + 4 * space - (s * space) / 2;
    return (
        <Figure caption="Jeder Schritt ist eine reine Quinte: 5 Tonbuchstaben (z. B. c–d–e–f–g) bzw. 7 Halbtonschritte.">
            <svg viewBox="0 0 440 175" className="w-full max-w-md mx-auto block" style={FONT}>
                <defs><Arrowhead id={`a-${uid}`} color={ACCENT} /></defs>
                <StaffSvg x={staffX} y={staffY} space={space} width={400} notes={notes.map((n) => ({ ...n, color: ACCENT }))} />
                {notes.slice(1).map((n, i) => {
                    const prev = notes[i];
                    const x1 = staffX + prev.x + 8;
                    const x2 = staffX + n.x + 6;
                    const y1 = stepY(prev.step) - 12;
                    const y2 = stepY(n.step) - 12;
                    const cy = Math.min(y1, y2) - 30;
                    return (
                        <g key={n.name}>
                            <path d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${cy} ${x2} ${y2}`} fill="none" stroke={ACCENT} strokeWidth={1.5} markerEnd={`url(#a-${uid})`} />
                            <text x={(x1 + x2) / 2} y={cy + 6} textAnchor="middle" fontSize={12} fontWeight={600} fill={ACCENT}>Quinte</text>
                        </g>
                    );
                })}
                {notes.map((n) => (
                    <text key={n.name} x={staffX + n.x + 7} y={168} textAnchor="middle" fontSize={14} fontWeight={600} fill={SLATE}>{n.name}</text>
                ))}
            </svg>
        </Figure>
    );
};

// --- Aufbau: Quintenketten mit Vorzeichen ---

export const FifthsChainFigure: React.FC = () => {
    const uid = useId().replace(/:/g, '');
    const rows = [
        { title: 'Quinten aufwärts (im Uhrzeigersinn): ein ♯ mehr', dir: 1, color: ACCENT, symbol: '♯' },
        { title: 'Quinten abwärts (gegen den Uhrzeigersinn): ein ♭ mehr', dir: -1, color: EMERALD, symbol: '♭' },
    ];
    return (
        <Figure caption="Das neu hinzukommende Vorzeichen steht unter jeder Tonart.">
            <svg viewBox="0 0 720 260" className="w-full block" style={FONT}>
                <defs>
                    {rows.map((r) => <Arrowhead key={r.dir} id={`c-${uid}-${r.dir}`} color={r.color} />)}
                </defs>
                {rows.map((row, ri) => {
                    const y0 = 10 + ri * 128;
                    return (
                        <g key={row.dir}>
                            <text x={14} y={y0 + 12} fontSize={14} fontWeight={700} fill={row.color}>{row.title}</text>
                            {Array.from({ length: 7 }, (_, i) => {
                                const sig = row.dir * i;
                                const key = getKey('major', sig);
                                const x = 14 + i * 102;
                                const added = i > 0 ? germanNoteName(signatureNotes(sig)[i - 1]).toLowerCase() : null;
                                return (
                                    <g key={i}>
                                        <rect x={x} y={y0 + 24} width={66} height={40} rx={8} fill={i === 0 ? '#ffffff' : ACCENT_LIGHT} stroke={row.color} strokeWidth={1.5} />
                                        <text x={x + 33} y={y0 + 44} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} fill="#1e293b">
                                            {keyShortName(key)}
                                        </text>
                                        <text x={x + 33} y={y0 + 82} textAnchor="middle" fontSize={13} fontWeight={600} fill={SLATE}>
                                            {i === 0 ? '0' : `${i} ${row.symbol}`}
                                        </text>
                                        {added && (
                                            <text x={x + 33} y={y0 + 100} textAnchor="middle" fontSize={13} fontWeight={700} fill={row.color}>
                                                + {added}
                                            </text>
                                        )}
                                        {i < 6 && (
                                            <line x1={x + 68} y1={y0 + 44} x2={x + 100} y2={y0 + 44} stroke={row.color} strokeWidth={2} markerEnd={`url(#c-${uid}-${row.dir})`} />
                                        )}
                                    </g>
                                );
                            })}
                        </g>
                    );
                })}
            </svg>
        </Figure>
    );
};

// --- Funktion: Tonvorrat verwandter Tonarten ---

export const ScaleCompareFigure: React.FC<{ keys: KeyDef[]; reference: KeyDef }> = ({ keys, reference }) => {
    const refNotes = scaleNotes(reference);
    const cell = 62;
    const labelW = 96;
    const resultX = labelW + cell * 7 + 8;
    return (
        <Figure caption="Die Töne jeder Tonleiter stehen ab c geordnet in einer Zeile. Grün: dieser Ton ist anders als in C-Dur.">
            <svg viewBox={`0 0 ${resultX + 150} ${keys.length * 44 + 10}`} className="w-full max-w-2xl mx-auto block" style={FONT}>
                {keys.map((key, ri) => {
                    const y = 6 + ri * 44;
                    const notes = [...scaleNotes(key)].sort((a, b) => a.letter - b.letter);
                    const isRef = key.id === reference.id;
                    const differsCount = notes.filter((n) => n.acc !== refNotes.find((r) => r.letter === n.letter)!.acc).length;
                    const result = isRef
                        ? 'Ausgangstonart'
                        : differsCount === 0
                          ? 'alle Töne gleich'
                          : `${differsCount} Ton anders`;
                    return (
                        <g key={key.id}>
                            <text x={labelW - 12} y={y + 18} textAnchor="end" dominantBaseline="central" fontSize={14} fontWeight={700} fill={isRef ? ACCENT : '#1e293b'}>
                                {keyName(key)}
                            </text>
                            {notes.map((n, i) => {
                                const differs = n.acc !== refNotes.find((r) => r.letter === n.letter)!.acc;
                                return (
                                    <g key={i}>
                                        <rect x={labelW + i * cell} y={y} width={cell - 6} height={36} rx={6} fill={differs ? EMERALD : isRef ? ACCENT_LIGHT : '#ffffff'} stroke="#cbd5e1" />
                                        <text x={labelW + i * cell + (cell - 6) / 2} y={y + 18} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={600} fill={differs ? '#ffffff' : '#1e293b'}>
                                            {germanNoteName(n).toLowerCase()}
                                        </text>
                                    </g>
                                );
                            })}
                            <text x={resultX} y={y + 18} dominantBaseline="central" fontSize={13} fontWeight={700} fill={isRef ? ACCENT : differsCount === 0 ? AMBER : EMERALD}>
                                {isRef ? '' : '→ '}{result}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </Figure>
    );
};

// --- Nutzen: Be-Tonarten – das neue ♭ ist der nächste Grundton ---

export const FlatChainFigure: React.FC = () => {
    const uid = useId().replace(/:/g, '');
    const space = 8;
    const panel = 140;
    const staffY = 62;
    const count = 5;
    return (
        <Figure caption="Das neu hinzugekommene ♭ (orange) ist der Grundton der nächsten Tonart im Quintenzirkel.">
            <svg viewBox={`0 0 ${panel * count + 10} 145`} className="w-full block" style={FONT}>
                <defs><Arrowhead id={`f-${uid}`} color={AMBER} /></defs>
                {Array.from({ length: count }, (_, i) => {
                    const sig = -(i + 1);
                    const key = getKey('major', sig);
                    const x = 5 + i * panel;
                    const added = germanNoteName(signatureNotes(sig)[i]).toLowerCase();
                    return (
                        <g key={sig}>
                            <rect x={x + 10} y={8} width={110} height={36} rx={8} fill={ACCENT_LIGHT} stroke={ACCENT} strokeWidth={1.5} />
                            <text x={x + 65} y={26} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} fill="#1e293b">
                                {keyName(key)}
                            </text>
                            <StaffSvg
                                x={x + 10}
                                y={staffY}
                                space={space}
                                width={110}
                                signature={sig}
                                highlightAccidentals={[i]}
                                highlightColor={AMBER}
                            />
                            <text x={x + 65} y={132} textAnchor="middle" fontSize={14} fill={SLATE}>
                                neu: <tspan fontWeight={800} fill={AMBER}>{added}</tspan>
                            </text>
                            {i < count - 1 && (
                                <path
                                    d={`M ${x + 100} 128 H ${x + 130} V 26 H ${x + panel + 8}`}
                                    fill="none"
                                    stroke={AMBER}
                                    strokeWidth={1.8}
                                    strokeDasharray="4 3"
                                    markerEnd={`url(#f-${uid})`}
                                />
                            )}
                        </g>
                    );
                })}
            </svg>
        </Figure>
    );
};

// --- Nutzen: Regeln zum Ablesen ---

interface RuleFigureProps {
    signature: number;
    highlightAccidental?: number;
    from: { step: number; name: string };
    to?: { step: number; name: string };
    arrowLabel?: string;
    result: string;
    caption?: string;
}

export const RuleFigure: React.FC<RuleFigureProps> = ({ signature, highlightAccidental, from, to, arrowLabel, result, caption }) => {
    const uid = useId().replace(/:/g, '');
    const space = 10;
    const staffX = 16;
    const staffY = 50;
    const header = staffHeaderWidth(signature, space);
    const x1 = header + 40;
    const x2 = header + 150;
    const stepY = (s: number) => staffY + 4 * space - (s * space) / 2;
    const width = header + (to ? 200 : 90);
    return (
        <Figure caption={caption}>
            <svg viewBox="0 0 520 140" className="w-full max-w-lg mx-auto block" style={FONT}>
                <defs><Arrowhead id={`r-${uid}`} color={AMBER} /></defs>
                <StaffSvg
                    x={staffX}
                    y={staffY}
                    space={space}
                    width={width}
                    signature={signature}
                    highlightAccidentals={highlightAccidental !== undefined ? [highlightAccidental] : []}
                    highlightColor={AMBER}
                    notes={[
                        { step: from.step, x: x1, color: AMBER },
                        ...(to ? [{ step: to.step, x: x2, color: ACCENT }] : []),
                    ]}
                />
                {to && (
                <>
                <path
                    d={`M ${staffX + x1 + 22} ${stepY(from.step) - 6} Q ${staffX + (x1 + x2) / 2 + 8} ${Math.min(stepY(from.step), stepY(to.step)) - 38} ${staffX + x2 - 4} ${stepY(to.step) - 8}`}
                    fill="none"
                    stroke={AMBER}
                    strokeWidth={1.8}
                    markerEnd={`url(#r-${uid})`}
                />
                <text x={staffX + (x1 + x2) / 2 + 8} y={Math.min(stepY(from.step), stepY(to.step)) - 30} textAnchor="middle" fontSize={13} fontWeight={700} fill={AMBER}>
                    {arrowLabel}
                </text>
                <text x={staffX + x2 + 8} y={130} textAnchor="middle" fontSize={15} fontWeight={700} fill={ACCENT}>{to.name}</text>
                </>
                )}
                <text x={staffX + x1 + 8} y={130} textAnchor="middle" fontSize={15} fontWeight={700} fill={AMBER}>{from.name}</text>
                <text x={staffX + width + 16} y={stepY(4)} dominantBaseline="central" fontSize={20} fontWeight={800} fill={ACCENT}>
                    → {result}
                </text>
            </svg>
        </Figure>
    );
};

// --- Nutzen: Dreiklänge auf allen Stufen ---

export const ScaleTriadsFigure: React.FC = () => {
    const key = getKey('major', 0);
    const chords = diatonicChords(key);
    const space = 9;
    const qualityLabel = { major: 'Dur', minor: 'Moll', diminished: 'verm.', augmented: 'überm.' } as const;
    return (
        <Figure caption="Leitereigene Dreiklänge in C-Dur: Terzen aus den Tönen der Tonleiter übereinandergeschichtet.">
            <svg viewBox="0 0 640 200" className="w-full block" style={FONT}>
                <StaffSvg
                    x={10}
                    y={40}
                    space={space}
                    width={620}
                    notes={chords.flatMap((c, i) =>
                        [0, 2, 4].map((o) => ({ step: -2 + i + o, x: 70 + i * 80, color: c.circle ? '#1e293b' : '#94a3b8' })),
                    )}
                />
                {chords.map((c, i) => (
                    <g key={c.degree}>
                        <text x={10 + 70 + i * 80 + 7} y={150} textAnchor="middle" fontSize={16} fontWeight={800} fill={c.circle ? ACCENT : '#94a3b8'}>{c.roman}</text>
                        <text x={10 + 70 + i * 80 + 7} y={170} textAnchor="middle" fontSize={13} fontWeight={600} fill={c.circle ? '#1e293b' : '#94a3b8'}>{c.symbol}</text>
                        <text x={10 + 70 + i * 80 + 7} y={188} textAnchor="middle" fontSize={11} fill={c.circle ? SLATE : '#94a3b8'}>{qualityLabel[c.quality]}</text>
                    </g>
                ))}
            </svg>
        </Figure>
    );
};

// --- Nutzen: Der Sechserblock im Zirkel ---

const BlockDiagram: React.FC<{ keyDef: KeyDef; mode: ChordLabelMode; x: number; title: string }> = ({ keyDef, mode, x, title }) => {
    const chords = diatonicChords(keyDef);
    const cellW = 76;
    const cellH = 58;
    const rows: ('outer' | 'inner')[] = ['outer', 'inner'];
    return (
        <g transform={`translate(${x} 0)`}>
            <text x={cellW * 1.5 + 2} y={18} textAnchor="middle" fontSize={14} fontWeight={700} fill="#1e293b">{title}</text>
            {rows.map((ring, ri) =>
                [-1, 0, 1].map((offset, ci) => {
                    const pos = (keyDef.position + offset + 12) % 12;
                    const chord = chords.find((c) => c.circle?.ring === ring && c.circle.position === pos)!;
                    const isTonic = chord.degree === 1;
                    const cx = ci * (cellW + 4);
                    const cy = 30 + ri * (cellH + 4);
                    const name = germanNoteName(chord.notes[0]);
                    return (
                        <g key={`${ring}-${offset}`}>
                            <rect x={cx} y={cy} width={cellW} height={cellH} rx={8} fill={isTonic ? ACCENT : ring === 'outer' ? '#ddd6fe' : '#ede9fe'} stroke={ACCENT} strokeWidth={1} />
                            <text x={cx + cellW / 2} y={cy + 20} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill={isTonic ? '#ffffff' : ACCENT}>
                                {chordLabel(chord, mode)}
                            </text>
                            <text x={cx + cellW / 2} y={cy + 41} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={600} fill={isTonic ? '#ffffff' : '#1e293b'}>
                                {ring === 'outer' ? name : name.toLowerCase()}
                            </text>
                        </g>
                    );
                }),
            )}
            <text x={-8} y={30 + cellH / 2} textAnchor="end" dominantBaseline="central" fontSize={11} fill={SLATE}>außen</text>
            <text x={-8} y={30 + cellH * 1.5 + 4} textAnchor="end" dominantBaseline="central" fontSize={11} fill={SLATE}>innen</text>
        </g>
    );
};

export const BlockFigure: React.FC<{ mode: 'major' | 'minor'; caption: string }> = ({ mode, caption }) => {
    const key = getKey(mode, 0);
    return (
        <Figure caption={caption}>
            <svg viewBox="0 0 590 160" className="w-full max-w-2xl mx-auto block" style={FONT}>
                <BlockDiagram keyDef={key} mode="degree" x={46} title={`${keyName(key)}: Stufen`} />
                <BlockDiagram keyDef={key} mode="function" x={346} title={`${keyName(key)}: Funktionen`} />
            </svg>
        </Figure>
    );
};
