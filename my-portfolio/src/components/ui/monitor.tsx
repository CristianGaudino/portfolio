import React from 'react';

/** A titled group of readout rows. */
export function MonitorSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="w-full">
            <h3 className="mb-1.5 text-[0.62rem] uppercase tracking-[0.25em] text-purple-500">{title}</h3>
            <div className="space-y-1.5">{children}</div>
        </section>
    );
}

/** `label` in a fixed gutter, value flowing beside it. */
export function StatRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-3 text-sm leading-snug">
            <span className="w-24 shrink-0 text-beige-500">{label}</span>
            <span className="min-w-0 flex-1 text-beige-200">{children}</span>
        </div>
    );
}

/** Single horizontal bar, 0–100. */
export function Meter({ value, label, caption }: { value: number; label?: string; caption?: string }) {
    const pct = Math.max(0, Math.min(100, value));
    return (
        <div className="flex items-center gap-2 text-xs">
            {label && <span className="w-24 shrink-0 truncate text-beige-400">{label}</span>}
            <span className="relative h-1.5 flex-1 overflow-hidden rounded-sm bg-purple-900">
                <span
                    className="absolute inset-y-0 left-0 rounded-sm bg-purple-400 glow-soft"
                    style={{ width: `${pct}%` }}
                />
            </span>
            {caption && <span className="w-9 shrink-0 text-right text-beige-500">{caption}</span>}
        </div>
    );
}

export function MeterList({ items }: { items: { name: string; pct: number }[] }) {
    return (
        <div className="space-y-1">
            {items.map((it) => (
                <Meter key={it.name} label={it.name} value={it.pct} caption={`${it.pct}%`} />
            ))}
        </div>
    );
}

/** Compact bar chart for a short numeric series. */
export function Bars({ data, className = '' }: { data: number[]; className?: string }) {
    const max = Math.max(1, ...data);
    return (
        <span className={`flex h-6 items-end gap-0.5 ${className}`} aria-hidden>
            {data.map((v, i) => (
                <span
                    key={i}
                    className="flex-1 rounded-t-[1px] bg-purple-400/80"
                    style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
                    title={`${v}`}
                />
            ))}
        </span>
    );
}

/** SVG line + faint fill for a numeric series. */
export function Sparkline({ data, className = '' }: { data: number[]; className?: string }) {
    const W = 100;
    const H = 24;
    const max = Math.max(1, ...data);
    const step = data.length > 1 ? W / (data.length - 1) : W;
    const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(H - (v / max) * H).toFixed(1)}`);
    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className={`h-6 w-full text-purple-400 ${className}`}
            aria-hidden
        >
            <polygon points={`0,${H} ${pts.join(' ')} ${W},${H}`} fill="currentColor" opacity={0.15} />
            <polyline
                points={pts.join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

export function Skeleton({ className = '' }: { className?: string }) {
    return <span className={`inline-block animate-pulse rounded bg-beige-700/60 ${className}`} />;
}

/** Little animated bars for the "now playing" row. */
export function Equalizer({ playing = true }: { playing?: boolean }) {
    return (
        <span className="inline-flex h-3 items-end gap-[2px]" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
                <span
                    key={i}
                    className={`w-[2px] bg-term-green ${playing ? 'eq-bar' : ''}`}
                    style={playing ? { animationDelay: `${i * 110}ms` } : { height: '3px' }}
                />
            ))}
        </span>
    );
}
