"use client";

import { TerminalLine, TerminalOutputHandle } from "@/lib/definitions";
import React, {
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef,
    useRef,
    useLayoutEffect,
} from "react";

function TypingContent({ node }: { node: React.ReactNode }) {
    const items = React.isValidElement(node) && node.type === React.Fragment
        ? React.Children.toArray((node.props as { children: React.ReactNode }).children)
        : [node];

    const [revealed, setRevealed] = useState(0);

    useEffect(() => {
        if (revealed >= items.length) return;
        const delay = revealed === 0 ? 50 : 130;
        const timer = setTimeout(() => setRevealed(r => r + 1), delay);
        return () => clearTimeout(timer);
    }, [revealed, items.length]);

    return (
        <>
            {items.slice(0, revealed)}
            {revealed < items.length && (
                <span className="inline-block w-2 h-[0.9em] bg-purple-400 opacity-80 animate-pulse align-middle ml-0.5" />
            )}
        </>
    );
}

const TerminalOutput = forwardRef<TerminalOutputHandle>((_, ref) => {
    const [lines, setLines] = useState<TerminalLine[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const lineId = useRef(0);

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [lines]);

    useImperativeHandle(ref, () => ({
        print: (content: React.ReactNode) => {
            const id = lineId.current++;
            const time = new Date().toLocaleTimeString();
            setLines((prev) => [...prev, { id, time, content }]);
        },
        clear: () => setLines([]),
    }));

    return (
        <div className="w-full overflow-hidden shadow-lg shrink-0">
            <div className="bg-purple-700 text-gray-300 px-4 py-2 select-none flex items-center justify-between">
                <span className="font-semibold">Output</span>
                <button
                    onClick={() => setLines([])}
                    className="text-xs text-purple-200 hover:text-white transition-colors px-2 py-0.5 rounded border border-purple-500 hover:border-purple-300"
                >
                    clear
                </button>
            </div>

            <div
                ref={containerRef}
                className="bg-black text-purple-400 p-4 h-48 sm:h-72 overflow-y-auto space-y-1"
            >
                {lines.map((line) => (
                    <div key={line.id} className="flex items-start">
                        <span className="text-purple-500 shrink-0">&gt;</span>
                        <div className="ml-2 break-words min-w-0">
                            <span className="text-purple-500 shrink-0">[{line.time}]</span>{' '}
                            <TypingContent node={line.content} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

TerminalOutput.displayName = "TerminalOutput";

export default TerminalOutput;
