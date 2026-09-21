import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { SITE_CONFIG } from '@/lib/config';
import { haversineKm } from '@/lib/utils';
import type { PeerInfo } from '@/lib/status';

export const dynamic = 'force-dynamic';

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
