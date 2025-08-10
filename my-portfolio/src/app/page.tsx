'use client';

import { useEffect, useRef, useState } from 'react';
import { TerminalModal } from '@/components/ui/terminal-modal';
import { Dashboard } from '@/components/ui/dashboard';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import TerminalOutput from '@/components/ui/terminal-output';
import { COMMANDS, TerminalOutputHandle } from '@/lib/definitions';
import { shareTechMono } from '@/components/ui/fonts';
import { BsFileEarmarkCode, BsFileEarmarkPdf, BsFileEarmarkPerson, BsFileEarmarkText } from 'react-icons/bs';

export default function Home() {
    const [activeCommand, setActiveCommand] = useState<string | null>(null);
    const termRef = useRef<TerminalOutputHandle>(null);
    const [expandedCommand, setExpandedCommand] = useState<string | null>(null);

    // Track which view to show on xs screens: 'files' or 'dashboard'
    const [xsView, setXsView] = useState<'files' | 'dashboard'>('files');

    useEffect(() => {
        if (termRef.current) {
            termRef.current.print(
                <>
                    <span className="text-purple-500">[boot sequence initialized...]</span>
                    <div className="text-purple-500">cgaudino.os <span className='text-green-400'>online</span></div>
                    <div className="text-purple-400">Welcome, click a folder to explore the filesystem.</div>
                </>
            );
        }
    }, []);

    const toggleCommand = (id: string) => {
        setExpandedCommand(prev => (prev === id ? null : id));
    };

    return (
        <div className={`min-h-screen flex flex-col bg-beige-800 text-beige-300 ${shareTechMono.variable} font-primary`}>
            
            {/* Toggle buttons at top, full width, fixed height with padding */}
            <div className="sm:hidden bg-beige-800 py-3 px-4 flex justify-center gap-4 sticky top-0 z-50 border-b border-beige-700">
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
            <main className="flex-grow flex px-4 py-6 gap-4">
                {/* File structure: visible on sm+, or on xs only if xsView === 'files' */}
                <div className={`w-full sm:w-1/2 ${xsView === 'files' ? 'block' : 'hidden'} sm:block`}>
                    <h1 className='text-xl mb-2'>/cristiano_gaudino</h1>
                    <div className='space-y-2 ml-2'>
                        {COMMANDS.map(cmd => (
                            <div key={cmd.id}>
                                <button
                                    onClick={() => toggleCommand(cmd.id)}
                                    className="block w-full text-left hover:text-beige-100 transition-colors"
                                >
                                    &gt;&gt; {cmd.id}
                                </button>

                                {expandedCommand === cmd.id && cmd.children && (
                                    <div className="ml-4 space-y-1 pt-1">
                                        {cmd.children.map(child => (
                                        <button
                                            key={child.id}
                                            onClick={() => {
                                                if (child.message) {
                                                    termRef.current?.print(child.message);
                                                } else {
                                                    termRef.current?.print(
                                                        <span className="">opening {child.id}...</span>
                                                    );
                                                    // type-specific behaviour can be added here
                                                }
                                            }}
                                            className="text-sm text-beige-400 hover:text-beige-100 block text-left"
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

                <div className={`w-full sm:w-1/2 flex  justify-center sm:justify-end self-start me-2 ${xsView === 'dashboard' ? 'block' : 'hidden'} sm:flex`}>
                    <Dashboard />
                </div>
            </main>

            {activeCommand && (
                <TerminalModal command={activeCommand} onClose={() => setActiveCommand(null)} />
            )}
            
            <TerminalOutput ref={termRef} />

            <footer className="w-full py-3 bg-beige-900 text-beige-400 flex flex-row items-center justify-between px-8 border-t border-beige-700 font-primary">
                <span className="mb-0">cgaudino.os</span>
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
