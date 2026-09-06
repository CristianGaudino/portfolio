import { NextResponse } from 'next/server';
import { fetchSpotifyTop, type SpotifyTop } from '@/lib/status';

export const revalidate = 21600; // 6h — top artists barely move

export async function GET() {
    let data: SpotifyTop;
    try {
        data = await fetchSpotifyTop();
    } catch {
        data = { configured: true };
    }
    return NextResponse.json(data, {
        headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' },
    });
}
