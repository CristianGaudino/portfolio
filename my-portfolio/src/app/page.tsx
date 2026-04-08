'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Dashboard } from '@/components/ui/dashboard';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import TerminalOutput from '@/components/ui/terminal-output';
import { COMMANDS, TerminalOutputHandle } from '@/lib/definitions';
import { shareTechMono } from '@/components/ui/fonts';
import { BsFileEarmarkCode, BsFileEarmarkPdf, BsFileEarmarkPerson, BsFileEarmarkText } from 'react-icons/bs';

type VisibleItem =
    | { id: string; type: 'folder' }
    | { id: string; type: 'child'; folderId: string };

export default function Home() {
    const termRef = useRef<TerminalOutputHandle>(null);
    const [expandedCommand, setExpandedCommand] = useState<string | null>(null);
    const [xsView, setXsView] = useState<'files' | 'dashboard'>('files');
    const [focusedId, setFocusedId] = useState<string | null>(null);

    useEffect(() => {
        if (termRef.current) {
            termRef.current.print(
                <>
                    <span className="text-purple-500">[boot sequence initialized...]</span>
                    <div className="text-purple-500">cgaudino.os <span className='text-green-400'>online</span></div>
                    <div className="text-purple-400">Welcome, click a folder to explore the filesystem.</div>
                    <div className="text-yellow-600 text-xs">Note: some information on this site may be outdated.</div>
                </>
            );
        }
    }, []);

    const toggleCommand = (id: string) => {
        setExpandedCommand(prev => (prev === id ? null : id));
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
                    if (child?.message) termRef.current?.print(child.message);
                }
            } else if (e.key === 'Escape') {
                setFocusedId(null);
            }
        };

        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [focusedId, visibleItems]);

    return (
        <div className={`h-screen flex flex-col overflow-hidden bg-beige-800 text-beige-300 ${shareTechMono.variable} font-primary`}>

            {/* Mobile toggle */}
            <div className="sm:hidden shrink-0 bg-beige-800 py-3 px-4 flex justify-center gap-4 border-b border-beige-700">
                <button
                    onClick={() => setXsView('files')}
                    className={`px-4 py-2 rounded ${xsView === 'files' ? 'bg-purple-600 text-beige-200' : 'bg-purple-900 text-purple-300'}`}
                >
                    Files
                </button>
                <button
                    onClick={() => setXsView('dashboard')}
                    className={`px-4 py-2 rounded ${xsView === 'dashboard' ? 'bg-purple-600 text-beige-200' : 'bg-purple-900 text-purple-300'}`}
                >
                    Dashboard
                </button>
            </div>

            <main className="flex-1 overflow-y-auto min-h-0 flex px-4 py-6 gap-4">
                {/* File structure */}
                <div className={`w-full sm:w-1/2 ${xsView === 'files' ? 'block' : 'hidden'} sm:block`}>
                    <h1 className='text-xl mb-2'>/cristiano_gaudino</h1>
                    <div className='space-y-2 ml-2'>
                        {COMMANDS.map(cmd => (
                            <div key={cmd.id}>
                                <button
                                    onClick={() => { toggleCommand(cmd.id); setFocusedId(cmd.id); }}
                                    className={`block w-full text-left transition-colors ${
                                        focusedId === cmd.id
                                            ? 'text-purple-300 border-l border-purple-500 pl-1.5 -ml-2'
                                            : 'hover:text-beige-100'
                                    }`}
                                >
                                    &gt;&gt; {cmd.id}
                                </button>

                                {expandedCommand === cmd.id && cmd.children && (
                                    <div className="ml-4 space-y-1 pt-1">
                                        {cmd.children.map(child => (
                                            <button
                                                key={child.id}
                                                onClick={() => {
                                                    setFocusedId(child.id);
                                                    if (child.message) {
                                                        termRef.current?.print(child.message);
                                                    } else {
                                                        termRef.current?.print(
                                                            <span>opening {child.id}...</span>
                                                        );
                                                    }
                                                }}
                                                className={`text-sm block text-left transition-colors ${
                                                    focusedId === child.id
                                                        ? 'text-purple-300 border-l border-purple-500 pl-1.5 -ml-2'
                                                        : 'text-beige-400 hover:text-beige-100'
                                                }`}
                                            >
                                                <span className="flex items-center gap-1">
                                                    {child.type === 'txt' && <BsFileEarmarkText className="text-blue-400" />}
                                                    {child.type === 'info' && <BsFileEarmarkPerson className="text-yellow-400" />}
                                                    {child.type === 'exe' && <BsFileEarmarkCode className="text-green-400" />}
                                                    {child.type === 'pdf' && <BsFileEarmarkPdf className="text-red-400" />}
                                                    {child.id}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dashboard */}
                <div className={`w-full sm:w-1/2 flex justify-center sm:justify-end self-start me-2 ${xsView === 'dashboard' ? 'block' : 'hidden'} sm:flex`}>
                    <Dashboard />
                </div>
            </main>

            <TerminalOutput ref={termRef} />

            <footer className="shrink-0 w-full py-3 bg-beige-900 text-beige-400 flex flex-row items-center justify-between px-8 border-t border-beige-700 font-primary">
                <span>cgaudino.os</span>
                <div className="flex items-center gap-4">
                    <a href="https://github.com/CristianGaudino" className="underline flex items-center" target="_blank" rel="noopener noreferrer">
                        <FaGithub className="text-white mr-2" />
                        GitHub
                    </a>
                    <span>|</span>
                    <a href="https://www.linkedin.com/in/cristiano-gaudino" className="underline flex items-center" target="_blank" rel="noopener noreferrer">
                        <FaLinkedin className="text-blue-400 mr-2" />
                        LinkedIn
                    </a>
                </div>
            </footer>
        </div>
    );
}
