'use client';

import { useEffect, useRef, useState } from 'react';
import { TerminalModal } from '@/components/ui/terminal-modal';
import { Dashboard } from '@/components/ui/dashboard';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import TerminalOutput from '@/components/ui/terminal-output';
import { COMMANDS, TerminalOutputHandle } from '@/lib/definitions';
import { shareTechMono } from '@/components/ui/fonts';

export default function Home() {
    const [activeCommand, setActiveCommand] = useState<string | null>(null);
    const termRef = useRef<TerminalOutputHandle>(null);
    const [expandedCommand, setExpandedCommand] = useState<string | null>(null);

    useEffect(() => {
    if (termRef.current) {
        termRef.current.print(
            <>
                <span className="">[boot sequence initialized...]</span>
                <br />
                <div className="text-accent-med ms-5">loading cgaudino.os</div>
                <div className="text-accent-med ms-5">mounting directories</div>
                <div className="text-accent-med ms-5">system <span className='text-green-400'>online</span></div>
                <div className="mt-2 ms-5">
                    Welcome, click a folder to explore the filesystem.
                </div>
            </>
        );
    }
}, []);

    const toggleCommand = (id: string) => {
        setExpandedCommand(prev => (prev === id ? null : id));
    };

    const handleClick = () => {
        termRef.current?.print(
            <>
                This is a message with a{" "}
                <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-400">
                    link
                </a>
                .
            </>
        );
    };

    return (
        <>
            <div className={`min-h-screen flex flex-col bg-beige-800 text-beige-300 ${shareTechMono.variable} font-primary`}>
                <main className="flex-grow flex px-4 py-6 gap-4">
                    <div className="w-1/2">
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
                                                    termRef.current?.print(
                                                    <span className="">{child.message}</span>
                                                    );
                                                } else {
                                                    termRef.current?.print(
                                                    <span className="">opening {child.id}...</span>
                                                    );
                                                    // You can later add type-specific behavior here
                                                }
                                                }}
                                                className="text-sm text-beige-400 hover:text-beige-100 block text-left"
                                            >
                                                &gt; {child.id}
                                            </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-1/2 flex justify-end self-start me-2">
                        <Dashboard/>
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
        </>
    );
}
