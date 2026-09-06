import React from 'react';

type WindowProps = {
    title: string;
    right?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    bodyClassName?: string;
    onClick?: () => void;
};

/**
 * Shared window chrome — title bar with traffic lights + a de-emphasised
 * label — so every panel reads as part of the same desktop.
 */
export function Window({ title, right, children, className = '', bodyClassName = '', onClick }: WindowProps) {
    return (
        <div
            onClick={onClick}
            className={`flex flex-col overflow-hidden rounded-lg border border-beige-600/70 bg-beige-800/85 backdrop-blur-sm window-shadow ${className}`}
        >
            <div className="flex shrink-0 items-center gap-3 border-b border-beige-700 bg-beige-900/60 px-3 py-2 select-none">
                <span className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-term-red/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-term-amber/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-term-green/70" />
                </span>
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-beige-500">{title}</span>
                {right && <span className="ml-auto">{right}</span>}
            </div>
            <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
        </div>
    );
}
