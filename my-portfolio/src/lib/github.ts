import { SITE_CONFIG } from './config';

const API = 'https://api.github.com';

function headers(): HeadersInit {
    const h: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    return h;
}

export type GithubActivity = {
    lastPush: { repo: string; message: string; url: string; at: string } | null;
    /** commit counts per day, oldest → newest, length === SITE_CONFIG.activityDays */
    commitsPerDay: number[];
    commitTotal: number;
    languages: { name: string; pct: number }[];
    repos: { name: string; language: string | null; pushedAt: string; url: string }[];
    generatedAt: string;
    degraded: boolean;
};

const DAYS = SITE_CONFIG.activityDays;

function emptyActivity(degraded: boolean): GithubActivity {
    return {
        lastPush: null,
        commitsPerDay: Array<number>(DAYS).fill(0),
        commitTotal: 0,
        languages: [],
        repos: [],
        generatedAt: new Date().toISOString(),
        degraded,
    };
}

type PushEvent = {
    type: string;
    created_at: string;
    repo: { name: string };
    payload: { size?: number; commits?: { message: string }[] };
};

type Repo = {
    name: string;
    html_url: string;
    fork: boolean;
    language: string | null;
    pushed_at: string;
};

export async function fetchGithubActivity(): Promise<GithubActivity> {
    const user = SITE_CONFIG.github.user;

    let events: PushEvent[] = [];
    let repos: Repo[] = [];
    try {
        const [eventsRes, reposRes] = await Promise.all([
            fetch(`${API}/users/${user}/events/public?per_page=100`, {
                headers: headers(),
                next: { revalidate: 3600 },
            }),
            fetch(`${API}/users/${user}/repos?sort=pushed&per_page=100&type=owner`, {
                headers: headers(),
                next: { revalidate: 3600 },
            }),
        ]);
        if (!eventsRes.ok && !reposRes.ok) return emptyActivity(true);
        const rawEvents = eventsRes.ok ? await eventsRes.json() : [];
        const rawRepos = reposRes.ok ? await reposRes.json() : [];
        // GitHub answers rate limits / errors with an object, not an array
        events = Array.isArray(rawEvents) ? rawEvents : [];
        repos = Array.isArray(rawRepos) ? rawRepos : [];
        if (!events.length && !repos.length) return emptyActivity(true);
    } catch {
        return emptyActivity(true);
    }

    try {
        return buildActivity(events, repos);
    } catch {
        return emptyActivity(true);
    }
}

function buildActivity(events: PushEvent[], repos: Repo[]): GithubActivity {
    const result = emptyActivity(false);
    const now = Date.now();

    const pushes = events.filter((e) => e.type === 'PushEvent');
    for (const p of pushes) {
        const dayIdx = DAYS - 1 - Math.floor((now - new Date(p.created_at).getTime()) / 86_400_000);
        if (dayIdx >= 0 && dayIdx < DAYS) {
            const count = p.payload.size ?? p.payload.commits?.length ?? 1;
            result.commitsPerDay[dayIdx] += count;
            result.commitTotal += count;
        }
    }

    const latest = pushes[0];
    if (latest) {
        const message =
            (latest.payload.commits ?? [])
                .map((c) => c.message?.split('\n')[0]?.trim())
                .filter((m): m is string => !!m)
                .at(-1) ?? 'pushed commits';
        result.lastPush = {
            repo: latest.repo.name.split('/').at(-1) ?? latest.repo.name,
            message,
            url: `https://github.com/${latest.repo.name}`,
            at: latest.created_at,
        };
    }

    const active = repos.filter((r) => !r.fork);
    const langCounts = new Map<string, number>();
    for (const r of active) {
        if (r.language) langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
    }
    const langTotal = [...langCounts.values()].reduce((a, b) => a + b, 0) || 1;
    result.languages = [...langCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, pct: Math.round((count / langTotal) * 100) }));

    result.repos = active.slice(0, 4).map((r) => ({
        name: r.name,
        language: r.language,
        pushedAt: r.pushed_at,
        url: r.html_url,
    }));

    return result;
}
