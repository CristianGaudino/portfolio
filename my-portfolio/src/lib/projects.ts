/** The project showcase. `featured` projects get the big treatment; the rest are listed smaller. */

export type Host = 'Cloudflare Workers' | 'Vercel';

export type Project = {
    slug: string;
    name: string;
    /** one line: what it is and who it's for */
    tagline: string;
    about: string;
    stack: string[];
    host: Host;
    url: string;
    /** only for public repos */
    repo?: string;
    /** how a visitor can try it right now */
    tryIt: string;
    /** `/projects/<slug>.jpg` exists for every project */
    started: string;
    featured?: boolean;
};

const gh = (name: string) => `https://github.com/CristianGaudino/${name}`;

export const PROJECTS: Project[] = [
    {
        slug: 'how-many',
        name: 'How Many?',
        tagline: 'Stock and profit tracker for Vinted and eBay resellers.',
        about: 'Log what you buy, split a bag’s cost across its items, and see what every sale actually made. Phone-first, with a public store API that other shop fronts read from.',
        stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind 4', 'Neon Postgres', 'Drizzle', 'Clerk', 'Cloudflare R2', 'Playwright'],
        host: 'Cloudflare Workers',
        url: 'https://www.checkhowmany.com',
        tryIt: 'Press “Add your first item”. You can add stock as a guest and only sign up to keep it.',
        started: '2026-10',
        featured: true,
    },
    {
        slug: 'how-much',
        name: 'How Much?',
        tagline: 'Expense and receipt tracker for Irish sole traders.',
        about: 'Snap receipts as you spend, keep them sorted through the year, and hand your accountant a year-end report. The sister product to How Many?, on the same stack.',
        stack: ['Next.js 16', 'React 19', 'TypeScript', 'Neon Postgres', 'Drizzle', 'Clerk', 'Cloudflare R2', 'Playwright'],
        host: 'Cloudflare Workers',
        url: 'https://www.checkhowmuch.com',
        tryIt: 'Open /start and add your first receipt as a guest. No account needed until you save.',
        started: '2026-10',
        featured: true,
    },
    {
        slug: 'checkwork-motors',
        name: 'Checkwork Motors',
        tagline: 'Dealer website demo for Checkwork, my car-dealer web business.',
        about: 'Checkwork builds websites and a stock dashboard for Irish car dealers from the listings they already post on DoneDeal and CarsIreland. Checkwork Motors is the demo dealer: every car and number in it is made up.',
        stack: ['Next.js 16', 'React 19', 'TypeScript', 'Cloudflare D1', 'Drizzle', 'Cloudflare R2', 'Claude API', 'Turnstile'],
        host: 'Cloudflare Workers',
        url: 'https://www.demo.checkwork.ie',
        tryIt: 'Browse stock and send an enquiry as a customer would. The dealer dashboard is shown to dealers on request.',
        started: '2026-11',
        featured: true,
    },
    {
        slug: 'anti-social',
        name: 'anti-social',
        tagline: 'Personal tracker for films, TV, books, games and albums.',
        about: 'Rate and review what you watch, read, play and listen to, and rank things head to head. It also feeds the media panel on this site.',
        stack: ['Next.js 15', 'NextAuth', 'Neon Postgres', 'Tailwind 4', 'TMDB / Spotify / RAWG APIs'],
        host: 'Vercel',
        url: 'https://www.antisocial.cgaudino.com',
        tryIt: 'Sign up and log your first film or album.',
        started: '2025-02',
    },
    {
        slug: 'motorbid',
        name: 'MotorBid',
        tagline: 'Private car auction marketplace for sellers and dealers.',
        about: 'Sellers list a car, an admin approves it, and verified dealers place offers. An AI valuation gives sellers a starting price.',
        stack: ['Next.js 16', 'Clerk', 'Neon Postgres', 'Drizzle', 'Vercel Blob', 'AI SDK', 'Resend'],
        host: 'Vercel',
        url: 'https://motor-bid.vercel.app',
        tryIt: 'Sign up and pick seller or dealer to see each side.',
        started: '2026-04',
    },
    {
        slug: 'train-of-thought',
        name: 'Train of Thought',
        tagline: 'A thinking space for developing ideas with AI.',
        about: 'Capture sparks, branch them into concepts, and work them into structured projects with an AI co-creator.',
        stack: ['Next.js 16', 'Clerk', 'Neon Postgres', 'Drizzle', 'AI SDK'],
        host: 'Vercel',
        url: 'https://www.trainofthought.cgaudino.com',
        repo: gh('train-of-thought'),
        tryIt: 'Press “Start Creating” and sign in.',
        started: '2025-08',
    },
    {
        slug: 'topdown',
        name: 'Topdown Shooter',
        tagline: 'Room-clearing top-down shooter.',
        about: 'Fight through rooms of enemies with a dash and swappable guns, all drawn on an HTML canvas.',
        stack: ['Next.js 16', 'TypeScript', 'Canvas 2D'],
        host: 'Vercel',
        url: 'https://www.topdown.cgaudino.com',
        repo: gh('topdown'),
        tryIt: 'WASD to move, click to shoot.',
        started: '2026-04',
    },
];

export const projectFile = (p: Project) => `${p.slug}.app`;
export const findProject = (slug: string) => PROJECTS.find((p) => p.slug === slug) ?? null;
export const hostDomain = (url: string) => new URL(url).hostname.replace(/^www\./, '');

/** Fired by the `projects` command / file tree; page.tsx opens the showcase window. */
export const OPEN_PROJECTS_EVENT = 'cgaudino:open-projects';
