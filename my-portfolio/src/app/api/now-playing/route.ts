import { NextResponse } from 'next/server';
import { fetchNowPlaying, type NowPlaying } from '@/lib/status';

export const revalidate = 30;

export async function GET() {
    let data: NowPlaying;
    try {
        data = await fetchNowPlaying();
    } catch {
        data = { configured: true, playing: false };
    }
    return NextResponse.json(data, {
        headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' },
    });
}
