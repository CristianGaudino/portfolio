'use client';

import React, { useEffect, useState } from 'react';

type WindowProps = {
    title: string;
    right?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    bodyClassName?: string;
    onClick?: () => void;
    /** disable the traffic-light actions (leave the dots decorative) */
    staticChrome?: boolean;
    /** notified when the window collapses / reopens (so a fixed-height parent can shrink) */
    onCollapse?: (collapsed: boolean) => void;
};

function Dot({ color, label, onClick }: { color: string; label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`h-2.5 w-2.5 rounded-full ${color} opacity-60 transition-opacity hover:opacity-100`}
        />
    );
}

/**
 * Shared window chrome. The traffic lights are live:
 *  red / amber  → collapse to the title bar (click the title to reopen)
 *  green        → maximise to a full-screen overlay (Esc or click-away to restore)
 */
export function Window({
    title,
    right,
    children,
    className = '',
    bodyClassName = '',
    onClick,
    staticChrome = false,
    onCollapse,
}: WindowProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [maximized, setMaximized] = useState(false);

    useEffect(() => {
        if (!maximized) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMaximized(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [maximized]);

    useEffect(() => {
        onCollapse?.(collapsed);
    }, [collapsed, onCollapse]);

    const toggleCollapse = () => {
        setMaximized(false);
        setCollapsed((c) => !c);
    };
    const toggleMaximize = () => {
        setCollapsed(false);
        setMaximized((m) => !m);
    };

    return (
        <>
            {maximized && (
                <div
                    className="fixed inset-0 z-40 bg-black/60"
                    onClick={() => setMaximized(false)}
                    aria-hidden
                />
            )}
            <div
                onClick={onClick}
                className={[
                    'flex flex-col overflow-hidden rounded-lg border border-beige-600/70 bg-beige-800/90 backdrop-blur-sm window-shadow',
                    maximized ? 'fixed inset-3 z-[45] sm:inset-6' : className,
                    collapsed && !maximized ? 'self-start !h-auto' : '',
                ].join(' ')}
            >
                <div className="flex shrink-0 items-center gap-3 border-b border-beige-700 bg-beige-900/60 px-3 py-2 select-none">
                    <span className="flex gap-1.5">
                        {staticChrome ? (
                            <>
                                <span className="h-2.5 w-2.5 rounded-full bg-term-red/60" />
                                <span className="h-2.5 w-2.5 rounded-full bg-term-amber/60" />
                                <span className="h-2.5 w-2.5 rounded-full bg-term-green/60" />
                            </>
                        ) : (
                            <>
                                <Dot color="bg-term-red" label={collapsed ? 'Reopen' : 'Close'} onClick={toggleCollapse} />
                                <Dot color="bg-term-amber" label={collapsed ? 'Reopen' : 'Minimise'} onClick={toggleCollapse} />
                                <Dot
                                    color="bg-term-green"
                                    label={maximized ? 'Restore' : 'Expand'}
                                    onClick={toggleMaximize}
                                />
                            </>
                        )}
                    </span>

                    <button
                        type="button"
                        onClick={() => collapsed && setCollapsed(false)}
                        className={`text-[0.7rem] uppercase tracking-[0.22em] text-beige-500 ${
                            collapsed ? 'hover:text-beige-300' : 'cursor-default'
                        }`}
                    >
                        {title}
                    </button>

                    {right && <span className="ml-auto">{right}</span>}
                </div>

                <div className={`min-h-0 flex-1 ${collapsed ? 'hidden' : ''} ${bodyClassName}`}>{children}</div>
            </div>
        </>
    );
}
