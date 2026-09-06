import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { SITE_CONFIG } from '@/lib/config';
import type { PeerInfo } from '@/lib/status';

export const dynamic = 'force-dynamic';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET() {
    const h = await headers();
    const rawCity = h.get('x-vercel-ip-city');
    const country = h.get('x-vercel-ip-country');
    const lat = parseFloat(h.get('x-vercel-ip-latitude') ?? '');
    const lon = parseFloat(h.get('x-vercel-ip-longitude') ?? '');

    if (!rawCity && !Number.isFinite(lat)) {
        return NextResponse.json({ available: false } satisfies PeerInfo);
    }

    const km =
        Number.isFinite(lat) && Number.isFinite(lon)
            ? Math.round(haversineKm(lat, lon, SITE_CONFIG.hostGeo.lat, SITE_CONFIG.hostGeo.lon))
            : null;

    return NextResponse.json({
        available: true,
        city: rawCity ? decodeURIComponent(rawCity) : null,
        country: country || null,
        km,
    } satisfies PeerInfo);
}
