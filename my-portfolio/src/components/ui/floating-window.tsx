'use client';

import { useEffect } from 'react';

type FloatingWindowProps = {
    title: string;
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

/**
 * Floating panel (travel atlas, project showcase) — visually matches `Window`'s
 * maximised overlay, but is externally controlled (open/close only, no collapse).
 */
export function FloatingWindow({ title, open, onClose, children }: FloatingWindowProps) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} aria-hidden />
            <div className="fixed inset-3 z-[45] flex flex-col overflow-hidden rounded-lg border border-beige-600/70 bg-beige-800/90 window-shadow sm:inset-6">
                <div className="flex shrink-0 items-center gap-3 border-b border-beige-700 bg-beige-900/60 px-3 py-2 select-none">
                    <span className="flex gap-1.5">
                        <button
                            type="button"
                            aria-label="Close"
                            title="Close"
                            onClick={onClose}
                            className="h-2.5 w-2.5 rounded-full bg-term-red opacity-70 transition-opacity hover:opacity-100"
                        />
                        <span className="h-2.5 w-2.5 rounded-full bg-term-amber/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-term-green/60" />
                    </span>
                    <span className="text-[0.7rem] uppercase tracking-[0.22em] text-beige-500">{title}</span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={`Close ${title}`}
                        className="ml-auto text-[0.7rem] text-beige-500 transition-colors hover:text-beige-300"
                    >
                        esc ✕
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-auto">{children}</div>
            </div>
        </>
    );
}
