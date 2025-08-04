'use client';

import { useRef, useState } from 'react';
import { TerminalModal } from '@/components/ui/terminal-modal';
import { Share_Tech_Mono } from 'next/font/google';
import { Dashboard } from '@/components/ui/dashboard';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import TerminalOutput from '@/components/ui/terminal-output';
import { TerminalOutputHandle } from '@/lib/definitions';
 
const shareTechMono = Share_Tech_Mono({
    subsets: ['latin'],
    variable: '--font-share-tech',
    weight: ['400']
});

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
            <div className={`min-h-screen bg-beige-800 text-beige-300 ${shareTechMono.variable} font-primary`}>
                <main className="mx-auto px-4 py-12">
                    <div className="flex gap-8">
                        <div className="space-y-4 min-w-[180px] w-1/2">
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
                        <div className="w-1/2">
                            <Dashboard/>
                        </div>
                    </div>
                    
                </main>

                {activeCommand && (
                    <TerminalModal command={activeCommand} onClose={() => setActiveCommand(null)} />
                )}
                
                <TerminalOutput ref={termRef} />

                <footer className="w-full mt-12 py-6 bg-beige-900 text-beige-400 flex flex-col md:flex-row items-center justify-between px-8 border-t border-beige-700 font-primary">
                    <span className=" tracking-wide mb-4 md:mb-0">cgaudino.os</span>
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
