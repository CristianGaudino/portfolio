import { TASKS_BY_STATUS } from "./definitions";

export function toTitleCase(str: string) {
    return str
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

const BIRTH_DATE = new Date("1999-03-26T00:00:00Z");

export function getVersion() {
    const now = new Date();
    const years = now.getUTCFullYear() - BIRTH_DATE.getUTCFullYear();
    const months =
        now.getUTCMonth() - BIRTH_DATE.getUTCMonth() < 0
            ? 12 + now.getUTCMonth() - BIRTH_DATE.getUTCMonth()
            : now.getUTCMonth() - BIRTH_DATE.getUTCMonth();

    return {
        version: `v${years}.${months}`,
    };
}

export function getUptimeInSeconds(): number {
    return Math.floor((Date.now() - BIRTH_DATE.getTime()) / 1000);
}

export function getDevStatus() {
    const hour = new Date().getHours();
    let status = "";
    let color = "";

    // if (hour < 6) {
    //     status = "offline";
    //     color = "text-red-500";
    // } else if (hour < 9) {
    //     status = "booting";
    //     color = "text-yellow-400";
    // } else if (hour < 18) {
    //     status = "active";
    //     color = "text-green-500";
    // } else if (hour < 22) {
    //     status = "idle";
    //     color = "text-blue-400";
    // } else {
    //     status = "standby";
    //     color = "text-orange-400";
    // }

    if (hour < 7) {
        status = "offline";
        color = "text-red-500";
    } else if (hour < 18) {
        status = "active";
        color = "text-green-500";
    } else {
        status = "idle";
        color = "text-yellow-400";
    }

    return { status, color };
}

// Returns professional years rounded to the nearest 0.5
export function getProfessionalYears(): number {
    const startDate = new Date("2021-01-01T00:00:00Z");
    const now = new Date();
    const diffMonths = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    return Math.round((diffMonths / 12) * 2) / 2;
}

export function getTaskByStatus(status: string) {
    const taskList = TASKS_BY_STATUS[status] || ["reading.md"];
    const task = taskList[Math.floor(Math.random() * taskList.length)];
    const pid = Math.floor(Math.random() * 9000 + 1000); // PID 1000–9999
    return { task, pid };
}