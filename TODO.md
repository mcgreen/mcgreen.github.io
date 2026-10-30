
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
