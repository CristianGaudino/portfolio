'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getVersion } from '@/lib/utils';

type BootLine = {
    text: string;
    tag?: 'ok' | 'done';
    /** extra pause (ms) after this line before the next one prints */
    hold?: number;
};

const BOOT_LINES: BootLine[] = [
    { text: 'cgaudino.os', hold: 260 },
    { text: `bootloader ${getVersion().version}  ·  (c) 1999-${new Date().getFullYear()} cristiano gaudino`, hold: 320 },
    { text: '' },
    { text: 'POST ......................... ok', tag: 'ok' },
    { text: 'mounting /home/cristiano', tag: 'ok' },
    { text: 'loading profile.cfg', tag: 'ok' },
    { text: 'starting display-manager.service', tag: 'ok' },
    { text: 'bringing up shell [zsh]', tag: 'ok' },
    { text: 'checking espresso levels ..... nominal', tag: 'ok', hold: 160 },
    { text: 'reticulating splines', tag: 'ok' },
    { text: 'mounting /projects (3 volumes)', tag: 'ok' },
    { text: 'system ready', tag: 'done', hold: 420 },
    { text: '' },
    { text: 'login: cristiano (auto)', hold: 260 },
];

const SESSION_KEY = 'cgaudino.booted';

function prefersReduced() {
    return typeof window !== 'undefined'
        && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function Tag({ tag }: { tag: BootLine['tag'] }) {
    if (!tag) return <span className="inline-block w-[62px]" />;
    const label = tag === 'ok' ? '  ok  ' : ' done ';
    return (
        <span className="text-beige-500">
            [<span className="text-term-green">{label}</span>]
        </span>
    );
}

export function BootScreen({ onDone }: { onDone: () => void }) {
    const [count, setCount] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const [gone, setGone] = useState(false);
    const finished = useRef(false);
    const reduced = useRef(false);

    const finish = useCallback(() => {
        if (finished.current) return;
        finished.current = true;
        try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
        setLeaving(true);
        setTimeout(() => {
            setGone(true);
            onDone();
        }, reduced.current ? 0 : 460);
    }, [onDone]);

    // Skip immediately if we already booted this session, else register skip handlers.
    useEffect(() => {
        reduced.current = !!prefersReduced();
        let skippedEarly = false;
        try {
            if (sessionStorage.getItem(SESSION_KEY) === '1') {
                skippedEarly = true;
                finished.current = true;
                setGone(true);
                onDone();
            }
        } catch { /* ignore */ }
        if (skippedEarly) return;

        const skip = () => finish();
        window.addEventListener('keydown', skip);
        window.addEventListener('pointerdown', skip);
        return () => {
            window.removeEventListener('keydown', skip);
            window.removeEventListener('pointerdown', skip);
        };
    }, [finish, onDone]);

    // Reveal lines one at a time.
    useEffect(() => {
        if (gone || finished.current) return;
        if (count >= BOOT_LINES.length) {
            const t = setTimeout(finish, reduced.current ? 0 : 500);
            return () => clearTimeout(t);
        }
        const line = BOOT_LINES[count];
        const base = reduced.current ? 0 : line.text === '' ? 40 : 95;
        const t = setTimeout(() => setCount((c) => c + 1), base + (reduced.current ? 0 : line.hold ?? 0));
        return () => clearTimeout(t);
    }, [count, gone, finish]);

    if (gone) return null;

    const shown = BOOT_LINES.slice(0, count);
    const progress = Math.round((count / BOOT_LINES.length) * 100);

    return (
        <div
            className={`fixed inset-0 z-[80] flex items-center justify-center bg-black font-primary text-beige-300 transition-opacity duration-300 ${
                leaving ? 'opacity-0' : 'opacity-100'
            }`}
        >
            <div className={`w-full max-w-xl px-6 ${reduced.current ? '' : 'crt-power-on'}`}>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {shown.map((line, i) => (
                        <div key={i} className="flex gap-2">
                            {line.text !== '' && <Tag tag={line.tag} />}
                            <span className={line.tag === 'done' ? 'text-term-green glow-soft' : i < 2 ? 'text-purple-300 glow-soft' : ''}>
                                {line.text}
                            </span>
                        </div>
                    ))}
                    {count < BOOT_LINES.length && (
                        <span className="inline-block h-[1em] w-[0.6em] translate-y-[0.15em] bg-purple-300 cursor-blink" />
                    )}
                </pre>

                <div className="mt-6 h-px w-full bg-beige-700">
                    <div
                        className="h-px bg-purple-400 transition-all duration-150 ease-out glow-soft"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="mt-2 text-[0.7rem] uppercase tracking-[0.25em] text-beige-600">
                    press any key to skip
                </div>
            </div>
        </div>
    );
}
