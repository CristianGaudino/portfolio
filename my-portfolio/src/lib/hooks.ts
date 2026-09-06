'use client';

import { useEffect, useState } from 'react';

export type AsyncState<T> = {
    data?: T;
    loading: boolean;
    error: boolean;
};

/**
 * Fetch JSON from a same-origin endpoint, with optional polling.
 * Never throws — failures surface as `error: true` so callers can degrade gracefully.
 */
export function useJson<T>(url: string, pollMs?: number): AsyncState<T> {
    const [state, setState] = useState<AsyncState<T>>({ loading: true, error: false });

    useEffect(() => {
        let alive = true;

        const load = () =>
            fetch(url)
                .then((r) => (r.ok ? (r.json() as Promise<T>) : Promise.reject(new Error(String(r.status)))))
                .then((data) => {
                    if (alive) setState({ data, loading: false, error: false });
                })
                .catch(() => {
                    if (alive) setState((s) => ({ data: s.data, loading: false, error: true }));
                });

        load();
        if (!pollMs) return () => {
            alive = false;
        };

        const timer = setInterval(load, pollMs);
        return () => {
            alive = false;
            clearInterval(timer);
        };
    }, [url, pollMs]);

    return state;
}
