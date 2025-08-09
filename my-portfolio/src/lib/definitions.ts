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
                message: 'I am a full-stack developer with a love for clean code.' 
            },
            { 
                id: 'contact.info',
                type: 'info',
                message: 'Reach out at: gaudino.cristian@gmail.com' 
            },
        ],
    },
    {
        id: 'experience',
        children: [
            { 
                id: 'resume.pdf', 
                type: 'info', 
                message: 'Opening resume.pdf... (Download or view in new tab coming soon)' 
            },
            { 
                id: 'timeline.json', 
                type: 'info', 
                message: `{
                            "2021": "Joined Company A as Junior Developer",
                            "2023": "Promoted to Full-Stack Developer",
                            "2024": "Launched Antisocial.exe project",
                        }`, 
            },
        ]
    },
    {
        id: 'projects',
        children: [
            { 
                id: 'antisocial.exe', 
                type: 'exe', 
                message: 'Launching Antisocial.exe... A minimalist productivity tool that blocks distractions.' 
            },
            { 
                id: 'train_of_thought.exe', 
                type: 'exe', 
                message: 'Loading Train of Thought... An experimental idea-visualization engine.' 
            },
            { 
                id: 'topdown.js',
                type: 'exe', 
                message: 'Running topdown.js... A browser-based top-down game built with canvas.'
            },
        ]
    },
    {
        id: 'skills',
        children: [
            { 
                id: 'soft_skills.txt', 
                type: 'txt', 
                message: ' Communication\n Problem Solving\n Team Collaboration\n Focus & Initiative' 
            },
            { 
                id: 'tech_skils.txt', 
                type: 'txt', 
                message: 'React, Next.js, TypeScript, Tailwind CSS, Node.js, PostgreSQL, Python, PHP, Git, and more.' 
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
    ],
    // standby: [
    //     "power_saving.bat",
    //     "log_off.txt",
    //     "wind_down.sh",
    //     "low_power_mode.cfg",
    // ],
};