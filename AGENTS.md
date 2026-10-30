# sdash-v2 ("Heat") — conventions for humans and agents

Spotify dashboard in Angular 22. **Read the official Angular skill before writing code**:
`.agents/skills/angular-developer/SKILL.md` and its `references/` (installed from
https://github.com/angular/skills; `.claude/skills` points at the same folder). Update it with
`npx skills update`. If a rule below disagrees with the skill, the skill wins unless noted.

## Angular rules (from the skill, enforced in review)

- Standalone components (the default), `ChangeDetectionStrategy.OnPush`, zoneless. Signals everywhere:
  `signal`, `computed`, `linkedSignal`, `input()`, `output()`, `model()`, `viewChild()`.
- **Data**: reads use `httpResource` (return `undefined` from the request function to skip a request);
  mutations use `HttpClient`. Fan-out over many ids (`forkJoin`) uses `rxResource`. Never fetch in
  `ngOnInit` or subscribe by hand.
- **`resource.value()` throws in the error state.** Always read through `hasValue()`; in this repo use
  `safe(res)` from `core/resource.ts`. Show failures with `errorText(res.error())`.
- **Effects sparingly**: only to sync to a non-signal API (DOM, router, SDK). Never to propagate state:
  use `computed` / `linkedSignal`.
- **No `setTimeout` / `setInterval`.** Use RxJS `timer`/`interval`/`timeout`, resources, or CSS animation.
- **Forms**: Signal Forms (`@angular/forms/signals`), `[formField]`, `debounce(path.field, ms)`. No
  `null`/`undefined` model values. No reactive/template-driven forms.
- Services: `@Service()` (not `@Injectable`). Expose readonly signals.
- Host bindings via the `host: {}` property, never `@HostBinding`. Self-closing component tags.
  Control flow `@if/@for/@switch`, never `*ngIf`.
- File naming: "intent over role" — `album.ts`, `album.html`, `album.scss` (no `.component`). Services
  keep `*.service.ts`. One component per folder-feature; templates and styles in their own files.

## Styling: SCSS + design tokens (never raw colours)

- Global: `src/styles.scss` → `src/styles/_tokens.scss` (CSS custom properties: palette, semantic
  tokens, themes `heat` and `retro`), `_mixins.scss`, `_base.scss`.
- Components: `styleUrl: './x.scss'` and start with `@use 'mixins' as *;` (`includePaths: src/styles`).
  Nest with `&`, use mixins (`retro`, `blast`, `up()/down()`, `page`, `plain-list`, `shelf`,
  `tile-grid`, `cover`, `line-clamp`, `truncate`, `bevel-out/in`, `focus-ring`).
- **Every colour is a token.** Raw `#hex`/`rgb()`/`hsl()` live only in `_tokens.scss`. Text on the bare
  page uses `--canvas-*` tokens (readable on retro teal and over Blast); `--text*` only inside cards.
- Runtime theming stays CSS custom properties; Sass only helps authoring.
- `npm run check:contrast` must pass (WCAG contrast of token pairs, raw-colour lint, card-colour lint).

## Real data only

Show what Spotify actually returns. Never average or invent a number to fill a gap (album heat shows the
album's own `popularity`). Spotify exposes no popularity / play history for podcasts or audiobooks, so
those views show library facts and say so. Document each verified response shape in
`docs/spotify-responses.md` and type it in `core/spotify/models.ts`; unverified shapes are marked as such.

## Secrets

No secrets in the repo. The Spotify client id is public (PKCE). Anything else goes in untracked local config.

## Verify before you say "done"

1. `npm run check:contrast`
2. `ng build` (or `npx ngc -p tsconfig.app.json --noEmit` for a type + template check)
3. Compile every `.scss` (`sass --load-path=src/styles file.scss`) if you changed styles.
4. When syncing files to another machine, compare checksums (md5) — partial syncs have caused phantom bugs.
