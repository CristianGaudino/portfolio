'use client';

import { useMemo, useState } from 'react';
import worldMap from '@/lib/world-map-paths.json';
import { BUCKET_LIST, TRAVEL, describeCountry, describeLatestVisit, getTravelStats, type TravelCountry } from '@/lib/travel';

const PAD_FRACTION = 0.35; // breathing room around a zoomed country, relative to its own size
const MIN_ZOOM_SIZE = 60; // don't zoom in tighter than this many viewBox units — keeps tiny countries oriented

function toneClass(entry: TravelCountry | undefined, isBucket: boolean): string {
    if (entry) {
        if (entry.home) return 'fill-purple-300';
        return entry.visits.length > 1 ? 'fill-purple-400' : 'fill-purple-600';
    }
    if (isBucket) return 'fill-term-green';
    return 'fill-beige-800';
}

export function WorldMap() {
    const [selected, setSelected] = useState<string | null>(null);
    const [zoomBox, setZoomBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const [showBucket, setShowBucket] = useState(false);
    const byCode = useMemo(() => new Map(TRAVEL.map((c) => [c.code, c] as const)), []);
    const bucketByCode = useMemo(() => new Map(BUCKET_LIST.map((b) => [b.code, b] as const)), []);
    const stats = useMemo(() => getTravelStats(), []);

    // Hovering only ever previews the latest trip; the full history (+ every city across all
    // visits) only reveals once the country is actually clicked/zoomed.
    const describe = (code: string, name: string, detailed: boolean) => {
        const travel = byCode.get(code);
        if (travel) return detailed ? describeCountry(travel) : describeLatestVisit(travel);
        const bucket = bucketByCode.get(code);
        if (showBucket && bucket) return `${bucket.country} · bucket list`;
        return name.toUpperCase();
    };

    // While zoomed in, the status line/legend sticks to the zoomed country — hover is ignored
    // (avoids the line flicking to a neighbouring country that's merely visible in the zoomed frame).
    const activeCode = zoomBox ? selected : hovered;
    const activeGeo = activeCode ? worldMap.countries.find((c) => c.code === activeCode) : undefined;
    const line = activeGeo ? describe(activeGeo.code, activeGeo.name, !!zoomBox) : 'click a country to zoom in';
    const activeTravel = activeCode ? byCode.get(activeCode) : undefined;
    const cities = activeTravel
        ? zoomBox
            ? [...new Set(activeTravel.visits.flatMap((v) => v.cities))] // clicked: every city, all visits
            : [...activeTravel.visits].sort((a, b) => b.year - a.year)[0].cities // hovered: latest trip only
        : [];

    const zoomOut = () => {
        setSelected(null);
        setZoomBox(null);
    };

    const zoomTo = (code: string, el: SVGPathElement) => {
        if (selected === code) {
            zoomOut();
            return;
        }
        const box = el.getBBox();
        const padX = Math.max(box.width * PAD_FRACTION, (MIN_ZOOM_SIZE - box.width) / 2, 4);
        const padY = Math.max(box.height * PAD_FRACTION, (MIN_ZOOM_SIZE - box.height) / 2, 4);
        setSelected(code);
        setZoomBox({ x: box.x - padX, y: box.y - padY, w: box.width + padX * 2, h: box.height + padY * 2 });
    };

    const viewBox = zoomBox
        ? `${zoomBox.x} ${zoomBox.y} ${zoomBox.w} ${zoomBox.h}`
        : `0 0 ${worldMap.width} ${worldMap.height}`;
    const strokeWidth = zoomBox ? Math.max(0.06, 0.5 * (zoomBox.w / worldMap.width)) : 0.5;

    return (
        <div className="flex h-full flex-col gap-2 bg-beige-900 p-3">
            <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-beige-700 bg-black">
                <svg
                    viewBox={viewBox}
                    className="h-full w-full transition-[viewBox] duration-300 ease-out"
                >
                    {worldMap.countries.map((c) => {
                        const entry = byCode.get(c.code);
                        const isBucket = showBucket && bucketByCode.has(c.code) && !entry;
                        return (
                            <path
                                key={c.code}
                                data-code={c.code}
                                d={c.d}
                                fillRule="evenodd"
                                className={`${toneClass(entry, isBucket)} stroke-beige-600 hover:brightness-150 ${
                                    selected === c.code ? 'brightness-150' : ''
                                }`}
                                style={{ strokeWidth, cursor: 'pointer' }}
                                onClick={(e) => zoomTo(c.code, e.currentTarget)}
                                onMouseEnter={() => !zoomBox && setHovered(c.code)}
                                onMouseLeave={() => !zoomBox && setHovered(null)}
                            >
                                <title>{describe(c.code, c.name, false)}</title>
                            </path>
                        );
                    })}
                </svg>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 flex-1 items-baseline gap-2 truncate">
                    {zoomBox && (
                        <button
                            type="button"
                            onClick={zoomOut}
                            className="shrink-0 text-beige-500 transition-colors hover:text-beige-300"
                            aria-label="Back to world map"
                        >
                            ‹ world
                        </button>
                    )}
                    <span className="min-w-0 truncate">
                        <span className="select-none text-beige-500">&gt; </span>
                        <span className="text-purple-300">{line}</span>
                    </span>
                </span>

                <button
                    type="button"
                    onClick={() => setShowBucket((v) => !v)}
                    aria-pressed={showBucket}
                    className={`shrink-0 rounded border px-2 py-0.5 text-[0.7rem] transition-colors ${
                        showBucket
                            ? 'border-term-green text-term-green'
                            : 'border-beige-600 text-beige-500 hover:text-beige-300'
                    }`}
                >
                    bucket list ({BUCKET_LIST.length})
                </button>

                <span className="shrink-0 text-xs text-beige-500">
                    countries: {stats.countries} · cities: {stats.cities}
                </span>
            </div>

            {cities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {cities.map((city) => (
                        <span
                            key={city}
                            className="rounded border border-purple-700 bg-purple-900/40 px-1.5 py-0.5 text-xs text-purple-300"
                        >
                            {city}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
