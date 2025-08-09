"use client";

import { SKILLS } from "@/lib/definitions";
import { getDevStatus, getProfessionalYears, getTaskByStatus, getUptimeInSeconds, getVersion } from "@/lib/utils";
import { useEffect, useState } from "react";
import { FaArrowsRotate, FaGraduationCap, FaUserTie } from "react-icons/fa6";

export function Dashboard() {
    const [uptime, setUptime] = useState(getUptimeInSeconds());
    const [highlightedSkill, setHighlightedSkill] = useState<string>("");
    const [{ status, color }, setStatus] = useState({ status: "", color: "" });
    const [activeTask, setActiveTask] = useState({ task: "", pid: 0 });
    const { version } = getVersion();

    useEffect(() => {
        const skill = SKILLS[Math.floor(Math.random() * SKILLS.length)];
        setHighlightedSkill(skill);
    }, []);

    useEffect(() => {
        const current = getDevStatus();
        setStatus(current);
        setActiveTask(getTaskByStatus(current.status));
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setUptime((u) => u + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const updater = () => {
            const newStatus = getDevStatus();
            setStatus(newStatus);
            setActiveTask(getTaskByStatus(newStatus.status));
        };

        const timer = setInterval(updater, 60 * 60 * 1000);
        return () => clearInterval(timer);
    }, []);

    const refreshHard = () => {
        let next = highlightedSkill;
        while (next === highlightedSkill) {
            next = SKILLS[Math.floor(Math.random() * SKILLS.length)];
        }
        setHighlightedSkill(next);
    };

    const professionalYears = getProfessionalYears();
    const academicYears = 4;
    const totalYears = academicYears + professionalYears;

    return (
        <div className="p-4 bg-beige-800 text-beige-300 flex flex-col items-center space-y-3 h-full w-full overflow-y-auto rounded-md border border-beige-600 max-w-108">
            <div className="text-lg font-semibold text-purple-300">System Dashboard</div>

            {/* Avatar */}
            <div className="w-24 h-24 bg-purple-700 rounded-sm flex items-center justify-center text-sm text-beige-500">
                IMG
            </div>

            {/* Version & Uptime */}
            <div className="text-sm space-y-1 text-center">
                <div>{version}</div>
                {/* <div className="flex justify-center items-center gap-1">
                    <span className="text-purple-300">Uptime:</span>
                    <span>{uptime.toLocaleString()}s</span>
                </div> */}
            </div>

            {/* Status */}
            <div className="text-sm">
                <span className="text-purple-300 mr-1">Status:</span>
                <span className={`${color}`}>[{status.toUpperCase()}]</span>
            </div>

            {/* Experience */}
            <div className="text-sm flex flex-col items-center space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-purple-300">Experience:</span>
                    <div className="flex items-center gap-1">
                        <span title="Academic" className="flex items-center">
                            <FaGraduationCap className="w-5 mr-1 text-purple-300" /> x{academicYears}
                        </span>
                        <span className="text-purple-500">|</span>
                        <span title="Professional" className="flex items-center">
                            <FaUserTie className="w-5 mr-1 text-purple-300" /> x{professionalYears}
                        </span>
                    </div>
                </div>
                <div className="text-xs text-beige-400">({totalYears} years total)</div>
            </div>

            {/* Last Commit */}
            <div className="text-sm w-full text-center">
                <span className="text-purple-300 mr-1">Last Commit:</span>2025-08-01
            </div>

            {/* Active Process */}
            <div className="text-sm w-full text-center">
                <span className="text-purple-300 mr-1">Active Process:</span>
                {activeTask.task ? (
                    <>
                        {activeTask.task}
                        <br/>
                        <span className="text-purple-500">[PID:{activeTask.pid}]</span>
                    </>
                ) : (
                    <>
                        <span className="text-purple-500">Loading task...</span>
                        <br/>
                        <span className="text-purple-500">[PID: ...]</span>
                    </>
                    
                )}
            </div>

            {/* Highlighted Skill */}
            <div className="w-full">
                <div className="flex items-center justify-between text-xs text-purple-500 mb-1">
                    <span>Highlighted Skill:</span>
                    <button onClick={refreshHard} title="Refresh hard skill" aria-label="Refresh hard skill">
                        <FaArrowsRotate className="w-4 h-4 hover:text-purple-300 transition" />
                    </button>
                </div>
                <div className="w-full h-8 bg-purple-700 rounded flex items-center px-2 text-sm text-purple-300">
                    {highlightedSkill ? (
                        <div>{highlightedSkill}</div>
                    ) : (
                        <div className="animate-pulse text-purple-500">Loading skill...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
