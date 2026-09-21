import worldGeo from './world-map-geo.json';
import { SITE_CONFIG } from './config';

export type TravelVisit = {
    year: number;
    cities: string[];
    note?: string;
};

export type TravelCountry = {
    country: string;
    /** ISO 3166-1 alpha-2 — must match a code in world-map-paths.json / world-map-geo.json */
    code: string;
    visits: TravelVisit[];
    /** where I live — always shown brightest, described as "home base" */
    home?: boolean;
    /** pins this as the `top` destination in `travel` / stats, overriding the most-visited default */
    favorite?: boolean;
};

export type BucketItem = {
    country: string;
    /** ISO 3166-1 alpha-2 */
    code: string;
    note?: string;
};

// Where I want to go next — shown in green on the map behind a toggle (doesn't affect countries/cities stats).
export const BUCKET_LIST: BucketItem[] = [
    { country: 'Japan', code: 'JP' },
    { country: 'Switzerland', code: 'CH' },
    { country: 'China', code: 'CN' },
    { country: 'New Zealand', code: 'NZ' },
];

export const TRAVEL: TravelCountry[] = [
    {
        country: 'Ireland',
        code: 'IE',
        home: true,
        visits: [{ cities: [], year: new Date().getFullYear() }], // describeCountry() ignores this for home entries
    },
    {
        country: 'Czech Republic',
        code: 'CZ',
        visits: [{ year: 2026, cities: ['Prague'] }],
    },
    {
        country: 'Portugal',
        code: 'PT',
        visits: [
            { year: 2019, cities: ['Albufeira', 'Faro'] },
            { year: 2026, cities: ['Madeira'] },
        ],
    },
    {
        country: 'Spain',
        code: 'ES',
        visits: [
            { year: 2005, cities: ['Marbella', 'Malaga'], note: 'numerous trips through the 2000s, year approximate' },
            { year: 2006, cities: ['Ronda'], note: 'year approximate' },
            { year: 2008, cities: ['Lanzarote'], note: 'childhood trip, year approximate' },
            { year: 2026, cities: ['Mallorca'] },
        ],
    },
    {
        country: 'Estonia',
        code: 'EE',
        visits: [{ year: 2026, cities: ['Tallinn'] }],
    },
    {
        country: 'United Kingdom',
        code: 'GB',
        visits: [
            { year: 2013, cities: ['Manchester'] },
            { year: 2026, cities: ['London'] },
        ],
    },
    {
        country: 'Hungary',
        code: 'HU',
        visits: [{ year: 2023, cities: ['Budapest'] }],
    },
    {
        country: 'Iceland',
        code: 'IS',
        visits: [{ year: 2024, cities: ['Reykjavik', 'Reykholt', 'Vik'] }],
    },
    {
        country: 'United States',
        code: 'US',
        visits: [{ year: 2025, cities: ['New York', 'Washington DC'] }],
    },
    {
        country: 'Malta',
        code: 'MT',
        visits: [{ year: 2025, cities: ['Malta'] }],
    },
    {
        country: 'Denmark',
        code: 'DK',
        visits: [{ year: 2025, cities: ['Copenhagen'] }],
    },
    {
        country: 'Germany',
        code: 'DE',
        visits: [{ year: 2025, cities: ['Hamburg', 'Berlin', 'Nuremberg', 'Leipzig', 'Frankfurt'] }],
    },
    {
        country: 'Singapore',
        code: 'SG',
        visits: [{ year: 2024, cities: ['Singapore'] }],
    },
    {
        country: 'Australia',
        code: 'AU',
        visits: [{ year: 2024, cities: ['Melbourne', 'Brisbane', 'Sydney'] }],
    },
    {
        country: 'Philippines',
        code: 'PH',
        visits: [{ year: 2024, cities: ['Manila', 'Cebu'] }],
    },
    {
        country: 'Indonesia',
        code: 'ID',
        visits: [{ year: 2024, cities: ['Ubud', 'Canggu', 'Nusa Dua'], note: 'Bali' }],
    },
    {
        country: 'Thailand',
        code: 'TH',
        visits: [
            {
                year: 2024,
                cities: ['Phuket', 'Phi Phi', 'Koh Lanta', 'Koh Samui', 'Krabi', 'Ao Nang', 'Khao Sok', 'Koh Phangan', 'Koh Tao'],
            },
        ],
    },
    {
        country: 'United Arab Emirates',
        code: 'AE',
        visits: [{ year: 2024, cities: ['Dubai', 'Abu Dhabi'] }],
    },
    {
        country: 'Italy',
        code: 'IT',
        visits: [
            { year: 2013, cities: ['Lake Garda'] },
            { year: 2018, cities: ['Sicily'] },
            { year: 2022, cities: ['Sorrento', 'Naples'] },
        ],
    },
    {
        country: 'Belgium',
        code: 'BE',
        visits: [{ year: 2024, cities: ['Brussels', 'Bruges'] }],
    },
    {
        country: 'France',
        code: 'FR',
        visits: [
            { year: 2012, cities: ['Paris'] },
            { year: 2014, cities: ['La Rochelle'] },
        ],
    },
];

/** `JAPAN · 2024 · Kyoto / Tokyo`, or `IRELAND · home base`. */
function latestVisit(entry: TravelCountry): TravelVisit {
    return [...entry.visits].sort((a, b) => b.year - a.year)[0];
}

/** Full history — used once a country is clicked/zoomed. Includes the "+N more trips" hint. */
export function describeCountry(entry: TravelCountry): string {
    if (entry.home) return `${entry.country} · home base`;
    const latest = latestVisit(entry);
    const more = entry.visits.length > 1 ? ` (+${entry.visits.length - 1} more trip${entry.visits.length > 2 ? 's' : ''})` : '';
    return `${entry.country} · ${latest.year} · ${latest.cities.join(' / ')}${more}`;
}

/** Latest trip only, no hint that other trips exist — used for the hover-only preview. */
export function describeLatestVisit(entry: TravelCountry): string {
    if (entry.home) return `${entry.country} · home base`;
    const latest = latestVisit(entry);
    return `${entry.country} · ${latest.year} · ${latest.cities.join(' / ')}`;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type TravelStats = {
    countries: number;
    cities: number;
    newest: { country: string; year: number } | null;
    top: { country: string; visits: number } | null;
    furthest: { country: string; km: number } | null;
};

export function getTravelStats(): TravelStats {
    const countries = TRAVEL.length;
    const cities = new Set(TRAVEL.flatMap((c) => c.visits.flatMap((v) => v.cities))).size;

    let newest: TravelStats['newest'] = null;
    for (const c of TRAVEL) {
        if (c.home) continue; // "newest trip" — being home doesn't count as one
        for (const v of c.visits) {
            if (!newest || v.year > newest.year) newest = { country: c.country, year: v.year };
        }
    }

    const favorite = TRAVEL.find((c) => c.favorite && !c.home);
    const mostVisited = TRAVEL.filter((c) => !c.home).reduce<TravelCountry | null>(
        (best, c) => (!best || c.visits.length > best.visits.length ? c : best),
        null,
    );
    const topEntry = favorite ?? mostVisited;
    const top = topEntry ? { country: topEntry.country, visits: topEntry.visits.length } : null;

    let furthest: TravelStats['furthest'] = null;
    for (const c of TRAVEL) {
        if (c.home) continue;
        const geo = worldGeo.find((w) => w.code === c.code);
        if (!geo) continue;
        const km = Math.round(haversineKm(SITE_CONFIG.hostGeo.lat, SITE_CONFIG.hostGeo.lon, geo.lat, geo.lon));
        if (!furthest || km > furthest.km) furthest = { country: c.country, km };
    }

    return { countries, cities, newest, top, furthest };
}
