#!/usr/bin/env node
/**
 * Contrast checker for the design tokens (WCAG 2.x).
 * Reads src/styles/_tokens.scss, resolves each theme's colours, and checks every
 * text/background pair we ship. Exits non-zero if any pair fails, so it can run in CI.
 *
 *   node scripts/check-contrast.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, '..', 'src', 'styles', '_tokens.scss'), 'utf8');

/** Collects `--name: value;` declarations inside the first block whose selector matches. */
function block(selectorRe) {
  const m = css.match(new RegExp(selectorRe + '([^}]*)\\}', 's'));
  if (!m) throw new Error('block not found: ' + selectorRe);
  const vars = {};
  for (const d of m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[d[1]] = d[2].trim().replace(/\/\*.*?\*\//g, '').trim();
  return vars;
}

const root = block(String.raw`:root\s*\{`);              // raw palette
const heat = { ...root, ...block(String.raw`:root,\s*\[data-theme='heat'\]\s*\{`) };
const retro = { ...heat, ...block(String.raw`\[data-theme='retro'\]\s*\{`) };

function resolve(vars, value, depth = 0) {
  const m = value.match(/^var\((--[\w-]+)\)$/);
  if (m && depth < 8) return resolve(vars, vars[m[1]] ?? '', depth + 1);
  return value;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}
function luminance([r, g, b]) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
function colour(vars, token) {
  const v = resolve(vars, vars[token] ?? token);
  if (!/^#[0-9a-f]{3,6}$/i.test(v)) throw new Error(`${token} did not resolve to a hex colour (got "${v}")`);
  return hexToRgb(v);
}

// [foreground token, background token, minimum ratio, what it is]
const PAIRS = [
  ['--text', '--surface', 4.5, 'text in cards'],
  ['--text-strong', '--surface', 4.5, 'headings in cards'],
  ['--text-muted', '--surface', 4.5, 'muted text in cards'],
  ['--accent-contrast', '--accent', 4.5, 'text on accent buttons'],
  ['--on-status', '--status-ok-bg', 4.5, 'text on green status badges'],
  ['--on-status', '--status-bad-bg', 4.5, 'text on red status badges'],
  ['--on-status-warn', '--status-warn-bg', 4.5, 'text on amber status badges'],
  ['--canvas-link', '--bg', 4.5, 'links on the page background'],
  ['--canvas-danger', '--bg', 4.5, 'error text on the page background'],
  ['--accent', '--surface', 3, 'accent (borders, icons) on cards'],
  ['--canvas-text', '--bg', 4.5, 'bare text on page background'],
  ['--canvas-text-muted', '--bg', 4.5, 'bare muted text on page background'],
];

// Retro-only pairs: tokens that only exist in the retro theme.
const RETRO_PAIRS = [['--lcd-fg', '--lcd-bg', 4.5, 'LCD readout (player times)']];

let failed = 0;
function run(name, vars) {
  console.log(`\n${name}`);
  for (const [fg, bg, min, what] of PAIRS) {
    // Bare text sits on the page background or on the (dimmed) canvas; the canvas is black-ish at worst-case-dark.
    const r = ratio(colour(vars, fg), colour(vars, bg));
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`  ${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (need ${min})  ${what}  [${fg} on ${bg}]`);
  }

  if (name.startsWith('RETRO')) {
    for (const [fg, bg, min, what] of RETRO_PAIRS) {
      const r = ratio(colour(vars, fg), colour(vars, bg));
      const ok = r >= min;
      if (!ok) failed++;
      console.log(`  ${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (need ${min})  ${what}  [${fg} on ${bg}]`);
    }
  }

  // Blast mode: bare text gets a black outline (see --text-outline), so it is judged against
  // black for the outline AND must itself differ from black. Worst case for the glyph = the
  // brightest thing the visualizer draws (pure white).
  const outline = vars['--text-outline'] ?? root['--text-outline'] ?? '';
  const hasOutline = /#000/.test(outline);
  const glyph = colour(vars, '--canvas-text');
  const vsBlack = ratio(glyph, [0, 0, 0]);
  const ok = hasOutline && vsBlack >= 7;
  if (!ok) failed++;
  console.log(`  ${ok ? 'pass' : 'FAIL'}  ${vsBlack.toFixed(2).padStart(5)}:1  (need 7)  blast-mode text vs its black outline  [--canvas-text on #000]`);
}

run('HEAT (modern) theme', heat);
run('RETRO theme', retro);

// Show the bug that motivated --canvas-text, for the record.
const old = ratio(colour(retro, '--text-muted'), colour(retro, '--bg'));
console.log(`\n(for reference) old retro muted text on the teal desktop was ${old.toFixed(2)}:1`);

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
// ---- Source lint (warnings only) ----------------------------------------------------------
// The pairs above test tokens, not how components USE them. Card colours (--text, --text-muted,
// --text-strong) are only safe on a card surface; text sitting directly on the page must use the
// --canvas-* tokens. List every component rule that sets a card colour so a human can confirm
// it really is inside a card (or on its own panel).
import { readdirSync, readFileSync as read, statSync } from 'node:fs';
function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const srcRoot = join(here, '..', 'src', 'app');
const hits = [];
for (const file of walk(srcRoot).filter((f) => /\.(ts|scss)$/.test(f))) {
  read(file, 'utf8').split('\n').forEach((line, i) => {
    if (/\bcolor:\s*var\(--text(-muted|-strong)?\)/.test(line)) hits.push(`${file.replace(srcRoot + '/', '')}:${i + 1}  ${line.trim().slice(0, 90)}`);
  });
}

// Hard rule: raw colours live ONLY in _tokens.scss. Anything else is a failure, so a
// hard-coded colour can't slip into a component. Procedural colours built from a template
// expression (e.g. hsl(${hue} ...) in the visualizer) are exempt: they are computed, not chosen.
const stylesRoot = join(here, '..', 'src', 'styles');
const rawColour = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
const raw = [];
for (const file of [...walk(srcRoot), ...walk(stylesRoot)].filter((f) => /\.(ts|scss)$/.test(f) && !f.endsWith('_tokens.scss'))) {
  read(file, 'utf8').split('\n').forEach((line, i) => {
    if (rawColour.test(line) && !line.includes('${') && !/^\s*(\/\/|\*|\/\*)/.test(line)) raw.push(`${file.replace(join(here, '..') + '/', '')}:${i + 1}  ${line.trim().slice(0, 90)}`);
  });
}
console.log(`\nRaw colours outside _tokens.scss: ${raw.length}`);
for (const r of raw) console.log('  FAIL ' + r);
if (raw.length) failed += raw.length;

console.log(`\nLint: ${hits.length} rule(s) use a card text colour. Confirm each sits on a card/panel, not the bare page:`);
for (const h of hits) console.log('  - ' + h);

process.exit(failed ? 1 : 0);
