"use client";

import { TerminalLine, TerminalOutputHandle } from "@/lib/definitions";
import React, {
    useState,
    useImperativeHandle,
    forwardRef,
    useRef,
    useLayoutEffect,
} from "react";


const TerminalOutput = forwardRef<TerminalOutputHandle>((_, ref) => {
    const [lines, setLines] = useState<TerminalLine[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const lineId = useRef(0);

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [lines]);

    useImperativeHandle(ref, () => ({
        print: (content: React.ReactNode) => {
            const id = lineId.current++;
            const time = new Date().toLocaleTimeString();

            const newLine: TerminalLine = {
                id,
                time,
                content,
            };
            setLines((prev) => [...prev, newLine]);
        },
    }));

    return (
        <div className="w-full overflow-hidden shadow-lg">
            <div className="bg-purple-700 text-gray-300 px-4 py-2 select-none">
                <span className="font-semibold">Output</span>
            </div>

            <div
                ref={containerRef}
                className="bg-black text-purple-400 p-4 h-96 overflow-y-auto space-y-1"
            >
                {lines.map((line) => (
                    <div key={line.id}>
                        <span className="text-purple-500">&gt; [{line.time}] </span>
                        {line.content}
                    </div>
                ))}
            </div>
        </div>
    );
});

TerminalOutput.displayName = "TerminalOutput";

export default TerminalOutput;
