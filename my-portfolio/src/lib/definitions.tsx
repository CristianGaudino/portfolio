import React from 'react';

// Types

export type FileType = 'exe' | 'txt' | 'info' | 'pdf';

export interface CommandFile {
    id: string;
    type: FileType;
    message: React.ReactNode;
    href?: string;
}

export interface CommandFolder {
    id: string;
    children: CommandFile[];
}

export type TerminalOutputHandle = {
    print: (content: React.ReactNode) => void;
    clear: () => void;
    /** Execute a command string as though the user had typed it. */
    run: (command: string) => void;
    focus: () => void;
};

// Shared presentational helpers for file contents — keep colour + rhythm in one place.

const OpenLine = ({ name }: { name: string }) => (
    <span className="text-purple-500">
        Opening <span className="text-purple-300">{name}</span>…
    </span>
);

const Prose = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-1 max-w-[62ch] space-y-2 leading-relaxed text-beige-300">{children}</div>
);

const ExtLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-term-blue underline underline-offset-2 hover:opacity-80"
    >
        {children}
    </a>
);

const RunLink = ({ href }: { href: string }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-term-green hover:opacity-80"
    >
        [RUN]
    </a>
);

const Role = ({ dates, title, org }: { dates: string; title: string; org: string }) => (
    <>
        <span className="text-purple-300">{dates}</span> · <span className="text-term-green">{title}</span> @{' '}
        <span className="text-term-blue">{org}</span>
    </>
);

// Const

export const COMMANDS: CommandFolder[] = [
    {
        id: 'about',
        children: [
            {
                id: 'bio.txt',
                type: 'txt',
                message: (
                    <>
                        <OpenLine name="bio.txt" />
                        <Prose>
                            <p>
                                Cristiano Gaudino is an <span className="text-term-green">Irish</span> software engineer who builds sleek,
                                responsive web applications that are just as elegant under the hood as they are on the surface.
                                He&apos;s fluent in <span className="text-term-blue">Next.js</span>, <span className="text-term-blue">TypeScript</span>,
                                and <span className="text-term-blue">Tailwind CSS</span>, and has a knack for turning complex backend systems
                                into smooth, reliable engines.
                            </p>
                            <p>
                                Currently, he works as an <span className="text-term-amber">Application Developer</span> at SMBC Group.
                                Previously, he built a product and materials sourcing platform at JamJars and leveled up data tools at ICBF,
                                transforming clunky legacy systems into real-time dashboards used by thousands of Irish farmers and labs.
                                By night, he often has his head buried in a good book, recharging his creativity one page at a time.
                            </p>
                            <p>Cristiano is always up for a good challenge, a clean codebase, and a perfectly brewed espresso.</p>
                        </Prose>
                    </>
                )
            },
            {
                id: 'contact.info',
                type: 'info',
                message: (
                    <>
                        Reach out via email:{' '}
                        <ExtLink href="mailto:gaudino.cristian@gmail.com">gaudino.cristian@gmail.com</ExtLink>
                    </>
                )
            },
            {
                id: 'resume.pdf',
                type: 'pdf',
                message: (
                    <>
                        <OpenLine name="resume.pdf" />
                        <br />
                        <ExtLink href="/resume.pdf">view in browser</ExtLink> or{' '}
                        <a href="/resume.pdf" download className="text-term-blue underline underline-offset-2 hover:opacity-80">
                            download
                        </a>
                        .
                    </>
                )
            },
        ],
    },
    {
        id: 'experience',
        children: [
            {
                id: 'education.txt',
                type: 'txt',
                message: (
                    <>
                        <OpenLine name="education.txt" />
                        <div className="mt-1 max-w-[70ch] space-y-3 leading-relaxed">
                            <div>
                                <Role dates="2017 - 2021" title="B.Sc. Computer Science" org="University College Cork" />
                                <ul className="ms-5 list-disc text-beige-300">
                                    <li>Graduated with Second Class Honours (2.1).</li>
                                    <li>Final year thesis: AI-Driven Football Betting System (scored 72%).</li>
                                </ul>
                            </div>
                            <div>
                                <Role dates="2016 - 2017" title="Software Development" org="Kerry College" />
                                <ul className="ms-5 list-disc text-beige-300">
                                    <li>Awarded Distinction in all 9 modules.</li>
                                </ul>
                            </div>
                        </div>
                    </>
                )
            },
            {
                id: 'work_experience.txt',
                type: 'txt',
                message: (
                    <>
                        <OpenLine name="work_experience.txt" />
                        <div className="mt-1 max-w-[70ch] space-y-3 leading-relaxed">
                            <div>
                                <Role dates="Feb 2026 - Present" title="Application Developer" org="SMBC Group" />
                                <ul className="ms-5 list-disc text-beige-300">
                                    <li>Building corporate banking applications using React, Vite, and TypeScript.</li>
                                </ul>
                            </div>
                            <div>
                                <Role dates="Nov 2024 - Nov 2025" title="Full Stack Software Engineer" org="JamJars" />
                                <ul className="ms-5 list-disc text-beige-300">
                                    <li>Built a product and materials sourcing platform with Next.js, TypeScript, Tailwind CSS, and PostgreSQL.</li>
                                    <li>Working in an agile team, delivering functional prototypes under tight deadlines.</li>
                                    <li>Collaborated with stakeholders to turn evolving requirements into technical solutions.</li>
                                </ul>
                            </div>
                            <div>
                                <Role dates="Jul 2023 - Jul 2024" title="Graduate Software Engineer" org="ICBF" />
                                <ul className="ms-5 list-disc text-beige-300">
                                    <li>Optimised a high-volume Oracle database using PL/SQL.</li>
                                    <li>Modernised legacy PHP &amp; JS tools, adding features that grew user base by 1,000+.</li>
                                    <li>Built real-time dashboards reducing critical issue resolution from 12 days to 3.</li>
                                </ul>
                            </div>
                            <div>
                                <Role dates="Nov 2021 - Jul 2023" title="Software Developer" org="Cartwright" />
                                <ul className="ms-5 list-disc text-beige-300">
                                    <li>Developed a responsive car dealership site in React.</li>
                                    <li>Integrated APIs to automate vehicle inventory updates.</li>
                                    <li>Improved search, filtering, and admin tools post-launch.</li>
                                </ul>
                            </div>
                            <div>
                                <Role dates="2020" title="Enterprise Systems Group Intern" org="JRI America Inc." />
                                <ul className="ms-5 list-disc text-beige-300">
                                    <li>Maintained a fleet of Unix/RHEL servers, ensuring stability and compliance.</li>
                                    <li>Developed Ansible/YAML automation scripts to streamline server administration.</li>
                                    <li>Contributed to server migration automation, reducing manual overhead.</li>
                                    <li>Tested scripts and deployment procedures before production release.</li>
                                </ul>
                            </div>
                        </div>
                    </>
                )
            }
        ]
    },
    {
        id: 'projects',
        children: [
            {
                id: 'antisocial.exe',
                type: 'exe',
                href: 'https://www.antisocial.cgaudino.com',
                message: (
                    <>
                        <span>anti-social <RunLink href="https://www.antisocial.cgaudino.com" /></span>
                        <Prose>
                            <p>
                                Anti-social is an anti-social media platform designed to provide users with a non-addictive,
                                scrollable feed based on expressed interests across different forms of media.
                            </p>
                            <p className="text-purple-500">
                                This platform is still in development; however, a working prototype is available.
                            </p>
                        </Prose>
                    </>
                )
            },
            {
                id: 'topdown.ts',
                type: 'exe',
                href: 'https://www.topdown.cgaudino.com',
                message: (
                    <>
                        <span>topdown.ts <RunLink href="https://www.topdown.cgaudino.com" /></span>
                        <Prose>
                            <p>
                                A browser-based top-down game built with HTML5 canvas, featuring dynamic enemy AI and
                                procedurally generated levels.
                            </p>
                        </Prose>
                    </>
                )
            },
            {
                id: 'train_of_thought.exe',
                type: 'exe',
                href: 'https://www.trainofthought.cgaudino.com',
                message: (
                    <>
                        <span>Train of Thought <RunLink href="https://www.trainofthought.cgaudino.com" /></span>
                        <Prose>
                            <p>
                                Train of Thought is an experimental idea-visualization engine, designed to map and connect
                                concepts in real-time.
                            </p>
                        </Prose>
                    </>
                )
            },
        ]
    },
    {
        id: 'skills',
        children: [
            {
                id: 'soft_skills.txt',
                type: 'txt',
                message: (
                    <>
                        <OpenLine name="soft_skills.txt" />
                        <ul className="ms-5 mt-1 list-disc leading-relaxed text-term-green">
                            <li>Clear Communication</li>
                            <li>Problem Solving</li>
                            <li>Team Collaboration</li>
                            <li>Focus &amp; Initiative</li>
                            <li>Adaptability</li>
                        </ul>
                    </>
                )
            },
            {
                id: 'tech_skills.txt',
                type: 'txt',
                message: (
                    <>
                        <OpenLine name="tech_skills.txt" />
                        <div className="mt-1 max-w-[68ch] space-y-1 leading-relaxed">
                            {[
                                ['Languages', 'TypeScript, JavaScript, PHP, PL/SQL, SQL, Python, HTML, CSS'],
                                ['Frontend', 'Next.js, React, Tailwind CSS, Bootstrap 5, JQuery'],
                                ['Backend', 'Node.js, PostgreSQL, Oracle, Laminas PHP'],
                                ['Tools', 'Git, Vercel, Neon'],
                                ['Other', 'Agile Development, AI Development'],
                            ].map(([label, items]) => (
                                <p key={label}>
                                    <span className="inline-block w-28 text-term-blue">{label}:</span>
                                    {items}
                                </p>
                            ))}
                        </div>
                    </>
                )
            },
        ]
    }
];

export const ROOT_DIRS = COMMANDS.map((c) => c.id);

export function findFolder(name: string): CommandFolder | null {
    return COMMANDS.find((c) => c.id === name) ?? null;
}

export function findFile(folder: string, file: string): CommandFile | null {
    return findFolder(folder)?.children.find((ch) => ch.id === file) ?? null;
}

export const SKILLS = [
    "Next.js",
    "TypeScript",
    "React",
    "Tailwind CSS",
    "Node.js",
    "PostgreSQL",
    "Jest",
    "Python",
    "PL/SQL",
    "PHP",
    "MySQL",
    "JavaScript",
    "HTML",
    "CSS",
    "Bootstrap 5",
    "Laminas PHP",
    "JQuery",
    "Oracle",
    "Vercel",
    "Git",
    "Agile Development",
    "AI Development",
];

