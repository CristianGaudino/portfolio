"use client";

import { useEffect, useState } from "react";
import { FaArrowsRotate, FaGraduationCap, FaUserTie } from "react-icons/fa6";
import { SKILLS } from "@/lib/definitions";
import { SITE_CONFIG } from "@/lib/config";
import {
    formatRelative,
    formatUptime,
    getCareerUptimeSeconds,
    getDevStatus,
    getLocalTime,
    getProfessionalYears,
    getVersion,
    type DevStatus,
} from "@/lib/utils";
import { useJson } from "@/lib/hooks";
import type { GithubActivity } from "@/lib/github";
import type { NowPlaying, TrackerStatus } from "@/lib/status";
import {
    Bars,
    Equalizer,
    MeterList,
    MonitorSection,
    Skeleton,
    StatRow,
} from "@/components/ui/monitor";

const BUILD = {
    sha: process.env.NEXT_PUBLIC_GIT_SHA ?? "dev",
    ref: process.env.NEXT_PUBLIC_GIT_REF ?? "local",
    time: process.env.NEXT_PUBLIC_BUILD_TIME ?? "",
};

const DASH = "—";

export function Dashboard() {
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
                    <SystemSection />
                    <ActivitySection />
                    <NowSection />
                </div>
            </div>
        </div>
    );
}

function SystemSection() {
    const [uptime, setUptime] = useState<number | null>(null);
    const [clock, setClock] = useState<string | null>(null);
    const { version } = getVersion();
    const professionalYears = getProfessionalYears();

    useEffect(() => {
        const tick = () => {
            setUptime(getCareerUptimeSeconds());
            setClock(getLocalTime());
        };
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <MonitorSection title="system">
            <StatRow label="os">
                cgaudino.os{" "}
                <span
                    className="text-purple-300"
                    title={`v = years.months since ${SITE_CONFIG.birthDate}`}
                >
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
            <StatRow label="uptime">
                {uptime === null ? <Skeleton className="h-3 w-40" /> : formatUptime(uptime)}
            </StatRow>
            <StatRow label="location">
                {SITE_CONFIG.timezoneCity}
                {clock && <span className="text-beige-400"> · {clock}</span>}
            </StatRow>
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

function ActivitySection() {
    const { data, loading } = useJson<GithubActivity>("/api/github", SITE_CONFIG.poll.activity);
    const unavailable = !loading && (!data || data.degraded);

    const [focus, setFocus] = useState("");
    const [pinned, setPinned] = useState(false);

    useEffect(() => {
        setFocus(SKILLS[Math.floor(Math.random() * SKILLS.length)]);
    }, []);
    useEffect(() => {
        if (!pinned && data?.languages[0]) setFocus(data.languages[0].name);
    }, [data, pinned]);

    const shuffleFocus = () => {
        setPinned(true);
        setFocus((prev) => {
            let next = prev;
            while (next === prev) next = SKILLS[Math.floor(Math.random() * SKILLS.length)];
            return next;
        });
    };

    return (
        <MonitorSection title="activity">
            <StatRow label={`commits/${SITE_CONFIG.activityDays}d`}>
                {loading ? (
                    <Skeleton className="h-6 w-full" />
                ) : unavailable ? (
                    <span className="text-beige-500">unavailable</span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Bars data={data!.commitsPerDay} className="flex-1" />
                        <span className="text-beige-400">{data!.commitTotal}</span>
                    </span>
                )}
            </StatRow>

            <StatRow label="languages">
                {loading ? (
                    <Skeleton className="h-12 w-full" />
                ) : unavailable || !data!.languages.length ? (
                    <span className="text-beige-500">unavailable</span>
                ) : (
                    <MeterList items={data!.languages} />
                )}
            </StatRow>

            <StatRow label="last push">
                {loading ? (
                    <Skeleton className="h-3 w-52" />
                ) : unavailable || !data!.lastPush ? (
                    <span className="text-beige-500">unavailable</span>
                ) : (
                    <span>
                        <a
                            href={data!.lastPush.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-term-blue underline"
                        >
                            {data!.lastPush.repo}
                        </a>{" "}
                        <span className="text-beige-500">{formatRelative(data!.lastPush.at)}</span>
                        <br />
                        <span className="text-beige-300">{data!.lastPush.message}</span>
                    </span>
                )}
            </StatRow>

            <StatRow label="focus">
                <span className="inline-flex items-center gap-2">
                    {focus || <Skeleton className="h-3 w-16" />}
                    <button
                        onClick={shuffleFocus}
                        aria-label="Shuffle focus skill"
                        title="Shuffle focus skill"
                        className="text-purple-500 transition-colors hover:text-purple-300"
                    >
                        <FaArrowsRotate className="h-3 w-3" />
                    </button>
                </span>
            </StatRow>
        </MonitorSection>
    );
}

const STATUS_LABEL: Record<DevStatus, string> = {
    active: "ACTIVE",
    idle: "IDLE",
    offline: "OFFLINE",
};

function NowSection() {
    const [status, setStatus] = useState<{ status: DevStatus; color: string } | null>(null);
    const np = useJson<NowPlaying>("/api/now-playing", SITE_CONFIG.poll.nowPlaying);
    const tracker = useJson<TrackerStatus>("/api/tracker", SITE_CONFIG.poll.tracker);

    useEffect(() => {
        const tick = () => setStatus(getDevStatus());
        tick();
        const timer = setInterval(tick, 60_000);
        return () => clearInterval(timer);
    }, []);

    const t = tracker.data;
    const procs = [
        t?.reading && { key: "reading.proc", item: t.reading },
        t?.watching && { key: "watching.proc", item: t.watching },
        t?.playing && { key: "playing.proc", item: t.playing },
    ].filter(Boolean) as { key: string; item: NonNullable<TrackerStatus["reading"]> }[];

    return (
        <MonitorSection title="now">
            <StatRow label="status">
                {!status ? (
                    <Skeleton className="h-3 w-24" />
                ) : (
                    <span className={status.color}>● {STATUS_LABEL[status.status]}</span>
                )}
            </StatRow>

            <StatRow label="audiod">
                {np.loading ? (
                    <Skeleton className="h-3 w-44" />
                ) : !np.data?.configured ? (
                    <span className="text-beige-500">{DASH}</span>
                ) : !np.data.playing ? (
                    <span className="text-beige-400">
                        idle{np.data.title && <span className="text-beige-500"> · last: {np.data.title}</span>}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-2">
                        <Equalizer />
                        <a
                            href={np.data.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-beige-200 hover:underline"
                        >
                            {np.data.title}
                        </a>
                        <span className="text-beige-500">— {np.data.artist}</span>
                    </span>
                )}
            </StatRow>

            {tracker.loading ? (
                <StatRow label="procs">
                    <Skeleton className="h-3 w-40" />
                </StatRow>
            ) : procs.length ? (
                procs.map(({ key, item }) => (
                    <StatRow key={key} label={key}>
                        {item.title}
                        {item.detail && <span className="text-beige-500"> · {item.detail}</span>}
                        {typeof item.progress === "number" && (
                            <span className="text-purple-500"> · {item.progress}%</span>
                        )}
                    </StatRow>
                ))
            ) : (
                <StatRow label="procs">
                    <span className="text-beige-500">{DASH}</span>
                </StatRow>
            )}
        </MonitorSection>
    );
}
