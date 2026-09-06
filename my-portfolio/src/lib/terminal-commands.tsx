import React from 'react';
import { COMMANDS, ROOT_DIRS, findFile, findFolder, type FileType } from './definitions';
import { formatUptime, getCareerUptimeSeconds } from './utils';

export type CommandResult = {
    output?: React.ReactNode;
    /** new working directory, if the command changed it */
    cwd?: string[];
    clear?: boolean;
};

type CommandSpec = {
    name: string;
    summary: string;
    run: (args: string[], ctx: { cwd: string[]; raw: string }) => CommandResult;
    hidden?: boolean;
};

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
                    up <span className="text-purple-300">{formatUptime(getCareerUptimeSeconds())}</span>
                </Line>
            ),
        }),
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

export function runCommand(raw: string, cwd: string[]): CommandResult {
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
