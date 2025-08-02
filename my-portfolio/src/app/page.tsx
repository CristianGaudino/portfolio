'use client';

import Head from 'next/head';
import { useState } from 'react';
// import { Header } from '@/components/Header';
// import { Footer } from '@/components/Footer';
import { TerminalModal } from '@/components/ui/terminal-modal';
import { Share_Tech_Mono } from 'next/font/google';
 
const shareTechMono = Share_Tech_Mono({
    subsets: ['latin'],
    variable: '--font-share-tech',
    weight: ['400']
});

const COMMANDS = [
    { id: 'about', label: '>> about' },
    { id: 'experience', label: '>> experience' },
    { id: 'projects', label: '>> projects' },
    { id: 'social', label: '>> socials' },
];

export default function Home() {
    const [activeCommand, setActiveCommand] = useState<string | null>(null);

    return (
        <>
            <Head>
                <title>Cristiano Gaudino | Portfolio</title>
                <meta name="description" content="" />
            </Head>
            <div className={`min-h-screen bg-beige-800 text-beige-300 ${shareTechMono.variable}`}>
                {/* <Header /> */}
                <main className="mx-auto px-4 py-12 font-primary">
                    <div className="space-y-4">
                        {COMMANDS.map(cmd => (
                            <button
                                key={cmd.id}
                                onClick={() => setActiveCommand(cmd.id)}
                                className="block w-full text-left hover:text-beige-100 transition-colors"
                            >
                                {cmd.label}
                            </button>
                        ))}
                    </div>
                </main>
                {/* <Footer /> */}

                {activeCommand && (
                    <TerminalModal command={activeCommand} onClose={() => setActiveCommand(null)} />
                )}
            </div>
        </>
    );
}
