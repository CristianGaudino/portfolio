"use client";

import { TerminalOutputHandle } from "@/lib/definitions";
import {
    COMMAND_NAMES,
    entriesAt,
    prettyPath,
    resolvePath,
    runCommand,
    type CommandResult,
} from "@/lib/terminal-commands";
import React, {
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef,
    useRef,
    useLayoutEffect,
    useCallback,
} from "react";
import { Window } from "@/components/ui/window";
import { useKeystrokeSound } from "@/lib/use-keystroke-sound";
import { FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";

const REDUCED =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function TypingContent({ node }: { node: React.ReactNode }) {
    const items =
        React.isValidElement(node) && node.type === React.Fragment
            ? React.Children.toArray((node.props as { children: React.ReactNode }).children)
            : [node];

    const [revealed, setRevealed] = useState(REDUCED ? items.length : 0);

    useEffect(() => {
        if (REDUCED) {
            setRevealed(items.length);
            return;
        }
        if (revealed >= items.length) return;
        const delay = revealed === 0 ? 40 : 90;
        const timer = setTimeout(() => setRevealed((r) => r + 1), delay);
        return () => clearTimeout(timer);
    }, [revealed, items.length]);

    return (
        <>
            {items.slice(0, revealed).map((item, i) => (
                <React.Fragment key={i}>{item}</React.Fragment>
            ))}
            {revealed < items.length && (
                <span className="ml-0.5 inline-block h-[0.9em] w-2 translate-y-[0.1em] bg-purple-400 cursor-blink" />
            )}
        </>
    );
}

type Entry =
    | { id: number; kind: "echo"; prompt: string; command: string }
    | { id: number; kind: "out"; content: React.ReactNode; rev?: number };

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

/** What the scrollback should do after the next render. */
type ScrollIntent = { type: "pin"; id: number } | { type: "bottom" } | null;

function Prompt({ cwd, className = "" }: { cwd: string[]; className?: string }) {
    return (
        <span className={`shrink-0 select-none ${className}`}>
            <span className="text-term-green">cristiano</span>
            <span className="text-beige-500">@</span>
            <span className="text-purple-300">cgaudino</span>
            <span className="text-beige-500"> </span>
            <span className="text-term-blue">{prettyPath(cwd)}</span>
            <span className="text-beige-500"> $ </span>
        </span>
    );
}

type TerminalOutputProps = {
    onCollapse?: (collapsed: boolean) => void;
};

const TerminalOutput = forwardRef<TerminalOutputHandle, TerminalOutputProps>(({ onCollapse }, ref) => {
    const sfx = useKeystrokeSound();
    const [entries, setEntries] = useState<Entry[]>([]);
    const [cwd, setCwd] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [historyIdx, setHistoryIdx] = useState<number | null>(null);
    /** once a command has run we grow a spacer so the latest one can pin to the top */
    const [padded, setPadded] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const spacerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const idRef = useRef(0);
    const cwdRef = useRef<string[]>([]);
    cwdRef.current = cwd;
    const scrollIntentRef = useRef<ScrollIntent>(null);

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const intent = scrollIntentRef.current;
        scrollIntentRef.current = null;
        if (!intent) return; // async content growing under a pinned command — leave scroll alone

        if (intent.type === "pin") {
            const node = el.querySelector<HTMLElement>(`[data-entry="${intent.id}"]`);
            if (node) el.scrollTop = Math.max(0, node.offsetTop - 8);
            return;
        }
        // bottom: keep the newest output resting on the viewport floor
        const spacer = spacerRef.current;
        el.scrollTop = spacer
            ? Math.max(0, spacer.offsetTop - el.clientHeight)
            : el.scrollHeight;
    }, [entries]);

    const push = useCallback((entry: DistributiveOmit<Entry, "id">) => {
        const id = idRef.current++;
        setEntries((prev) => [...prev, { ...entry, id } as Entry]);
        return id;
    }, []);

    const updateEntry = useCallback((id: number, content: React.ReactNode) => {
        setEntries((prev) =>
            prev.map((e) =>
                e.id === id && e.kind === "out" ? { ...e, content, rev: (e.rev ?? 0) + 1 } : e,
            ),
        );
    }, []);

    const clearScreen = useCallback(() => {
        setEntries([]);
        setPadded(false);
    }, []);

    const applyResult = useCallback(
        (result: CommandResult, pendingId: number | null) => {
            if (result.clear) {
                clearScreen();
                return;
            }
            if (result.cwd) {
                setCwd(result.cwd);
                cwdRef.current = result.cwd;
            }
            if (pendingId !== null) {
                updateEntry(pendingId, result.output ?? <span className="text-beige-500">done</span>);
            } else if (result.output !== undefined) {
                push({ kind: "out", content: result.output });
            }
        },
        [clearScreen, push, updateEntry],
    );

    const execute = useCallback(
        (command: string, { echo = true }: { echo?: boolean } = {}) => {
            const trimmed = command.trim();
            const here = cwdRef.current;
            if (echo) {
                const echoId = push({ kind: "echo", prompt: prettyPath(here), command: trimmed });
                if (trimmed) {
                    scrollIntentRef.current = { type: "pin", id: echoId };
                    setPadded(true);
                }
            }
            if (!trimmed) return;

            setHistory((h) => (h[h.length - 1] === trimmed ? h : [...h, trimmed]));

            const result = runCommand(trimmed, here);
            if (result instanceof Promise) {
                const pendingId = push({
                    kind: "out",
                    content: <span className="animate-pulse text-beige-500">…</span>,
                });
                result
                    .then((r) => applyResult(r, pendingId))
                    .catch(() => updateEntry(pendingId, <span className="text-term-red">command failed</span>));
                return;
            }
            applyResult(result, null);
        },
        [push, applyResult, updateEntry],
    );

    useImperativeHandle(ref, () => ({
        print: (content: React.ReactNode) => {
            scrollIntentRef.current = { type: "bottom" };
            push({ kind: "out", content });
        },
        clear: clearScreen,
        run: (command: string) => execute(command),
        focus: () => inputRef.current?.focus(),
    }));

    useEffect(() => {
        if (window.matchMedia?.("(min-width: 640px)").matches) {
            inputRef.current?.focus();
        }
    }, []);

    /** Focus the input on click — unless the user is selecting text. */
    const focusInput = useCallback(() => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed) return;
        inputRef.current?.focus();
    }, []);

    const autocomplete = () => {
        const parts = input.split(/(\s+)/); // keep separators
        const tokens = input.split(/\s+/);
        const editing = tokens[tokens.length - 1] ?? "";

        // first token → complete a command name
        if (tokens.length <= 1) {
            const matches = COMMAND_NAMES.filter((n) => n.startsWith(editing));
            if (matches.length === 1) setInput(matches[0] + " ");
            else if (matches.length > 1) {
                scrollIntentRef.current = { type: "bottom" };
                push({ kind: "out", content: <span className="text-beige-500">{matches.join("   ")}</span> });
            }
            return;
        }

        // later token → complete a path within the referenced directory
        const slash = editing.lastIndexOf("/");
        const dirPart = slash >= 0 ? editing.slice(0, slash) : "";
        const leaf = slash >= 0 ? editing.slice(slash + 1) : editing;
        const base = resolvePath(cwd, dirPart || ".");
        const options = entriesAt(base).filter((e) => e.startsWith(leaf));

        if (options.length === 1) {
            const completed = (dirPart ? dirPart + "/" : "") + options[0];
            parts[parts.length - 1] = completed;
            setInput(parts.join(""));
        } else if (options.length > 1) {
            scrollIntentRef.current = { type: "bottom" };
            push({ kind: "out", content: <span className="text-beige-500">{options.join("   ")}</span> });
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!e.repeat && !["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) sfx.play();

        if (e.key === "Enter") {
            execute(input);
            setInput("");
            setHistoryIdx(null);
        } else if (e.key === "Tab") {
            e.preventDefault();
            autocomplete();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!history.length) return;
            const next = historyIdx === null ? history.length - 1 : Math.max(0, historyIdx - 1);
            setHistoryIdx(next);
            setInput(history[next]);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIdx === null) return;
            const next = historyIdx + 1;
            if (next >= history.length) {
                setHistoryIdx(null);
                setInput("");
            } else {
                setHistoryIdx(next);
                setInput(history[next]);
            }
        } else if (e.key === "l" && e.ctrlKey) {
            e.preventDefault();
            clearScreen();
        }
    };

    return (
        <Window
            title="terminal — zsh"
            className="h-full"
            bodyClassName="flex flex-col bg-black/95"
            onCollapse={onCollapse}
            right={
                <span className="flex items-center gap-2">
                    <button
                        onClick={sfx.toggle}
                        aria-label={sfx.enabled ? "Mute keystrokes" : "Enable keystroke sound"}
                        title={sfx.enabled ? "Mute keystrokes" : "Enable keystroke sound"}
                        className={`transition-colors ${sfx.enabled ? "text-purple-300 hover:text-white" : "text-beige-600 hover:text-beige-400"}`}
                    >
                        {sfx.enabled ? <FaVolumeHigh className="h-3 w-3" /> : <FaVolumeXmark className="h-3 w-3" />}
                    </button>
                    <button
                        onClick={clearScreen}
                        className="rounded border border-purple-600 px-2 py-0.5 text-[0.7rem] text-purple-300 transition-colors hover:border-purple-300 hover:text-white"
                    >
                        clear
                    </button>
                </span>
            }
        >
            <div
                ref={containerRef}
                onClick={focusInput}
                className="relative min-h-0 flex-1 space-y-1 overflow-y-auto p-4 text-purple-400 text-sm selection:bg-purple-500/40"
            >
                {entries.map((entry) =>
                    entry.kind === "echo" ? (
                        <div key={entry.id} data-entry={entry.id} className="flex flex-wrap items-baseline">
                            <span className="select-none">
                                <span className="text-term-green">cristiano</span>
                                <span className="text-beige-500">@</span>
                                <span className="text-purple-300">cgaudino</span>{" "}
                                <span className="text-term-blue">{entry.prompt}</span>
                                <span className="text-beige-500"> $</span>
                            </span>
                            <span className="ml-1.5 text-beige-200">{entry.command}</span>
                        </div>
                    ) : (
                        <div key={entry.id} data-entry={entry.id} className="flex items-start">
                            <span className="shrink-0 select-none text-purple-500">&gt;</span>
                            <div className="ml-2 min-w-0 break-words">
                                <TypingContent key={entry.rev ?? 0} node={entry.content} />
                            </div>
                        </div>
                    ),
                )}
                {/* trailing spacer so the latest command can always scroll to the top */}
                <div ref={spacerRef} aria-hidden className={padded ? "h-full shrink-0" : ""} />
            </div>

            <div
                onClick={() => inputRef.current?.focus()}
                className="flex shrink-0 flex-wrap items-baseline gap-y-1 border-t border-beige-800 bg-black/95 px-4 py-2 text-sm"
            >
                <Prompt cwd={cwd} />
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    aria-label="terminal input"
                    className="min-w-0 flex-1 bg-transparent text-beige-200 caret-purple-300 outline-none"
                />
            </div>
        </Window>
    );
});

TerminalOutput.displayName = "TerminalOutput";

export default TerminalOutput;
