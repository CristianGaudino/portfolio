import React from 'react';
import { COMMANDS, ROOT_DIRS, findFile, findFolder, type FileType } from './definitions';
import { SITE_CONFIG } from './config';
import { formatRelative, getUptimeReadout, getDevStatus, getLocalTime, getVersion } from './utils';
import type { GithubActivity } from './github';
import type { NowPlaying, SpotifyTop, TrackerStatus } from './status';
import { Bars, MeterList } from '@/components/ui/monitor';

export type CommandResult = {
    output?: React.ReactNode;
    /** new working directory, if the command changed it */
    cwd?: string[];
    clear?: boolean;
};

type CommandSpec = {
    name: string;
    summary: string;
    run: (args: string[], ctx: { cwd: string[]; raw: string }) => CommandResult | Promise<CommandResult>;
    hidden?: boolean;
};

async function getJson<T>(url: string): Promise<T | null> {
    try {
        const res = await fetch(url);
        return res.ok ? ((await res.json()) as T) : null;
    } catch {
        return null;
    }
}

/** key / value row for the neofetch-style readouts */
function Kv({ k, children }: { k: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-2">
            <span className="w-16 shrink-0 text-purple-300">{k}</span>
            <span className="min-w-0 text-beige-200">{children}</span>
        </div>
    );
}

const NEOFETCH_ART = `  ┌───────────┐
  │ ┌───────┐ │
  │ │  >_   │ │
  │ │       │ │
  │ └───────┘ │
  │ ▚ ▚ ▚ ▚ ▚ │
  └───────────┘`;

const TYPE_COLOR: Record<FileType, string> = {
    txt: 'text-term-blue',
    info: 'text-term-amber',
    exe: 'text-term-green',
    pdf: 'text-term-red',
};

/** Resolve a path argument against the current working directory. */
function resolvePath(cwd: string[], arg: string): string[] {
    const fromRoot = arg.startsWith('/') || arg.startsWith('~');
    const segs = arg.replace(/^~/, '').split('/').filter(Boolean);
    const path = fromRoot ? [] : [...cwd];
    for (const s of segs) {
        if (s === '.') continue;
        if (s === '..') path.pop();
        else path.push(s);
    }
    return path;
}

type NodeKind = 'root' | 'dir' | 'file' | 'none';

function kindOf(path: string[]): NodeKind {
    if (path.length === 0) return 'root';
    if (path.length === 1) return findFolder(path[0]) ? 'dir' : 'none';
    if (path.length === 2) return findFile(path[0], path[1]) ? 'file' : 'none';
    return 'none';
}

function prettyPath(path: string[]): string {
    return path.length ? `~/${path.join('/')}` : '~';
}

function err(msg: string): CommandResult {
    return { output: <span className="text-term-red">{msg}</span> };
}

function Line({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}

/** Names available for autocomplete inside a directory. */
export function entriesAt(path: string[]): string[] {
    if (path.length === 0) return ROOT_DIRS;
    if (path.length === 1) return findFolder(path[0])?.children.map((c) => c.id) ?? [];
    return [];
}

const COMMAND_LIST: CommandSpec[] = [
    {
        name: 'help',
        summary: 'show this list',
        run: () => ({
            output: (
                <div className="space-y-0.5">
                    <Line><span className="text-beige-500">available commands — folders also respond to clicks</span></Line>
                    {COMMAND_LIST.filter((c) => !c.hidden).map((c) => (
                        <Line key={c.name}>
                            <span className="text-purple-300">{c.name.padEnd(9)}</span>
                            <span className="text-beige-400">{c.summary}</span>
                        </Line>
                    ))}
                    <Line><span className="text-beige-500">use ↑/↓ for history · Tab to autocomplete</span></Line>
                </div>
            ),
        }),
    },
    {
        name: 'ls',
        summary: 'list a directory',
        run: (args, { cwd }) => {
            const target = args.find((a) => !a.startsWith('-')) ?? '.';
            const path = resolvePath(cwd, target);
            const kind = kindOf(path);
            if (kind === 'none') return err(`ls: ${target}: no such file or directory`);
            if (kind === 'file') return { output: <Line><span className={TYPE_COLOR[findFile(path[0], path[1])!.type]}>{path[1]}</span></Line> };

            const names = path.length === 0
                ? ROOT_DIRS.map((id) => ({ id, dir: true as const }))
                : findFolder(path[0])!.children.map((c) => ({ id: c.id, dir: false as const, type: c.type }));

            return {
                output: (
                    <div className="flex flex-wrap gap-x-5 gap-y-0.5">
                        {names.map((n) => (
                            <span key={n.id} className={n.dir ? 'text-purple-300' : TYPE_COLOR[n.type]}>
                                {n.id}{n.dir ? '/' : ''}
                            </span>
                        ))}
                    </div>
                ),
            };
        },
    },
    {
        name: 'cd',
        summary: 'change directory',
        run: (args, { cwd }) => {
            const target = args[0] ?? '~';
            const path = resolvePath(cwd, target);
            const kind = kindOf(path);
            if (kind === 'file') return err(`cd: not a directory: ${target}`);
            if (kind === 'none') return err(`cd: no such file or directory: ${target}`);
            return { cwd: path };
        },
    },
    {
        name: 'cat',
        summary: 'print a file',
        run: (args, { cwd }) => {
            if (!args[0]) return err('usage: cat <file>');
            const path = resolvePath(cwd, args[0]);
            const kind = kindOf(path);
            if (kind === 'root' || kind === 'dir') return err(`cat: ${args[0]}: is a directory`);
            if (kind === 'none') return err(`cat: ${args[0]}: no such file or directory`);
            return { output: findFile(path[0], path[1])!.message };
        },
    },
    {
        name: 'open',
        summary: 'open a file and any link it holds',
        run: (args, { cwd }) => {
            if (!args[0]) return err('usage: open <file>');
            const path = resolvePath(cwd, args[0]);
            const kind = kindOf(path);
            if (kind === 'none') return err(`open: ${args[0]}: no such file or directory`);
            if (kind === 'root' || kind === 'dir') return { cwd: path };
            const file = findFile(path[0], path[1])!;
            return {
                output: (
                    <>
                        {file.message}
                        {file.href && (
                            <Line>
                                <span className="text-purple-500">→ </span>
                                <a href={file.href} target="_blank" rel="noopener noreferrer" className="text-term-green underline">
                                    {file.href}
                                </a>
                            </Line>
                        )}
                    </>
                ),
            };
        },
    },
    {
        name: 'tree',
        summary: 'print the whole filesystem',
        run: () => ({
            output: (
                <div className="leading-relaxed">
                    <Line><span className="text-purple-300">~</span></Line>
                    {COMMANDS.map((folder, fi) => {
                        const lastFolder = fi === COMMANDS.length - 1;
                        return (
                            <React.Fragment key={folder.id}>
                                <Line>
                                    <span className="text-beige-500">{lastFolder ? '└── ' : '├── '}</span>
                                    <span className="text-purple-300">{folder.id}/</span>
                                </Line>
                                {folder.children.map((child, ci) => (
                                    <Line key={child.id}>
                                        <span className="text-beige-500">
                                            {lastFolder ? '    ' : '│   '}
                                            {ci === folder.children.length - 1 ? '└── ' : '├── '}
                                        </span>
                                        <span className={TYPE_COLOR[child.type]}>{child.id}</span>
                                    </Line>
                                ))}
                            </React.Fragment>
                        );
                    })}
                </div>
            ),
        }),
    },
    {
        name: 'pwd',
        summary: 'print working directory',
        run: (_args, { cwd }) => ({ output: <Line>{prettyPath(cwd)}</Line> }),
    },
    {
        name: 'whoami',
        summary: 'print current user',
        run: () => ({ output: <Line>cristiano</Line> }),
    },
    {
        name: 'uptime',
        summary: 'time since the first commit',
        run: () => ({
            output: (
                <Line>
                    up <span className="text-purple-300">{getUptimeReadout()}</span>
                </Line>
            ),
        }),
    },
    {
        name: 'neofetch',
        summary: 'system readout',
        run: async () => {
            const [gh, np] = await Promise.all([
                getJson<GithubActivity>('/api/github'),
                getJson<NowPlaying>('/api/now-playing'),
            ]);
            const { status, color } = getDevStatus();
            const langs =
                gh && !gh.degraded && gh.languages.length
                    ? gh.languages.map((l) => l.name).join(' · ')
                    : '—';
            const music =
                np?.configured && (np.playing || np.title)
                    ? `${np.title} — ${np.artist}${np.playing ? '' : ' (last played)'}`
                    : 'idle';
            return {
                output: (
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <pre className="leading-tight text-purple-400 glow-soft">{NEOFETCH_ART}</pre>
                        <div className="space-y-0.5">
                            <Line>
                                <span className="text-term-green">cristiano</span>
                                <span className="text-beige-500">@</span>
                                <span className="text-purple-300">cgaudino</span>
                            </Line>
                            <Line><span className="text-beige-600">─────────────────</span></Line>
                            <Kv k="os">cgaudino.os <span className="text-purple-300">{getVersion().version}</span></Kv>
                            <Kv k="host">{SITE_CONFIG.timezoneLabel} · {getLocalTime()}</Kv>
                            <Kv k="uptime">{getUptimeReadout()}</Kv>
                            <Kv k="shell">zsh</Kv>
                            <Kv k="langs">{langs}</Kv>
                            <Kv k="music">{music}</Kv>
                            <Kv k="status"><span className={color}>● {status.toUpperCase()}</span></Kv>
                        </div>
                    </div>
                ),
            };
        },
    },
    {
        name: 'stats',
        summary: 'github activity snapshot',
        run: async () => {
            const gh = await getJson<GithubActivity>('/api/github');
            if (!gh || gh.degraded) return err('stats: github activity unavailable');
            return {
                output: (
                    <div className="space-y-1">
                        <Line><span className="text-purple-300">github · last {SITE_CONFIG.activityDays} days</span></Line>
                        <div className="flex items-center gap-2">
                            <Bars data={gh.commitsPerDay} className="max-w-[180px] flex-1" />
                            <span className="text-beige-400">{gh.commitTotal} commits</span>
                        </div>
                        {gh.languages.length > 0 && <MeterList items={gh.languages} />}
                        {gh.lastPush && (
                            <Line>
                                <span className="text-beige-500">last push · </span>
                                <a
                                    href={gh.lastPush.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-term-blue underline"
                                >
                                    {gh.lastPush.repo}
                                </a>
                                <span className="text-beige-500"> · {formatRelative(gh.lastPush.at)}</span>
                            </Line>
                        )}
                    </div>
                ),
            };
        },
    },
    {
        name: 'now',
        summary: 'what cristiano is reading / watching / playing / hearing',
        run: async () => {
            const [np, tr] = await Promise.all([
                getJson<NowPlaying>('/api/now-playing'),
                getJson<TrackerStatus>('/api/tracker'),
            ]);
            const rows: React.ReactNode[] = [];

            if (np?.configured) {
                rows.push(
                    <Kv k="music" key="music">
                        {np.playing || np.title ? (
                            <>
                                {np.title} <span className="text-beige-500">— {np.artist}</span>
                                {!np.playing && <span className="text-beige-500"> (last played)</span>}
                            </>
                        ) : (
                            <span className="text-beige-500">idle</span>
                        )}
                    </Kv>,
                );
            }

            ([['reading', tr?.reading], ['watching', tr?.watching], ['playing', tr?.playing]] as const).forEach(
                ([k, item]) => {
                    if (!item) return;
                    rows.push(
                        <Kv k={k} key={k}>
                            {item.title}
                            {item.detail && <span className="text-beige-500"> · {item.detail}</span>}
                            {typeof item.progress === 'number' && (
                                <span className="text-purple-500"> · {item.progress}%</span>
                            )}
                        </Kv>,
                    );
                },
            );

            if (!rows.length) {
                return { output: <Line><span className="text-beige-500">nothing on right now — check back later</span></Line> };
            }
            return { output: <div className="space-y-0.5">{rows}</div> };
        },
    },
    {
        name: 'faves',
        summary: "cristiano's year in media",
        run: async () => {
            const [tr, top] = await Promise.all([
                getJson<TrackerStatus>('/api/tracker'),
                getJson<SpotifyTop>('/api/spotify-top'),
            ]);
            const year = tr?.year;
            const rows: React.ReactNode[] = [];

            ([['album', year?.album], ['film', year?.film], ['series', year?.series], ['game', year?.game]] as const).forEach(
                ([k, item]) => {
                    if (!item) return;
                    rows.push(
                        <Kv k={k} key={k}>
                            {item.title}
                            {item.detail && <span className="text-beige-500"> — {item.detail}</span>}
                        </Kv>,
                    );
                },
            );

            if (top?.artist) {
                rows.push(
                    <Kv k="artist" key="artist">
                        {top.artistUrl ? (
                            <a href={top.artistUrl} target="_blank" rel="noopener noreferrer" className="text-term-blue underline">
                                {top.artist}
                            </a>
                        ) : (
                            top.artist
                        )}
                        <span className="text-beige-500"> · most played</span>
                    </Kv>,
                );
            }

            if (!rows.length) {
                return { output: <Line><span className="text-beige-500">no favourites logged yet — check back later</span></Line> };
            }
            return {
                output: (
                    <div className="space-y-0.5">
                        <Line><span className="text-purple-300">cristiano&apos;s last 12 months</span></Line>
                        {rows}
                    </div>
                ),
            };
        },
    },
    {
        name: 'date',
        summary: 'print the system date',
        run: () => ({ output: <Line>{new Date().toString()}</Line> }),
    },
    {
        name: 'echo',
        summary: 'write arguments to the output',
        run: (args) => ({ output: <Line>{args.join(' ')}</Line> }),
    },
    {
        name: 'clear',
        summary: 'clear the screen',
        run: () => ({ clear: true }),
    },
    {
        name: 'sound',
        summary: 'keystroke clicks — sound [on|off]',
        run: (args) => {
            const arg = (args[0] ?? '').toLowerCase();
            let want: boolean;
            if (arg === 'on') want = true;
            else if (arg === 'off') want = false;
            else {
                let cur = false;
                try {
                    cur = localStorage.getItem('cgaudino.sfx') === '1';
                } catch {
                    /* ignore */
                }
                want = !cur;
            }
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('cgaudino:sfx', { detail: want }));
            }
            return {
                output: (
                    <Line>
                        keystroke sound{' '}
                        <span className={want ? 'text-term-green' : 'text-beige-500'}>{want ? 'on' : 'off'}</span>
                    </Line>
                ),
            };
        },
    },
    // ---- easter eggs ----
    {
        name: 'sudo',
        summary: '',
        hidden: true,
        run: () => err('cristiano is not in the sudoers file. This incident has been reported.'),
    },
    {
        name: 'rm',
        summary: '',
        hidden: true,
        run: () => ({ output: <Line><span className="text-term-amber">nice try. everything here is load-bearing.</span></Line> }),
    },
    {
        name: 'exit',
        summary: '',
        hidden: true,
        run: () => ({ output: <Line>there is no exit. only more code.</Line> }),
    },
    {
        name: 'hello',
        summary: '',
        hidden: true,
        run: () => ({ output: <Line><span className="text-term-green">hey — thanks for stopping by. try `help`.</span></Line> }),
    },
];

const COMMAND_MAP = new Map(COMMAND_LIST.map((c) => [c.name, c]));

export const COMMAND_NAMES = COMMAND_LIST.filter((c) => !c.hidden).map((c) => c.name);

export function runCommand(raw: string, cwd: string[]): CommandResult | Promise<CommandResult> {
    const trimmed = raw.trim();
    if (!trimmed) return {};
    const [name, ...args] = trimmed.split(/\s+/);
    const spec = COMMAND_MAP.get(name.toLowerCase());
    if (!spec) {
        return err(`command not found: ${name} — type 'help'`);
    }
    return spec.run(args, { cwd, raw: trimmed });
}

export { resolvePath, prettyPath };
