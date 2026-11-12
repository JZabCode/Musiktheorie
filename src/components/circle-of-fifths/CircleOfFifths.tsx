import React, { useId } from 'react';
import StaffSvg, { staffHeaderWidth } from './StaffSvg';
import {
    MAJOR_KEYS,
    MINOR_KEYS,
    SIGNATURES_BY_POSITION,
    keyShortName,
} from '../../lib/circleOfFifths';
import type { CircleRing, KeyDef } from '../../lib/circleOfFifths';

export type HighlightVariant = 'tonic' | 'diatonic' | 'fifth' | 'parallel' | 'muted';

export interface FieldHighlight {
    ring: CircleRing;
    position: number;
    /** Nur für das geteilte Feld unten (Fis/Ges bzw. dis/es) */
    half?: 'sharp' | 'flat';
    variant: HighlightVariant;
    badge?: string;
    /** Abweichende Schreibweise, z. B. „Cis“ im Des-Feld */
    altName?: string;
    /** Zusätzliche Umrandung, z. B. für den gerade gespielten Akkord */
    active?: boolean;
}

interface CircleOfFifthsProps {
    highlights?: FieldHighlight[];
    onSelectKey?: (key: KeyDef) => void;
    showSignatures?: boolean;
    showDirectionArrows?: boolean;
    centerTitle?: string;
    centerSubtitle?: string;
    className?: string;
}

// Geometrie
const R_CENTER = 72;
const R_INNER = 142;
const R_OUTER = 215;
const R_STAFF = 290;
const STAFF_SPACE = 7;

const VARIANT_STYLE: Record<HighlightVariant, { fill: string; text: string; badgeFill: string; badgeText: string }> = {
    tonic: { fill: '#7c3aed', text: '#ffffff', badgeFill: '#ffffff', badgeText: '#6d28d9' },
    diatonic: { fill: '#ddd6fe', text: '#4c1d95', badgeFill: '#7c3aed', badgeText: '#ffffff' },
    fifth: { fill: '#a7f3d0', text: '#064e3b', badgeFill: '#059669', badgeText: '#ffffff' },
    parallel: { fill: '#fde68a', text: '#78350f', badgeFill: '#d97706', badgeText: '#ffffff' },
    muted: { fill: '#e2e8f0', text: '#475569', badgeFill: '#64748b', badgeText: '#ffffff' },
};

const rad = (deg: number) => (deg * Math.PI) / 180;
const polar = (r: number, deg: number): [number, number] => [r * Math.sin(rad(deg)), -r * Math.cos(rad(deg))];

function sectorPath(r0: number, r1: number, a0: number, a1: number): string {
    const [x0, y0] = polar(r1, a0);
    const [x1, y1] = polar(r1, a1);
    const [x2, y2] = polar(r0, a1);
    const [x3, y3] = polar(r0, a0);
    return `M ${x0} ${y0} A ${r1} ${r1} 0 0 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 0 0 ${x3} ${y3} Z`;
}

function arcPath(r: number, a0: number, a1: number): string {
    const [x0, y0] = polar(r, a0);
    const [x1, y1] = polar(r, a1);
    const sweep = a1 > a0 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 0 ${sweep} ${x1} ${y1}`;
}

interface Field {
    key: KeyDef;
    ring: CircleRing;
    a0: number;
    a1: number;
    half?: 'sharp' | 'flat';
}

function buildFields(): Field[] {
    const fields: Field[] = [];
    (['outer', 'inner'] as CircleRing[]).forEach((ring) => {
        const keys = ring === 'outer' ? MAJOR_KEYS : MINOR_KEYS;
        for (let p = 0; p < 12; p++) {
            const center = p * 30;
            const atPos = keys.filter((k) => k.position === p);
            if (atPos.length === 1) {
                fields.push({ key: atPos[0], ring, a0: center - 15, a1: center + 15 });
            } else {
                // Kreuz-Tonart auf der rechten Hälfte (zur Kreuz-Seite hin), Be-Tonart links
                const sharp = atPos.find((k) => k.signature > 0)!;
                const flat = atPos.find((k) => k.signature < 0)!;
                fields.push({ key: sharp, ring, a0: center - 15, a1: center, half: 'sharp' });
                fields.push({ key: flat, ring, a0: center, a1: center + 15, half: 'flat' });
            }
        }
    });
    return fields;
}

const FIELDS = buildFields();

const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({
    highlights = [],
    onSelectKey,
    showSignatures = true,
    showDirectionArrows = false,
    centerTitle,
    centerSubtitle,
    className,
}) => {
    const uid = useId().replace(/:/g, '');
    const extent = showSignatures ? 345 : R_OUTER + 8;

    const findHighlight = (f: Field) =>
        highlights.find(
            (h) => h.ring === f.ring && h.position === f.key.position && (!f.half || !h.half || h.half === f.half),
        );

    return (
        <svg
            viewBox={`${-extent} ${-extent} ${extent * 2} ${extent * 2}`}
            className={className}
            role="img"
            aria-label="Quintenzirkel"
            style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
        >
            <defs>
                <marker id={`arrow-${uid}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
            </defs>

            {/* Felder */}
            {FIELDS.map((f) => {
                const h = findHighlight(f);
                const style = h ? VARIANT_STYLE[h.variant] : null;
                const [r0, r1] = f.ring === 'outer' ? [R_INNER, R_OUTER] : [R_CENTER, R_INNER];
                const baseFill = f.ring === 'outer' ? '#ffffff' : '#f1f5f9';
                return (
                    <path
                        key={`${f.ring}-${f.key.id}`}
                        d={sectorPath(r0, r1, f.a0, f.a1)}
                        fill={style?.fill ?? baseFill}
                        stroke="#94a3b8"
                        strokeWidth={1}
                        className={onSelectKey ? 'cursor-pointer transition-opacity hover:opacity-80' : undefined}
                        onClick={onSelectKey ? () => onSelectKey(f.key) : undefined}
                    >
                        <title>{f.key.mode === 'major' ? `${keyShortName(f.key)}-Dur` : `${keyShortName(f.key)}-Moll`}</title>
                    </path>
                );
            })}

            {/* Umrandung aktiver Felder (über den Feldern, damit nicht verdeckt) */}
            {FIELDS.map((f) => {
                const h = findHighlight(f);
                if (!h?.active) return null;
                const [r0, r1] = f.ring === 'outer' ? [R_INNER, R_OUTER] : [R_CENTER, R_INNER];
                return (
                    <path
                        key={`active-${f.ring}-${f.key.id}`}
                        d={sectorPath(r0 + 2, r1 - 2, f.a0 + (f.half === 'flat' ? 0.5 : 1), f.a1 - (f.half === 'sharp' ? 0.5 : 1))}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth={4}
                        pointerEvents="none"
                    />
                );
            })}

            {/* Beschriftungen */}
            {FIELDS.map((f) => {
                const h = findHighlight(f);
                const style = h ? VARIANT_STYLE[h.variant] : null;
                const mid = (f.a0 + f.a1) / 2;
                const isOuter = f.ring === 'outer';
                const split = !!f.half;
                const rName = isOuter ? 186 : 116;
                const [nx, ny] = polar(rName, mid);
                const fontSize = isOuter ? (split ? 17 : 22) : split ? 13 : 17;
                const [bx, by] = polar(isOuter ? 157 : 88, mid);
                const [ax, ay] = polar(isOuter ? 205 : 133, mid);
                const badgeWidth = h?.badge ? Math.max(18, h.badge.length * 7 + 8) : 0;
                return (
                    <g key={`label-${f.ring}-${f.key.id}`} pointerEvents="none">
                        <text
                            x={nx}
                            y={ny}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={fontSize}
                            fontWeight={700}
                            fill={style?.text ?? (isOuter ? '#1e293b' : '#475569')}
                        >
                            {keyShortName(f.key)}
                        </text>
                        {h?.altName && (
                            <text x={ax} y={ay} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600} fill={style?.text}>
                                = {h.altName}
                            </text>
                        )}
                        {h?.badge && (
                            <g>
                                <rect
                                    x={bx - badgeWidth / 2}
                                    y={by - 8}
                                    width={badgeWidth}
                                    height={16}
                                    rx={8}
                                    fill={style?.badgeFill}
                                />
                                <text x={bx} y={by} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill={style?.badgeText}>
                                    {h.badge}
                                </text>
                            </g>
                        )}
                    </g>
                );
            })}

            {/* Mitte */}
            <circle r={R_CENTER} fill="#ffffff" stroke="#94a3b8" strokeWidth={1} />
            {showDirectionArrows ? (
                <g>
                    <path d={arcPath(52, 25, 155)} fill="none" stroke="#64748b" strokeWidth={2} markerEnd={`url(#arrow-${uid})`} />
                    <path d={arcPath(52, -25, -155)} fill="none" stroke="#64748b" strokeWidth={2} markerEnd={`url(#arrow-${uid})`} />
                    <text x={24} y={0} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={700} fill="#7c3aed">♯</text>
                    <text x={-24} y={0} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={700} fill="#7c3aed">♭</text>
                </g>
            ) : (
                <g pointerEvents="none">
                    <text x={0} y={centerSubtitle ? -8 : 0} textAnchor="middle" dominantBaseline="central" fontSize={centerTitle && centerTitle.length > 8 ? 15 : 18} fontWeight={700} fill="#1e293b">
                        {centerTitle ?? 'Quinten-'}
                    </text>
                    <text x={0} y={centerTitle ? 12 : 14} textAnchor="middle" dominantBaseline="central" fontSize={centerTitle ? 11 : 18} fontWeight={centerTitle ? 500 : 700} fill={centerTitle ? '#64748b' : '#1e293b'}>
                        {centerTitle ? centerSubtitle : 'zirkel'}
                    </text>
                </g>
            )}

            {/* Generalvorzeichen */}
            {showSignatures &&
                SIGNATURES_BY_POSITION.map((sigs, p) =>
                    sigs.map((sig) => {
                        const w = Math.max(40, staffHeaderWidth(sig, STAFF_SPACE));
                        let [cx, cy] = polar(R_STAFF, p * 30);
                        if (sigs.length > 1) {
                            cx = sig > 0 ? 50 : -50;
                            cy = R_STAFF + 14;
                        }
                        return (
                            <StaffSvg
                                key={`${p}-${sig}`}
                                x={cx - w / 2}
                                y={cy - STAFF_SPACE * 2}
                                space={STAFF_SPACE}
                                width={w}
                                signature={sig}
                            />
                        );
                    }),
                )}
        </svg>
    );
};

export default CircleOfFifths;
