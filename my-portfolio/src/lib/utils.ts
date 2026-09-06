import { SITE_CONFIG } from "./config";

export function toTitleCase(str: string) {
    return str
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

const BIRTH_DATE = new Date(`${SITE_CONFIG.birthDate}T00:00:00Z`);
const CAREER_START = new Date(`${SITE_CONFIG.careerStart}T00:00:00Z`);

/** Playful version string: years.months lived, e.g. `v27.6`. */
export function getVersion() {
    const now = new Date();
    let years = now.getUTCFullYear() - BIRTH_DATE.getUTCFullYear();
    let months = now.getUTCMonth() - BIRTH_DATE.getUTCMonth();
    if (now.getUTCDate() < BIRTH_DATE.getUTCDate()) months -= 1;
    if (months < 0) {
        years -= 1;
        months += 12;
    }
    return { version: `v${years}.${months}` };
}

export function getCareerUptimeSeconds(): number {
    return Math.floor((Date.now() - CAREER_START.getTime()) / 1000);
}

/** `4y 271d 04:12:33` */
export function formatUptime(totalSeconds: number): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const days = Math.floor(totalSeconds / 86_400);
    const years = Math.floor(days / 365);
    const h = Math.floor((totalSeconds % 86_400) / 3_600);
    const m = Math.floor((totalSeconds % 3_600) / 60);
    const s = totalSeconds % 60;
    return `${years}y ${days % 365}d ${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Relative time like `6h ago`, `3d ago`. */
export function formatRelative(iso: string): string {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 45) return 'just now';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
}

function hourInTimezone(tz: string): number {
    const value = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        hour12: false,
    }).formatToParts(new Date()).find((p) => p.type === 'hour')?.value ?? '0';
    return parseInt(value, 10) % 24;
}

export type DevStatus = 'active' | 'idle' | 'offline';

const STATUS_COLOR: Record<DevStatus, string> = {
    active: 'text-term-green',
    idle: 'text-term-amber',
    offline: 'text-term-red',
};

export function getDevStatus(): { status: DevStatus; color: string } {
    const hour = hourInTimezone(SITE_CONFIG.timezone);
    const { activeStart, idleStart, offlineStart } = SITE_CONFIG.statusHours;

    let status: DevStatus;
    if (hour >= activeStart && hour < idleStart) status = 'active';
    else if (hour >= idleStart && hour < offlineStart) status = 'idle';
    else status = 'offline';

    return { status, color: STATUS_COLOR[status] };
}

/** Wall-clock time in the host timezone, e.g. `14:07`. */
export function getLocalTime(tz: string = SITE_CONFIG.timezone): string {
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date());
}

// Returns professional years rounded to the nearest 0.5
export function getProfessionalYears(): number {
    const now = new Date();
    const diffMonths =
        (now.getUTCFullYear() - CAREER_START.getUTCFullYear()) * 12 +
        (now.getUTCMonth() - CAREER_START.getUTCMonth());
    return Math.round((diffMonths / 12) * 2) / 2;
}
