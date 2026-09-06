/**
 * Static, non-secret configuration for the site.
 * Secrets and per-environment values live in env vars — see `.env.example`.
 */
export const SITE_CONFIG = {
    /** Canonical production URL — used for metadata / OG tags. */
    siteUrl: 'https://www.cgaudino.com',

    github: {
        user: 'CristianGaudino',
        profileUrl: 'https://github.com/CristianGaudino',
        repoUrl: 'https://github.com/CristianGaudino/portfolio',
    },

    /** IANA timezone the "host" runs in — drives the clock and derived status. */
    timezone: 'Europe/Dublin',
    timezoneCity: 'Dublin',
    /** Host coordinates — used to show a visitor's distance from the "host". */
    hostGeo: { lat: 53.3498, lon: -6.2603 },

    /** Anchor dates (ISO, UTC midnight assumed). */
    birthDate: '1999-03-26',
    careerStart: '2021-01-01',

    /** Years of formal CS education, shown in the experience readout. */
    academicYears: 4,

    /** Local-hour boundaries for the derived dev status. */
    statusHours: {
        activeStart: 9,
        idleStart: 18,
        offlineStart: 23,
    },

    /** How often client widgets re-poll their endpoints, in ms. */
    poll: {
        nowPlaying: 60_000,
        activity: 15 * 60_000,
        tracker: 10 * 60_000,
    },

    /** Window over which GitHub commit activity is charted. */
    activityDays: 14,
    /** Weeks shown in the contribution heatmap. */
    heatmapWeeks: 14,
} as const;
