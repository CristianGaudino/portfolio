'use client';

import { useRef, useState } from 'react';
import { TerminalModal } from '@/components/ui/terminal-modal';
import { Dashboard } from '@/components/ui/dashboard';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import TerminalOutput from '@/components/ui/terminal-output';
import { TerminalOutputHandle } from '@/lib/definitions';
import { shareTechMono } from '@/components/ui/fonts';

const COMMANDS = [
    { id: 'about', label: 'about' },
    { id: 'experience', label: 'experience' },
    { id: 'projects', label: 'projects' },
    { id: 'skills', label: 'skills' },
];

export default function Home() {
    const [activeCommand, setActiveCommand] = useState<string | null>(null);
    const termRef = useRef<TerminalOutputHandle>(null);

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
                        <h1 className='mb-2'>cristiano_gaudino/</h1>
                        <div className='space-y-2 ml-2'>
                            {COMMANDS.map(cmd => (
                                <button
                                    key={cmd.id}
                                    // onClick={() => setActiveCommand(cmd.id)}
                                    onClick={() => handleClick()}
                                    className="block w-full text-left hover:text-beige-100 transition-colors"
                                >
                                    &gt;&gt; {cmd.label}
                                </button>
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
