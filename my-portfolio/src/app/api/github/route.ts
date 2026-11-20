import { NextResponse } from 'next/server';
import { emptyActivity, fetchGithubActivity, type GithubActivity } from '@/lib/github';

export const revalidate = 3600;

export async function GET() {
    let data: GithubActivity;
    try {
        data = await fetchGithubActivity();
    } catch {
        data = emptyActivity(true);
    }

    // Don't cache a degraded response for a full hour — let it recover on the next hit.
    const cache = data.degraded
        ? 'public, s-maxage=60, stale-while-revalidate=300'
        : 'public, s-maxage=3600, stale-while-revalidate=86400';

    return NextResponse.json(data, { headers: { 'Cache-Control': cache } });
}
