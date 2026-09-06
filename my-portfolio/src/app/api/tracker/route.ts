import { NextResponse } from 'next/server';
import { fetchTrackerStatus, type TrackerStatus } from '@/lib/status';

export const revalidate = 300;

export async function GET() {
    let data: TrackerStatus;
    try {
        data = await fetchTrackerStatus();
    } catch {
        data = { configured: false };
    }
    return NextResponse.json(data, {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
    });
}
