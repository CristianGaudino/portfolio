'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const KEY = 'cgaudino.sfx';
/** custom event other code (e.g. the `sound` command) can fire to flip the setting */
export const SFX_EVENT = 'cgaudino:sfx';

/** Short synthesised key-click. Off by default; remembered in localStorage. */
export function useKeystrokeSound() {
    const [enabled, setEnabled] = useState(false);
    const ctxRef = useRef<AudioContext | null>(null);
    const enabledRef = useRef(false);
    enabledRef.current = enabled;

    const apply = useCallback((want: boolean) => {
        setEnabled(want);
        try {
            localStorage.setItem(KEY, want ? '1' : '0');
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        try {
            setEnabled(localStorage.getItem(KEY) === '1');
        } catch {
            /* ignore */
        }
        const onEvent = (e: Event) => {
            const detail = (e as CustomEvent<boolean>).detail;
            apply(typeof detail === 'boolean' ? detail : !enabledRef.current);
        };
        window.addEventListener(SFX_EVENT, onEvent);
        return () => window.removeEventListener(SFX_EVENT, onEvent);
    }, [apply]);

    const toggle = useCallback(() => apply(!enabledRef.current), [apply]);

    const play = useCallback(() => {
        if (!enabledRef.current) return;
        try {
            const Ctor =
                window.AudioContext ??
                (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (!Ctor) return;
            const ctx = ctxRef.current ?? (ctxRef.current = new Ctor());
            if (ctx.state === 'suspended') void ctx.resume();

            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(170 + Math.random() * 70, now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.035, now + 0.004);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.045);
        } catch {
            /* ignore */
        }
    }, []);

    return { enabled, toggle, play };
}
