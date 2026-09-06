import { NextResponse } from 'next/server';
import type { DeployStatus } from '@/lib/status';

export const revalidate = 300;

export async function GET() {
    const token = process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;
    if (!token || !projectId) return NextResponse.json({ configured: false } satisfies DeployStatus);

    try {
        const team = process.env.VERCEL_TEAM_ID ? `&teamId=${process.env.VERCEL_TEAM_ID}` : '';
        const res = await fetch(
            `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1${team}`,
            { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } },
        );
        if (!res.ok) throw new Error(String(res.status));

        const json = (await res.json()) as {
            deployments?: { readyState?: string; state?: string; created?: number; url?: string }[];
        };
        const d = json.deployments?.[0];
        if (!d) return NextResponse.json({ configured: true } satisfies DeployStatus);

        return NextResponse.json({
            configured: true,
            state: (d.readyState ?? d.state ?? '').toLowerCase(),
            at: d.created ? new Date(d.created).toISOString() : undefined,
            url: d.url ? `https://${d.url}` : undefined,
        } satisfies DeployStatus, {
            headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
        });
    } catch {
        return NextResponse.json({ configured: true } satisfies DeployStatus);
    }
}
