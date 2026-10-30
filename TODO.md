
## Progress log (latest)
- [x] Blast readability: `--canvas-text/-muted/-link/-danger` tokens, outline + dimmed canvas, retro bg darkened; `node scripts/check-contrast.mjs` passes both themes.
- [~] API Lab at `/lab` (nav link "Lab"): probes ~30 endpoints with your token; uncompiled, run it and read the results.
- [x] Live response shapes captured: docs/spotify-responses.md. Findings: popularity/followers/genres/available_markets still returned (app is grandfathered); top-tracks, new-releases, categories, markets answer; related-artists, recommendations, featured/category playlists 404; audio-features/analysis 403; /me still has `product`; preview_url always null; playlist items expose both `tracks` and `items`.
- [ ] Next: top albums (derived from top tracks), Heat gap polish, Last.fm only if popularity disappears.

## Progress: SCSS, skills, library types (latest)
- [x] Official Angular skill installed in `.agents/skills/angular-developer` (+ `angular-new-app`), `.claude/skills` link, `CLAUDE.md` / `AGENTS.md` with the project rules.
- [x] Styles migrated to SCSS: `src/styles.scss` + `_tokens/_mixins/_base`, every component now has its own `.html` and `.scss` (nested, mixins); `angular.json` uses scss + `includePaths`; contrast checker reads `_tokens.scss` and lints `.scss`. All SCSS compiles with Sass.
- [x] Skill compliance: `@Service()`, `httpResource` reads via `SpotifyApi.req.*`, `hasValue()` guards through `safe()`, Signal Forms + `debounce` in Search, TasteService is six resources (no ensure/reset), no setTimeout/setInterval left.
- [x] Home toggle: Music (full heat) | Podcasts | Audiobooks; `/show/:id` and `/audiobook/:id` detail pages. No heat for podcasts/books: Spotify gives no popularity or play history, so they show library facts.
- [x] Compile found a real bug: `icon.html` carried an embedded metadata blob that Angular rejects (removed).
- [ ] Confirm show/episode/audiobook/chapter shapes: run `/lab`, "Download shapes", and share the file; then promote the "documented" types in `models.ts` to verified.
- [ ] Optional: scope `user-read-playback-position` (re-login) for resume points; check the SDK can play show/audiobook contexts.

## Progress: Heat Panel + Soloist (latest)
- [x] `/panel` (public route, nav "Panel"): simulated 64x32 LED board (one-line title/artist that scroll together when too long, small record as the progress meter (rim fills clockwise), five layouts switchable on the page (cover as dim backdrop, flip names/cover screens, names on top small/large, cover beside names); previews in docs/; pick one and delete the rest, no simulated beat; layout is a pure function in `core/visuals/board.ts` so a Pi script can reuse it; preview image in `docs/heat-panel-preview.png`) with demo mode and a read-only Soloist WebSocket feed. Files: `core/soloist/{soloist,soloist.service,demo}.ts`, `core/visuals/{led-panel,pixel-font}.ts`, `features/panel/*`, `--led-*` tokens.
- [x] Soloist client is read-only (only `get_state` / `get_queue`), loopback-only (`parseAddress`), validates every message, only accepts https `*.scdn.co` cover URLs. Reducer checked with a Node script; `ngc` type/template check, Sass and contrast pass.
- [ ] Not yet run in a browser: `ng serve`, open `/panel`, check demo, then start Soloist with `--ws 127.0.0.1:9090` and switch to "Soloist". Unverified: whether i.scdn.co allows cross-origin cover reads (falls back to the record if not).
- [x] Panel "My top artists" mode: one track per top artist (from TasteService), shuffled, 15 s each on a simulated clock, real covers shrunk to 32x32 (cover CORS from i.scdn.co still unverified; falls back to the record). Full "Title by Artist" shown under the board.
- [ ] Next: a Node script on a Pi reusing `soloist.ts`, `board.ts`, `LedPanel` and the fonts to drive a real panel (the Pi fetches the cover itself, so no browser CORS limit).
- [x] Search now includes playlists (any public playlist, metadata only: cover, name, owner, song count; tap to play, "Open in Spotify" link). Untested: whether playing someone else's playlist works, and which editorial playlists the API hides.
- [x] Phone layout: sidebar hidden under 900px with a new /library page (nav link), two-row top bar, 100dvh shell, smaller page padding, panel page no longer overflows sideways.
- [x] Phone shelves/grids (<640px) have two styles, switched by the "Rows: swipe / list" button in the player bar (phones only; `LayoutService`, `data-shelves` on <html>, `list-mode` mixin): swipe (default) = only the strip scrolls, no scrollbar, snaps, bleeds to the screen edge so the next item peeks; list = vertical list of compact rows with small art. Pick one and delete the other when decided. Checked home, podcasts, audiobooks, search, album, artist, show, audiobook, library, lab and panel at 375px: no page or element scrolls sideways.
- [ ] Not checked on a phone: the player bar when playback works (in the built-in browser it shows "Spotify rejected the login for playback"), and the "Flip"/backdrop panel layouts at phone size.
