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
- [x] htop/neofetch-style sectioned readout — SYSTEM (incl. status) + ACTIVITY + MEDIA (NOW section removed; audiod/procs/focus dropped as redundant)
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

### Travel atlas
- [x] `travel/atlas.map` in the file explorer — clicking (or Enter) opens a floating `AtlasWindow` panel with a world map, matching the other windows' chrome
- [x] Static SVG world map (235 countries, 50m resolution — 110m drops small countries like Malta/Singapore entirely) generated once from `world-atlas` TopoJSON + `topojson-client` + `iso-3166-1` via `scripts/build-world-map.mjs`. Split into `world-map-paths.json` (paths, ~1.1MB, lazy-loaded only when the atlas opens via `next/dynamic`) and `world-map-geo.json` (centroid lon/lat, ~8KB, always bundled for the `furthest` stat) — no runtime map deps ship to the client
- [x] `src/lib/travel.ts` — simple `TRAVEL` data file (country, code, visits[], home?, favorite?) + `getTravelStats()`/`describeCountry()`. **Real data filled in** — 21 countries / 53 cities from the user's actual trip list
- [x] Visited countries render in purple (brighter for home / repeat trips), unvisited near-black with thin muted borders
- [x] Hover/click a country → terminal-style status line (`> Spain · 2026 · Mallorca (+3 more trips)`) + legend (`countries: 21 · cities: 53`)
- [x] `travel` terminal command — countries, cities, newest trip (excludes home), top destination (most trips), furthest (haversine from `SITE_CONFIG.hostGeo`), bucket list
- [x] Bucket list — `BUCKET_LIST` in `travel.ts` (Japan, Switzerland, China, New Zealand); a toggle button on the map ("bucket list (4)") shows them in green when not already visited; hover/click tooltip says "Country · bucket list" while the toggle is on
- [x] Map bug-fix round: duplicate `AU` React key (Natural Earth splits some countries — Australia + "Ashmore and Cartier Is." — across multiple features sharing one ISO code; generator now merges by resolved alpha-2 before emitting), map lag (raw 50m topology was ~100k points + hover was driving a full-list React re-render on every `mouseenter`; fixed with `topojson-simplify` down to ~11k points and switching hover to pure CSS `hover:brightness-150`), horizontal lines across the map (Russia/Fiji cross the antimeridian — their rings jumped from lon≈180 to lon≈-180, drawing a straight line across the whole canvas; generator now splits a ring wherever a step exceeds a real border segment), France showing overseas territories (Natural Earth bundles French Guiana/Réunion/Martinique/Guadeloupe into one MultiPolygon; a new `MAINLAND_ONLY` bbox allowlist drops rings outside metropolitan France), map "scale" (switched the projection from equirectangular to Gall-Peters cylindrical equal-area, so relative country *area* is geographically correct), Malta/Singapore rendering as invisible degenerate points (the simplification pass over-simplified very small countries to zero-area shapes; the generator now falls back to unsimplified geometry for any country whose simplified bbox is too small)
- [x] Click-to-zoom — click a country to zoom the map to its bounding box (via `getBBox()`, with padding and a size floor so tiny countries keep geographic context); click again or "‹ world" to zoom back out; zoomed country shows its real visited cities as chips below the map

## Backlog

### Waiting on env / external setup
- [ ] Vercel env: `GITHUB_TOKEN` (also unlocks the heatmap), `SPOTIFY_CLIENT_ID`/`SECRET`/`REFRESH_TOKEN` (re-run `spotify-token.mjs` for the `user-top-read` scope), `TRACKER_STATUS_URL`, `VERCEL_TOKEN` + `VERCEL_PROJECT_ID` (deploy row)
- [ ] Add a JSON status endpoint to the personal tracker site (`{ reading, watching, playing, year: { album, film, series, game } }`)

### Nice-to-have
- [ ] True "close" with a dock to reopen (currently red just collapses like amber)
