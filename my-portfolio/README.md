# cgaudino.os

Cristiano Gaudino's portfolio, built as a small terminal operating system: a file explorer, a live system monitor and a working shell. Live at https://www.cgaudino.com.

- **Projects** — `projects/` opens a showcase of the apps I've built: what each one does, what it's built with, where it's hosted, and how to try it.
- **Terminal** — type `help`. Commands include `ls`, `cd`, `cat`, `open`, `projects`, `neofetch`, `stats`, `now`, `faves`, `travel`.
- **System monitor** — GitHub activity, now playing on Spotify, media tracker, deploy state.
- **Travel atlas** — `travel/atlas.map`.

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
```

Next.js 15 (App Router), React 19, Tailwind CSS 4. Deployed on Vercel. Vercel installs with pnpm, so keep `pnpm-lock.yaml` in sync after any dependency change.

## Optional integrations

Everything works without env vars; each panel degrades to a placeholder. Copy `.env.example` to `.env.local` to turn them on:

| Variable | Unlocks |
| --- | --- |
| `GITHUB_TOKEN` | Higher rate limit + contribution heatmap |
| `SPOTIFY_CLIENT_ID` / `SECRET` / `REFRESH_TOKEN` | Now playing + top artist (run `node scripts/spotify-token.mjs` once for the refresh token) |
| `TRACKER_STATUS_URL` (+ `TRACKER_STATUS_TOKEN`) | Reading / watching / playing + favourites |
| `VERCEL_TOKEN` + `VERCEL_PROJECT_ID` | Live deploy state |

## Where things live

- `src/lib/projects.ts` — the project showcase data. Add a project here.
- `src/lib/definitions.tsx` — the file tree and file contents.
- `src/lib/terminal-commands.tsx` — shell commands.
- `src/lib/config.ts` — non-secret site config.
- `src/lib/travel.ts` — travel data; `scripts/build-world-map.mjs` regenerates the map paths.
- `FEATURES.md` — feature log. Work is tracked as issues on the [Portfolio project board](https://github.com/users/CristianGaudino/projects/11).
