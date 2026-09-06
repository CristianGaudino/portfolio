# cgaudino.os — features & backlog

Working log of what's built and what's next. Check things off as they land.

## Done

### Boot & atmosphere
- [x] Typed boot sequence: progress bar, CRT power-on, skip-on-keypress, once-per-session
- [x] CRT overlay — scanlines, vignette, flicker, accent text-glow (all respect `prefers-reduced-motion`)
- [x] Shared `Window` chrome (traffic lights + title) on every panel

### Terminal
- [x] Interactive shell: `help`, `ls`, `cd`, `cat`, `open`, `tree`, `pwd`, `whoami`, `uptime`, `date`, `echo`, `clear`
- [x] Easter eggs: `sudo`, `rm`, `exit`, `hello`
- [x] History (↑/↓), Tab autocomplete, Ctrl+L
- [x] File-tree clicks route through the terminal; command pinned to top of scrollback on run
- [x] `open` shows links, never auto-navigates

### System monitor
- [x] Rebuilt as an htop/neofetch-style sectioned readout — SYSTEM / ACTIVITY / NOW
- [x] Reusable primitives (`components/ui/monitor.tsx`): `MonitorSection`, `StatRow`, `Meter`, `MeterList`, `Bars`, `Sparkline`, `Skeleton`, `Equalizer`
- [x] ASCII portrait wired in (`public/ascii_portrait.png`)
- [x] Real build info — `branch@sha` + build age, injected at build time via `next.config.ts`
- [x] Career uptime, ticking every second
- [x] Dublin-pinned clock + derived status (previously read the *visitor's* clock)
- [x] GitHub activity via cached route handler (`/api/github`): commits/14d bars, language meters, last push, focus skill
- [x] Now-playing row via Spotify (`/api/now-playing`, currently-playing → recently-played fallback) — degrades to "—" until env configured; `scripts/spotify-token.mjs` does the one-time refresh-token handshake
- [x] reading / watching / playing rows via personal tracker (`/api/tracker`) — degrades until env configured
- [x] `config.ts` for non-secret config; `.env.example` for the optional integrations

### Content & polish
- [x] Two-column split moved to `lg`; files/dashboard toggle covers everything below that (was cramped 640–1024px)
- [x] File contents: shared `OpenLine` / `Prose` / `ExtLink` / `RunLink` / `Role` helpers, `max-w`/`leading-relaxed`, real paragraphs
- [x] All ad-hoc `text-blue-400` / `text-green-400` / `text-yellow-300` in `definitions.tsx` → `--color-term-*` tokens
- [x] Fixed `bio.txt` printing the wrong filename
- [x] `metadata` — description, OpenGraph/Twitter tags, `metadataBase`; dynamic OG image at `src/app/opengraph-image.tsx`

## Backlog

### Integrations / infra
- [ ] Populate Vercel env: `GITHUB_TOKEN`, `SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET`/`SPOTIFY_REFRESH_TOKEN`, `TRACKER_STATUS_URL`
- [ ] Add a JSON status endpoint to the personal tracker site (`{ reading, watching, playing }`)
- [ ] Vercel deploy-status row — the site monitoring itself
- [ ] Peer info from request headers (visitor city + distance from Dublin)

### System monitor
- [ ] Composite "system load" gauge (time-of-day + commit activity + now-playing)
- [ ] Contribution heatmap (last ~12 weeks) as a grid
- [ ] "processes" table from recent GitHub repos (name, language, last-touched), repo-id as PID

### Terminal
- [ ] Async commands so `neofetch` / `stats` / `now` can print live monitor data
- [ ] `theme` command — green / amber / purple CRT palettes
- [ ] Optional muted keystroke SFX (off by default)

### Content & polish
- [ ] Confirm `SITE_CONFIG.siteUrl` (`https://cgaudino.com`) is the real production URL
- [ ] Entrance / stagger animation on first paint after boot
- [ ] Draggable / resizable windows
- [ ] `terminal-modal.tsx` is now unused/stale (old placeholder copy) — delete or repurpose
