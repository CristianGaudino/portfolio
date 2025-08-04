import React from 'react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { HiOutlineXMark } from 'react-icons/hi2';
import { toTitleCase } from '@/lib/utils';
import { TerminalModalProps } from '@/lib/definitions';

const contentMap: Record<string, React.ReactElement> = {
    about: (
        <div>I'm a software developer with 8 years of experience (4 professional, 4 academic).</div>
    ),
    experience: (
        <div>
            <ul className="space-y-1">
                <li>2020 — BSc Computer Science, University of Somewhere</li>
                <li>2021 — Junior Developer, SoftCo Inc.</li>
                <li>2022 — Developer, Startify Ltd.</li>
                <li>2023 — Senior Engineer, CloudStuff.io</li>
            </ul>
        </div>
    ),
    projects: (
        <div>
            <ul className="space-y-2">
                <li>
                    <span className="font-semibold">anti-social</span> - <a href="https://antisocial.cgaudino.com" className="text-green-300" target="_blank">[RUN]</a>
                </li>
                <li>
                    <span className="font-semibold">train-of-thought</span> - <a className="text-red-400 cursor-not-allowed" target="_blank">[RUN]</a>
                </li>
                <li>
                    <span className="font-semibold">viz-stack-cli</span> - <a className="text-red-400 cursor-not-allowed" target="_blank">[RUN]</a>
                </li>
            </ul>
        </div>
    ),
    social: (
        <div className='flex items-center gap-4 mx-2'>
            <a href="https://github.com/CristianGaudino" className="underline flex items-center" target="_blank">
                <FaGithub className='text-white mr-2'/>
                GitHub
            </a>
            |
            <a href="https://www.linkedin.com/in/cristiano-gaudino" className="underline flex items-center" target="_blank">
                <FaLinkedin className='text-blue-400 mr-2'/>
                LinkedIn
            </a>
        </div>
    ),
};

export function TerminalModal({ command, onClose }: TerminalModalProps) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);

    }, [onClose]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        // Close modal if selecting off screen
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleOverlayClick}
            >
                <motion.div
                    className="bg-beige-700 border border-beige-500 rounded-md p-6 w-full max-w-lg text-beige-300 relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">{toTitleCase(command)}</h1>
                        <button
                            onClick={onClose}
                            className="text-beige-500 hover:text-white"
                        >
                            <HiOutlineXMark className="w-6 h-6" />
                        </button>
                    </div>
                    <div className='px-2 pt-3'>
                        {contentMap[command] || <p>Command Not Found</p>}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
