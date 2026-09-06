# cgaudino.os — features & backlog

Working log of what's built and what's next. Check things off as they land.

## Done

### Boot & atmosphere
- [x] Typed boot sequence: progress bar, CRT power-on, skip on any key/tap, plays on every load (no persistent skip); static hold under reduced-motion
- [x] CRT overlay — scanlines, vignette, flicker, accent text-glow (all respect `prefers-reduced-motion`)
- [x] Shared `Window` chrome — traffic lights are live: red/amber collapse to the title bar, green maximises to a full-screen overlay (Esc / click-away to restore). Collapse both top panels and the terminal fills the freed vertical space.

### Terminal
- [x] Interactive shell: `help`, `ls`, `cd`, `cat`, `open`, `tree`, `pwd`, `whoami`, `uptime`, `date`, `echo`, `clear`
- [x] Async commands supported (loading placeholder → in-place update): `neofetch`, `stats`, `now`, `faves` print live data
- [x] `sound [on|off]` command + speaker toggle in the title bar — synthesised keystroke clicks, off by default, remembered in localStorage
- [x] Scrollback text is selectable (visible `::selection`, focus-on-click skips when a selection is active)
- [x] Easter eggs: `sudo`, `rm`, `exit`, `hello`
- [x] History (↑/↓), Tab autocomplete, Ctrl+L
- [x] File-tree clicks route through the terminal; command pinned to top of scrollback on run (explicit scroll-intent model, survives async updates)
- [x] `open` shows links, never auto-navigates
- [x] Taller terminal on mobile (`46dvh`)

### System monitor
- [x] Rebuilt as an htop/neofetch-style sectioned readout — SYSTEM / ACTIVITY / NOW
- [x] Reusable primitives (`components/ui/monitor.tsx`): `MonitorSection`, `StatRow`, `Meter`, `MeterList`, `Bars`, `Sparkline`, `Skeleton`, `Equalizer`
- [x] ASCII portrait wired in (`public/ascii_portrait.png`)
- [x] Real build info — `branch@sha` + build age, injected at build time via `next.config.ts`
- [x] Uptime = calendar-accurate time since birth (26 Mar 1999 18:00), ticking every second
- [x] Ireland clock + derived status (timezone-pinned; previously read the *visitor's* clock)
- [x] GitHub activity via cached route handler (`/api/github`): commits/14d bars, language meters, last push, focus skill
- [x] Now-playing row via Spotify (`/api/now-playing`) — shows the current track only, "idle" otherwise (no last-played); degrades to "—" until env configured; `scripts/spotify-token.mjs` does the one-time refresh-token handshake
- [x] reading / watching / playing rows via personal tracker (`/api/tracker`) — degrades until env configured
- [x] `faves` command + data layer: album/film/series/game of the year from the tracker (`year` field), top artist from Spotify (`/api/spotify-top`, `user-top-read` scope)
- [x] `MEDIA` section — mirrors `faves` on the panel; renders only when data exists
- [x] `load` gauge — fake load-average from time-of-day + commits today + music state
- [x] Contribution heatmap (`SITE_CONFIG.heatmapWeeks`) via GraphQL — needs `GITHUB_TOKEN`, hidden otherwise
- [x] `deploy` row — live Vercel deployment state (`/api/deploy`, needs `VERCEL_TOKEN` + `VERCEL_PROJECT_ID`)
- [x] `peer` row — visitor city + km from Dublin, from Vercel geo headers (`/api/peer`, works on Vercel only)
- [x] All dashboard fetches lifted into one `useDashboardData()` hook
- [x] `config.ts` for non-secret config; `.env.example` for the optional integrations

### Content & polish
- [x] Two-column split moved to `lg`; files/dashboard toggle covers everything below that (was cramped 640–1024px)
- [x] File contents: shared `OpenLine` / `Prose` / `ExtLink` / `RunLink` / `Role` helpers, `max-w`/`leading-relaxed`, real paragraphs
- [x] All ad-hoc `text-blue-400` / `text-green-400` / `text-yellow-300` in `definitions.tsx` → `--color-term-*` tokens
- [x] Fixed `bio.txt` printing the wrong filename
- [x] `metadata` — description, OpenGraph/Twitter tags, `metadataBase` (`www.cgaudino.com`); dynamic OG image at `src/app/opengraph-image.tsx`
- [x] Deleted dead `terminal-modal.tsx` + unused types; removed the now-unused `framer-motion` dependency
- [x] Staggered entrance animation on the three panels after boot (respects `prefers-reduced-motion`)

## Backlog

### Waiting on env / external setup
- [ ] Vercel env: `GITHUB_TOKEN` (also unlocks the heatmap), `SPOTIFY_CLIENT_ID`/`SECRET`/`REFRESH_TOKEN` (re-run `spotify-token.mjs` for the `user-top-read` scope), `TRACKER_STATUS_URL`, `VERCEL_TOKEN` + `VERCEL_PROJECT_ID` (deploy row)
- [ ] Add a JSON status endpoint to the personal tracker site (`{ reading, watching, playing, year: { album, film, series, game } }`)

### Nice-to-have
- [ ] True "close" with a dock to reopen (currently red just collapses like amber)
