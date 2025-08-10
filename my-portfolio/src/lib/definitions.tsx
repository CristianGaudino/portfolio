import React from 'react';

// Props
export interface TerminalModalProps {
    command: string;
    onClose: () => void;
}

export interface TerminalOutputProps {
    text: string;
}

// Interfaces

export interface FileNode {
    id: string;
    name: string;
    type: FileType;
    url?: string; // for exe links
    content?: string; // for txt/info files
    children?: FileNode[]; // for folders
}

// Types

export type FileType = 'exe' | 'txt' | 'info' | 'dll' | 'folder';

export type TerminalOutputHandle = {
    print: (content: React.ReactNode) => void;
};

export type TerminalLine = {
    id: number;
    time: string;
    content: React.ReactNode;
};

// Const

export const COMMANDS = [
    {
        id: 'about',
        children: [
            {
                id: 'bio.txt',
                type: 'txt',
                message: (
                    <span className="text-beige-200">
                            Cristiano Gaudino is an <span className="text-green-400">Irish</span> software engineer who builds sleek, responsive web applications that are just as elegant under the hood as they are on the surface.
                        
                        <p>
                            He&apos;s fluent in <span className="text-blue-400">Next.js</span>, <span className="text-blue-400">TypeScript</span>, and <span className="text-blue-400">Tailwind CSS</span>, and has a knack for turning complex backend systems into smooth, reliable engines.
                        </p>
                        <p>
                            By day, he works on a <span className="text-yellow-300">product sourcing web platform</span>, weaving together UI/UX design, API integrations, and database wizardry. By night, he often has his head buried in a good book, recharging his creativity one page at a time.
                        </p>
                        <p>
                            Previously, he leveled up data tools at <span className="text-purple-300">ICBF</span>, transforming clunky legacy systems into real-time dashboards used by thousands of Irish farmers and labs. 
                        </p>
                        <p>
                            Cristiano is always up for a good challenge, a clean codebase, and a perfectly brewed espresso.
                        </p>
                    </span>
                )
            },
            { 
                id: 'contact.info',
                type: 'info',
                message: (
                    <>
                        Reach out via email:{" "}
                        <a 
                            href="mailto:gaudino.cristian@gmail.com" 
                            className="underline text-blue-400 hover:text-blue-300"
                        >
                            gaudino.cristian@gmail.com
                        </a>
                    </>
                )
            },
        ],
    },
    {
        id: 'experience',
        children: [
            {
                id: 'resume.pdf',
                type: 'info',
                message: (
                    <>
                        Opening <span className="text-purple-300">resume.pdf</span>...
                        <br />
                        <a
                            href="/resume.pdf"
                            download
                            className="underline text-blue-400 hover:text-blue-300"
                        >
                            Click here to download
                        </a>
                        {" "}or{" "}
                        <a
                            href="/resume.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-400 hover:text-blue-300"
                        >
                            view in browser
                        </a>.
                    </>
                )
            },
            { 
                id: 'timeline.json', 
                type: 'info', 
                message: (
                    <pre className="text-green-300">
                        {`{
                            "2021": "Joined Company A as Junior Developer",
                            "2023": "Promoted to Full-Stack Developer",
                            "2024": "Launched Antisocial.exe project",
                            "Present": "Engineering modern automotive web platform"
                        }`}
                    </pre>
                )
            },
        ]
    },
    {
        id: 'projects',
        children: [
            { 
                id: 'antisocial.exe', 
                type: 'exe', 
                message: (
                    <>
                        <span className=''>
                            anti-social{' '}
                            <a
                                href="https://antisocial.cgaudino.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400"
                            >
                                [RUN]
                            </a>
                        </span>
                        <p className="text-beige-300">
                            Anti-social is an anti-social media platform designed to provide users with a non-addictive, scrollable feed based on expressed interests across different forms of media.
                        </p>
                        <p className="text-purple-500">
                            This platform is still in development; however, a working prototype is available.
                        </p>
                    </>
                )
            },
            { 
                id: 'topdown.js',
                type: 'exe', 
                message: (
                    <>
                        <span>
                            topdown.js <span className="text-red-400 cursor-not-allowed">[RUN]</span>
                        </span>
                        <p className="text-beige-300">
                            A browser-based top-down game built with HTML5 canvas, featuring dynamic enemy AI and procedurally generated levels.
                        </p>
                        <p className="text-purple-500">
                            Currently in development and not publicly available.
                        </p>
                    </>
                )
            },
            { 
                id: 'train_of_thought.exe', 
                type: 'exe', 
                message: (
                    <>
                        <span>
                            train_of_thought.exe <span className="text-red-400 cursor-not-allowed">[RUN]</span>
                        </span>
                        <p className="text-beige-300">
                            Train of Thought is an experimental idea-visualization engine, designed to map and connect concepts in real-time.
                        </p>
                        <p className="text-purple-500">
                            Currently in development and not publicly available.
                        </p>
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
                    <ul className="list-disc ml-5 text-green-300">
                        <li>Clear Communication</li>
                        <li>Problem Solving</li>
                        <li>Team Collaboration</li>
                        <li>Focus &amp; Initiative</li>
                        <li>Adaptability</li>
                    </ul>
                )
            },
            { 
                id: 'tech_skils.txt', 
                type: 'txt', 
                message: (
                    <>
                        <span className="text-blue-400">Frontend:</span> React, Next.js, TypeScript, Tailwind CSS  
                        <br />
                        <span className="text-blue-400">Backend:</span> Node.js, PostgreSQL, PHP, Python  
                        <br />
                        <span className="text-blue-400">Other:</span> Git, Agile Development, API Design
                    </>
                )
            },
        ]
    },
];

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

export const TASKS_BY_STATUS: Record<string, string[]> = {
    offline: [
        "hibernate.sys",
        "dream.img",
        "shutdown.log",
        "rem_cycle.mp4",
    ],
    // booting: [
    //     "boot_sequence.sh",
    //     "loading_env.ts",
    //     "calibrating_focus.cfg",
    //     "wake_up_routine.exe",
    // ],
    active: [
        "deploy.sh",
        "code_review.js",
        "building_project.tsx",
        "debug_logs.txt",
        "writing_docs.md",
        "task_manager.cpp",
    ],
    idle: [
        "hydration.exe",
        "scroll_feed.py",
        "refactor_idea.txt",
        "ambient_lofi.mp3",
        "window_gaze.task",
        "power_saving.bat",
        "low_power_mode.cfg",
        "reading.exe",
    ],
    // standby: [
    //     "power_saving.bat",
    //     "log_off.txt",
    //     "wind_down.sh",
    //     "low_power_mode.cfg",
    // ],
};