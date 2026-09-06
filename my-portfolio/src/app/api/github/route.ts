import { NextResponse } from 'next/server';
import { fetchGithubActivity, type GithubActivity } from '@/lib/github';
import { SITE_CONFIG } from '@/lib/config';

export const revalidate = 3600;

function fallback(): GithubActivity {
    return {
        lastPush: null,
        commitsPerDay: Array<number>(SITE_CONFIG.activityDays).fill(0),
        commitTotal: 0,
        languages: [],
        repos: [],
        generatedAt: new Date().toISOString(),
        degraded: true,
    };
}

export async function GET() {
    let data: GithubActivity;
    try {
        data = await fetchGithubActivity();
    } catch {
        data = fallback();
    }

    // Don't cache a degraded response for a full hour — let it recover on the next hit.
    const cache = data.degraded
        ? 'public, s-maxage=60, stale-while-revalidate=300'
        : 'public, s-maxage=3600, stale-while-revalidate=86400';

    return NextResponse.json(data, { headers: { 'Cache-Control': cache } });
}
