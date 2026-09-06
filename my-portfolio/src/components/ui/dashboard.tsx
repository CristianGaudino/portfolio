"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FaGraduationCap, FaUserTie } from "react-icons/fa6";
import { SITE_CONFIG } from "@/lib/config";
import {
    formatRelative,
    getUptimeReadout,
    getDevStatus,
    getLocalTime,
    getProfessionalYears,
    getVersion,
    type DevStatus,
} from "@/lib/utils";
import { useJson, type AsyncState } from "@/lib/hooks";
import type { GithubActivity } from "@/lib/github";
import type { DeployStatus, NowPlaying, PeerInfo, SpotifyTop, TrackerStatus } from "@/lib/status";
import { Bars, Gauge, Heatmap, MeterList, MonitorSection, Skeleton, StatRow } from "@/components/ui/monitor";

const BUILD = {
    sha: process.env.NEXT_PUBLIC_GIT_SHA ?? "dev",
    ref: process.env.NEXT_PUBLIC_GIT_REF ?? "local",
    time: process.env.NEXT_PUBLIC_BUILD_TIME ?? "",
};

const STATUS_LABEL: Record<DevStatus, string> = {
    active: "ACTIVE",
    idle: "IDLE",
    offline: "OFFLINE",
};

type DashboardData = {
    gh: AsyncState<GithubActivity>;
    np: AsyncState<NowPlaying>;
    tracker: AsyncState<TrackerStatus>;
    top: AsyncState<SpotifyTop>;
    peer: AsyncState<PeerInfo>;
    deploy: AsyncState<DeployStatus>;
};

function useDashboardData(): DashboardData {
    return {
        gh: useJson<GithubActivity>("/api/github", SITE_CONFIG.poll.activity),
        np: useJson<NowPlaying>("/api/now-playing", SITE_CONFIG.poll.nowPlaying),
        tracker: useJson<TrackerStatus>("/api/tracker", SITE_CONFIG.poll.tracker),
        top: useJson<SpotifyTop>("/api/spotify-top"),
        peer: useJson<PeerInfo>("/api/peer"),
        deploy: useJson<DeployStatus>("/api/deploy"),
    };
}

/** Fake "load average" from real inputs — time of day, commits today, whether music is on. */
function systemLoad(status: DevStatus, gh: GithubActivity | undefined, playing: boolean): number {
    let load = status === "active" ? 0.62 : status === "idle" ? 0.38 : 0.11;
    load += Math.min(0.6, (gh?.commitsPerDay.at(-1) ?? 0) * 0.12);
    if (playing) load += 0.15;
    load += (new Date().getMinutes() % 7) * 0.01; // gentle breathing
    return Math.round(load * 100) / 100;
}

export function Dashboard() {
    const data = useDashboardData();

    return (
        <div className="h-full w-full overflow-y-auto p-4 text-beige-300">
            <div className="flex gap-4">
                <div className="flex shrink-0 flex-col items-center gap-1.5">
                    <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-md border border-purple-700 bg-purple-800 text-[0.6rem] text-purple-500 glow-soft">
                        cgaudino
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/ascii_portrait.png"
                            alt="ASCII portrait of Cristiano Gaudino"
                            width={96}
                            height={96}
                            className="col-start-1 row-start-1 h-24 w-24 object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    </div>
                    <span className="whitespace-nowrap text-[0.6rem] text-beige-500">
                        cristiano<span className="text-beige-400">@</span>cgaudino
                    </span>
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                    <SystemSection data={data} />
                    <ActivitySection data={data} />
                    <MediaSection data={data} />
                </div>
            </div>
        </div>
    );
}

function SystemSection({ data }: { data: DashboardData }) {
    const { gh, np, peer, deploy } = data;
    const [uptime, setUptime] = useState<string | null>(null);
    const [clock, setClock] = useState<string | null>(null);
    const [status, setStatus] = useState<{ status: DevStatus; color: string } | null>(null);
    const { version } = getVersion();
    const professionalYears = getProfessionalYears();

    useEffect(() => {
        const tick = () => {
            setUptime(getUptimeReadout());
            setClock(getLocalTime());
            setStatus(getDevStatus());
        };
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, []);

    const load = status ? systemLoad(status.status, gh.data, np.data?.playing ?? false) : null;
    const d = deploy.data;
    const p = peer.data;

    return (
        <MonitorSection title="system">
            <StatRow label="os">
                cgaudino.os{" "}
                <span className="text-purple-300" title={`v = years.months since ${SITE_CONFIG.birthDate.slice(0, 10)}`}>
                    {version}
                </span>
            </StatRow>
            <StatRow label="build">
                <a
                    href={`${SITE_CONFIG.github.repoUrl}/commit/${BUILD.sha}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-term-blue underline"
                >
                    {BUILD.ref}@{BUILD.sha}
                </a>
                {BUILD.time && <span className="text-beige-500"> · built {formatRelative(BUILD.time)}</span>}
            </StatRow>
            {d?.configured && d.state && (
                <StatRow label="deploy">
                    <span className={d.state === "ready" ? "text-term-green" : d.state === "error" ? "text-term-red" : "text-term-amber"}>
                        {d.state}
                    </span>
                    {d.at && <span className="text-beige-500"> · {formatRelative(d.at)}</span>}
                </StatRow>
            )}
            <StatRow label="uptime">
                {uptime === null ? <Skeleton className="h-3 w-40" /> : <span className="tabular-nums">{uptime}</span>}
            </StatRow>
            <StatRow label="load">
                {load === null ? <Skeleton className="h-3 w-32" /> : <Gauge value={load} />}
            </StatRow>
            <StatRow label="status">
                {!status ? (
                    <Skeleton className="h-3 w-24" />
                ) : (
                    <span className={status.color}>● {STATUS_LABEL[status.status]}</span>
                )}
            </StatRow>
            <StatRow label="location">
                {SITE_CONFIG.timezoneLabel}
                {clock && <span className="text-beige-400"> · {clock}</span>}
            </StatRow>
            {p?.available && (p.city || p.km != null) && (
                <StatRow label="peer">
                    {p.city ? `${p.city}${p.country ? `, ${p.country}` : ""}` : "connected"}
                    {p.km != null && <span className="text-beige-500"> · ~{p.km.toLocaleString()} km</span>}
                </StatRow>
            )}
            <StatRow label="experience">
                <span className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center gap-1" title="Academic">
                        <FaGraduationCap className="text-purple-300" /> x{SITE_CONFIG.academicYears}
                    </span>
                    <span className="text-purple-500">·</span>
                    <span className="inline-flex items-center gap-1" title="Professional">
                        <FaUserTie className="text-purple-300" /> x{professionalYears}
                    </span>
                </span>
            </StatRow>
        </MonitorSection>
    );
}

function ActivitySection({ data }: { data: DashboardData }) {
    const { data: gh, loading } = data.gh;
    const unavailable = !loading && (!gh || gh.degraded);

    return (
        <MonitorSection title="activity">
            <StatRow label={`commits/${SITE_CONFIG.activityDays}d`}>
                {loading ? (
                    <Skeleton className="h-6 w-full" />
                ) : unavailable ? (
                    <span className="text-beige-500">unavailable</span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Bars data={gh!.commitsPerDay} className="flex-1" />
                        <span className="text-beige-400">{gh!.commitTotal}</span>
                    </span>
                )}
            </StatRow>

            {(loading || gh?.contributions) && (
                <StatRow label={`${SITE_CONFIG.heatmapWeeks}w`}>
                    {loading ? (
                        <Skeleton className="h-14 w-full" />
                    ) : gh?.contributions ? (
                        <span className="inline-flex items-center gap-2">
                            <Heatmap days={gh.contributions.days} />
                            <span className="text-beige-500">{gh.contributions.total}</span>
                        </span>
                    ) : null}
                </StatRow>
            )}

            <StatRow label="languages">
                {loading ? (
                    <Skeleton className="h-12 w-full" />
                ) : unavailable || !gh!.languages.length ? (
                    <span className="text-beige-500">unavailable</span>
                ) : (
                    <MeterList items={gh!.languages} />
                )}
            </StatRow>

            <StatRow label="last push">
                {loading ? (
                    <Skeleton className="h-3 w-52" />
                ) : unavailable || !gh!.lastPush ? (
                    <span className="text-beige-500">unavailable</span>
                ) : (
                    <span>
                        <a
                            href={gh!.lastPush.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-term-blue underline"
                        >
                            {gh!.lastPush.repo}
                        </a>{" "}
                        <span className="text-beige-500">{formatRelative(gh!.lastPush.at)}</span>
                        <br />
                        <span className="text-beige-300">{gh!.lastPush.message}</span>
                    </span>
                )}
            </StatRow>
        </MonitorSection>
    );
}

function MediaSection({ data }: { data: DashboardData }) {
    const year = data.tracker.data?.year;
    const top = data.top.data;
    const rows: { k: string; node: ReactNode }[] = [];

    (["album", "film", "series", "game"] as const).forEach((k) => {
        const item = year?.[k];
        if (item) {
            rows.push({
                k,
                node: (
                    <>
                        {item.title}
                        {item.detail && <span className="text-beige-500"> — {item.detail}</span>}
                    </>
                ),
            });
        }
    });

    if (top?.artist) {
        rows.push({
            k: "artist",
            node: (
                <>
                    {top.artistUrl ? (
                        <a href={top.artistUrl} target="_blank" rel="noopener noreferrer" className="text-term-blue underline">
                            {top.artist}
                        </a>
                    ) : (
                        top.artist
                    )}
                    <span className="text-beige-500"> · most played</span>
                </>
            ),
        });
    }

    if (!rows.length) return null;

    return (
        <MonitorSection title="media · last 12 months">
            {rows.map(({ k, node }) => (
                <StatRow key={k} label={k}>
                    {node}
                </StatRow>
            ))}
        </MonitorSection>
    );
}
