'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { PROJECTS, hostDomain, projectFile, type Project } from '@/lib/projects';

const featured = PROJECTS.filter((p) => p.featured);
const others = PROJECTS.filter((p) => !p.featured);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[6.5rem_1fr] gap-x-3">
            <dt className="text-purple-400">{label}</dt>
            <dd className="min-w-0 text-beige-200">{children}</dd>
        </div>
    );
}

function Stack({ items }: { items: string[] }) {
    return (
        <ul className="flex flex-wrap gap-1.5">
            {items.map((s) => (
                <li key={s} className="rounded-sm border border-term-blue/35 px-1.5 text-[0.8rem] text-term-blue">
                    {s}
                </li>
            ))}
        </ul>
    );
}

function Links({ p, compact }: { p: Project; compact?: boolean }) {
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={compact
                    ? 'text-term-green underline underline-offset-2 hover:opacity-80'
                    : 'rounded-sm border border-term-green/60 bg-term-green/10 px-3 py-1 text-term-green transition-colors hover:bg-term-green/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-term-green'}
            >
                {compact ? 'open' : `Open ${p.name}`} ↗
            </a>
            {p.repo ? (
                <a href={p.repo} target="_blank" rel="noopener noreferrer" className="text-beige-400 underline underline-offset-2 hover:text-beige-100">
                    source ↗
                </a>
            ) : (
                <span className="text-beige-500">source is private</span>
            )}
        </div>
    );
}

function Shot({ p, sizes }: { p: Project; sizes: string }) {
    return (
        <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            className="block self-start overflow-hidden rounded-md border border-beige-600 transition-[border-color] hover:border-purple-400"
        >
            <Image
                src={`/projects/${p.slug}.jpg`}
                alt={`${p.name} home page`}
                width={1280}
                height={800}
                sizes={sizes}
                className="h-auto w-full"
            />
        </a>
    );
}

/** Scrolls to `focus` (a project slug) whenever it changes. */
export function ProjectsShowcase({ focus }: { focus: string | null }) {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!focus) return;
        rootRef.current?.querySelector(`#project-${focus}`)?.scrollIntoView({ block: 'start' });
    }, [focus]);

    return (
        <div ref={rootRef} className="mx-auto max-w-6xl space-y-10 p-4 sm:p-6">
            <p className="max-w-[70ch] text-beige-400">
                What I&apos;ve been building lately. Every project below is live: open it and try it yourself.
            </p>

            {featured.map((p) => (
                <article
                    key={p.slug}
                    id={`project-${p.slug}`}
                    className={`scroll-mt-4 grid gap-5 lg:grid-cols-[1.25fr_1fr] lg:items-start ${
                        focus === p.slug ? 'rounded-md ring-1 ring-purple-400/60 ring-offset-8 ring-offset-beige-800' : ''
                    }`}
                >
                    <Shot p={p} sizes="(min-width: 1024px) 640px, 100vw" />
                    <div className="space-y-4">
                        <header>
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                                <h2 className="text-2xl text-purple-200 glow-soft">{p.name}</h2>
                                <span className="text-sm text-beige-500">{projectFile(p)}</span>
                            </div>
                            <p className="mt-1 text-lg leading-snug text-beige-100">{p.tagline}</p>
                        </header>
                        <p className="max-w-[60ch] leading-relaxed text-beige-300">{p.about}</p>
                        <dl className="space-y-2 text-sm">
                            <Field label="built with">
                                <Stack items={p.stack} />
                            </Field>
                            <Field label="hosted on">
                                {p.host} <span className="text-beige-500">({hostDomain(p.url)})</span>
                            </Field>
                            <Field label="try it">{p.tryIt}</Field>
                        </dl>
                        <Links p={p} />
                    </div>
                </article>
            ))}

            <section aria-labelledby="also-built" className="border-t border-beige-700 pt-6">
                <h2 id="also-built" className="mb-4 text-beige-400">
                    Also built
                </h2>
                <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
                    {others.map((p) => (
                        <article
                            key={p.slug}
                            id={`project-${p.slug}`}
                            className={`scroll-mt-4 grid grid-cols-[7.5rem_1fr] gap-3 text-sm ${
                                focus === p.slug ? 'rounded-md ring-1 ring-purple-400/60 ring-offset-4 ring-offset-beige-800' : ''
                            }`}
                        >
                            <Shot p={p} sizes="120px" />
                            <div className="min-w-0 space-y-1.5">
                                <h3 className="text-base text-purple-300">{p.name}</h3>
                                <p className="text-beige-300">{p.tagline}</p>
                                <p className="text-beige-500">
                                    {p.stack.slice(0, 4).join(', ')} on {p.host}
                                </p>
                                <Links p={p} compact />
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
