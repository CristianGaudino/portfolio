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