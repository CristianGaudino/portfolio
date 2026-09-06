'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dashboard } from '@/components/ui/dashboard';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import TerminalOutput from '@/components/ui/terminal-output';
import { COMMANDS, TerminalOutputHandle } from '@/lib/definitions';
import { shareTechMono } from '@/components/ui/fonts';
import { BsFileEarmarkCode, BsFileEarmarkPdf, BsFileEarmarkPerson, BsFileEarmarkText } from 'react-icons/bs';
import { Window } from '@/components/ui/window';
import { BootScreen } from '@/components/ui/boot-screen';

type VisibleItem =
    | { id: string; type: 'folder' }
    | { id: string; type: 'child'; folderId: string };

export default function Home() {
    const termRef = useRef<TerminalOutputHandle>(null);
    const [booted, setBooted] = useState(false);
    const [expandedCommand, setExpandedCommand] = useState<string | null>(null);
    const [xsView, setXsView] = useState<'files' | 'dashboard'>('files');
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [filesCollapsed, setFilesCollapsed] = useState(false);
    const [monitorCollapsed, setMonitorCollapsed] = useState(false);
    const [termCollapsed, setTermCollapsed] = useState(false);
    const topAllCollapsed = filesCollapsed && monitorCollapsed;

    const handleBooted = useCallback(() => setBooted(true), []);

    useEffect(() => {
        if (!booted) return;
        termRef.current?.print(
            <>
                <span className="text-purple-300 glow-soft">cgaudino.os</span>{' '}
                <span className="text-term-green">online</span>
                <div className="text-beige-400">
                    type <span className="text-purple-300">help</span> to list commands, or click a folder to browse.
                </div>
            </>,
        );
        termRef.current?.focus();
    }, [booted]);

    const toggleCommand = (id: string) => {
        setExpandedCommand(prev => (prev === id ? null : id));
    };

    const runChild = (folderId: string, childId: string, type: string) => {
        const verb = type === 'exe' ? 'open' : 'cat';
        termRef.current?.run(`${verb} ${folderId}/${childId}`);
    };

    const visibleItems = useMemo<VisibleItem[]>(() => {
        const items: VisibleItem[] = [];
        for (const cmd of COMMANDS) {
            items.push({ id: cmd.id, type: 'folder' });
            if (expandedCommand === cmd.id && cmd.children) {
                for (const child of cmd.children) {
                    items.push({ id: child.id, type: 'child', folderId: cmd.id });
                }
            }
        }
        return items;
    }, [expandedCommand]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const currentIndex = focusedId
                    ? visibleItems.findIndex(i => i.id === focusedId)
                    : -1;
                const nextIndex = e.key === 'ArrowDown'
                    ? (currentIndex < visibleItems.length - 1 ? currentIndex + 1 : 0)
                    : (currentIndex > 0 ? currentIndex - 1 : visibleItems.length - 1);
                setFocusedId(visibleItems[nextIndex]?.id ?? null);
            } else if (e.key === 'Enter' && focusedId) {
                const item = visibleItems.find(i => i.id === focusedId);
                if (!item) return;
                if (item.type === 'folder') {
                    toggleCommand(focusedId);
                } else {
                    const folder = COMMANDS.find(c => c.id === item.folderId);
                    const child = folder?.children?.find(c => c.id === focusedId);
                    if (child) runChild(item.folderId, child.id, child.type);
                }
            } else if (e.key === 'Escape') {
                setFocusedId(null);
            }
        };

        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [focusedId, visibleItems]);

    return (
        <div className={`relative h-screen flex flex-col overflow-hidden bg-beige-900 text-beige-300 ${shareTechMono.variable} font-primary`}>
            <div className="crt-overlay" aria-hidden />
            <div className="crt-vignette" aria-hidden />

            {!booted && <BootScreen onDone={handleBooted} />}

            <div className={`flex h-full flex-col ${booted ? 'crt-power-on' : 'invisible'}`}>
                {/* Files / dashboard toggle — shown until there's room for both side by side */}
                <div className="lg:hidden shrink-0 flex justify-center gap-2 border-b border-beige-700 bg-beige-900 px-4 py-2 text-sm">
                    {(['files', 'dashboard'] as const).map(view => (
                        <button
                            key={view}
                            onClick={() => setXsView(view)}
                            className={`px-3 py-1 uppercase tracking-[0.15em] transition-colors ${
                                xsView === view
                                    ? 'text-purple-300 border-b border-purple-400'
                                    : 'text-beige-500 hover:text-beige-300'
                            }`}
                        >
                            [{view}]
                        </button>
                    ))}
                </div>

                <main
                    className={`flex gap-4 px-4 pt-4 pb-2 ${
                        topAllCollapsed ? 'shrink-0' : 'flex-1 min-h-0 overflow-hidden'
                    }`}
                >
                    {/* File tree */}
                    <Window
                        title="~/cristiano_gaudino"
                        className={`w-full lg:w-1/2 ${xsView === 'files' ? 'flex' : 'hidden'} lg:flex ${booted ? 'enter-a' : ''}`}
                        bodyClassName="overflow-y-auto p-4"
                        onCollapse={setFilesCollapsed}
                    >
                        <div className="space-y-1.5">
                            {COMMANDS.map(cmd => {
                                const open = expandedCommand === cmd.id;
                                return (
                                    <div key={cmd.id}>
                                        <button
                                            onClick={() => { toggleCommand(cmd.id); setFocusedId(cmd.id); }}
                                            className={`flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left transition-colors ${
                                                focusedId === cmd.id
                                                    ? 'bg-purple-700/40 text-purple-200'
                                                    : 'hover:bg-beige-700/40 hover:text-beige-100'
                                            }`}
                                        >
                                            <span className={`text-purple-400 transition-transform ${open ? 'rotate-90' : ''}`}>▸</span>
                                            <span>{cmd.id}/</span>
                                        </button>

                                        {open && cmd.children && (
                                            <div className="ml-3 mt-1 space-y-0.5 border-l border-beige-700 pl-3">
                                                {cmd.children.map(child => (
                                                    <button
                                                        key={child.id}
                                                        onClick={() => { setFocusedId(child.id); runChild(cmd.id, child.id, child.type); }}
                                                        className={`flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left text-sm transition-colors ${
                                                            focusedId === child.id
                                                                ? 'bg-purple-700/40 text-purple-200'
                                                                : 'text-beige-400 hover:bg-beige-700/40 hover:text-beige-100'
                                                        }`}
                                                    >
                                                        {child.type === 'txt' && <BsFileEarmarkText className="shrink-0 text-term-blue" />}
                                                        {child.type === 'info' && <BsFileEarmarkPerson className="shrink-0 text-term-amber" />}
                                                        {child.type === 'exe' && <BsFileEarmarkCode className="shrink-0 text-term-green" />}
                                                        {child.type === 'pdf' && <BsFileEarmarkPdf className="shrink-0 text-term-red" />}
                                                        {child.id}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Window>

                    {/* Dashboard */}
                    <Window
                        title="system-monitor"
                        className={`w-full lg:w-1/2 ${xsView === 'dashboard' ? 'flex' : 'hidden'} lg:flex ${booted ? 'enter-b' : ''}`}
                        bodyClassName="flex overflow-hidden"
                        onCollapse={setMonitorCollapsed}
                    >
                        <Dashboard />
                    </Window>
                </main>

                <div
                    className={`px-4 pb-2 ${booted ? 'enter-c' : ''} ${
                        termCollapsed
                            ? 'shrink-0 h-auto'
                            : topAllCollapsed
                              ? 'flex-1 min-h-0'
                              : 'shrink-0 h-[46dvh] lg:h-72'
                    }`}
                >
                    <TerminalOutput ref={termRef} onCollapse={setTermCollapsed} />
                </div>

                <footer className="shrink-0 flex w-full flex-row items-center justify-between border-t border-beige-700 bg-beige-900 px-8 py-3 text-beige-400">
                    <span className="text-purple-300 glow-soft">cgaudino.os</span>
                    <div className="flex items-center gap-4">
                        <a href="https://github.com/CristianGaudino" className="flex items-center underline transition-colors hover:text-beige-100" target="_blank" rel="noopener noreferrer">
                            <FaGithub className="mr-2 text-white" />
                            GitHub
                        </a>
                        <span className="text-beige-600">|</span>
                        <a href="https://www.linkedin.com/in/cristiano-gaudino" className="flex items-center underline transition-colors hover:text-beige-100" target="_blank" rel="noopener noreferrer">
                            <FaLinkedin className="mr-2 text-term-blue" />
                            LinkedIn
                        </a>
                    </div>
                </footer>
            </div>
        </div>
    );
}
