# sdash v2 ("Heat")

Fresh Angular 22 build of the Spotify dashboard. See `TODO.md` for the plan and
`docs/spotify-api-notes.md` for what the Spotify API offers now.

## First run

1. Use Node `^22.22.3`, `^24.15.0` or `^26` (Angular 22 requirement). Check with `node -v`.
2. `npm install`
3. `npm start`, then open **http://127.0.0.1:4200/** (not `localhost`: Spotify no longer accepts it).
4. In the Spotify Developer Dashboard, the app must list the redirect URI
   `http://127.0.0.1:4200/login` (already registered for v1).

The design kit is at `/kit` and works without logging in.

## Status

Type- and template-checked with the real Angular compiler (`ngc`) and every `.scss` file compiled
with Sass. A full `ng build` has not been run by the author's tooling (esbuild's native binary is
platform-specific), so run `npm install` (adds `@angular/forms`) then `npm start` and report any error.

## Conventions

Read `CLAUDE.md` (also `AGENTS.md`). The official Angular skill lives in `.agents/skills/angular-developer`
(`.claude/skills` points at it). Short version: signals + resources (`httpResource` for reads, guard
`value()` with `hasValue()`), `@Service()`, Signal Forms, no `setTimeout`, effects sparingly, SCSS with
design tokens only (no raw colours outside `_tokens.scss`).

## Layout

```
src/styles.scss       global entry: @use tokens + base
src/styles/           _tokens.scss (palette + semantic tokens + themes), _mixins.scss, _base.scss
src/app/core/         auth (PKCE), spotify API client (req.* for httpResource), player, theme, taste (top lists), heat maths
src/app/shared/ui/    record, meter, icon, player-bar, sidebar, cards, media-row
src/app/features/     login, home (Music / Podcasts / Audiobooks toggle), album, artist, show, audiobook, search, lab, kit
```


## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` builds on every push to `main` and publishes to
`https://<user>.github.io/<repo>/`. One-time: repo Settings > Pages > Source = "GitHub Actions".
Add `https://<user>.github.io/<repo>/login` to the Redirect URIs in the Spotify Developer Dashboard
(the dev URI `http://127.0.0.1:4200/login` stays). Nothing secret is built in: the client id is public (PKCE).
