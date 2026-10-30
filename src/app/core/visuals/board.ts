import { ART_SIZE, LedPanel, PANEL_H, PANEL_W, Rgb, scale } from './led-panel';
import { LARGE, PixelFont, SMALL, toPanelText } from './pixel-font';

/**
 * The Heat Panel layout, as a pure function of "what is playing". No Angular, no DOM: the web page
 * calls it every frame, and a script on a Raspberry Pi can call it to drive a real LED panel.
 *
 * Layouts:
 *   backdrop    the cover fills the whole board as a dim backdrop; names across the top (large font when
 *               both fit, small otherwise) with an outline; a thin progress line along the bottom
 *   flip        two full-board screens in turn: the names (big), then the cover beside a big progress record
 *   wide-small  names across the top (small font); a 19 px cover and the progress record below
 *   wide-large  the same with the large font: a 15 px cover
 *   side        32x32 cover on the left; names on the right; a small progress record under them
 *
 * Title and artist are the same size and always line up. If either is too wide for its window, both
 * scroll sideways together (same offset, speed and loop), pausing at the start of each loop.
 */

export type Layout = 'backdrop' | 'flip' | 'wide-small' | 'wide-large' | 'side';
type FixedLayout = 'side' | 'wide-large' | 'wide-small';

/** What the board shows: a playing track, or a short status word. */
export type Shown =
  | {
      kind: 'track';
      id: string;
      title: string;
      artist: string;
      durationMs: number;
      positionMs: number;
      playing: boolean;
      /** Milliseconds since this track appeared on the board; drives the scrolling. */
      sinceMs: number;
    }
  | { kind: 'message'; text: string };

export interface Colors {
  body: Rgb;
  off: Rgb;
  title: Rgb;
  artist: Rgb;
  track: Rgb;
}

/** Where the two name lines go: a window (clipped), a font and the top row of each line. */
interface NameBox {
  font: PixelFont;
  textX: number;
  textW: number;
  titleY: number;
  artistY: number;
}

interface Geometry extends NameBox {
  /** Where the cover goes, as a square. */
  cover: { x: number; y: number; size: number };
  /** The progress record. */
  record: { cx: number; cy: number; r: number };
}

/** Title and artist across the top; a cover and the progress record side by side underneath, centred. */
function wide(font: PixelFont, titleY: number, artistY: number, bandY: number, size: number): Geometry {
  const gap = 3;
  const x0 = Math.floor((PANEL_W - (2 * size + gap)) / 2);
  const r = (size - 1) / 2;
  return {
    font,
    textX: 0,
    textW: PANEL_W,
    titleY,
    artistY,
    cover: { x: x0, y: bandY, size },
    record: { cx: x0 + size + gap + r, cy: bandY + r, r },
  };
}

export const LAYOUTS: Record<FixedLayout, Geometry> = {
  side: {
    font: LARGE,
    textX: 33,
    textW: 30,
    titleY: 1,
    artistY: 9,
    cover: { x: 0, y: 0, size: ART_SIZE },
    record: { cx: 47, cy: 24, r: 7 },
  },
  'wide-large': wide(LARGE, 1, 9, 17, 15),
  'wide-small': wide(SMALL, 1, 7, 13, 19),
};

/** Scrolling: wait at the start of each loop, then move at this speed, with this gap between repeats. */
export const HOLD_MS = 2000;
export const SCROLL_PX_PER_S = 10;
const SCROLL_GAP = 16;
/** Brightness of everything while paused. */
const PAUSED_DIM = 0.45;

/** Fits `raw` into a window by cutting it and ending with "..". Used when motion is turned off. */
export function truncate(raw: string, f: PixelFont = LARGE, width = LAYOUTS.side.textW): string {
  const text = toPanelText(raw);
  const max = Math.floor((width + 1) / f.advance);
  return text.length <= max ? text : text.slice(0, Math.max(0, max - 2)).trimEnd() + '..';
}

/** How far both lines have scrolled left `sinceMs` after the track appeared, for a loop `span` px long. */
export function scrollOffset(sinceMs: number, span: number): number {
  const cycle = HOLD_MS + (span / SCROLL_PX_PER_S) * 1000;
  const phase = Math.max(0, sinceMs) % cycle;
  return phase < HOLD_MS ? 0 : Math.floor(((phase - HOLD_MS) / 1000) * SCROLL_PX_PER_S);
}

function nameLines(p: LedPanel, title: string, artist: string, g: NameBox, c: Colors, dim: number, sinceMs: number, animate: boolean, outlined = false): void {
  const titleColor = scale(c.title, dim);
  const artistColor = scale(c.artist, dim);
  const widest = Math.max(p.textWidth(title, g.font), p.textWidth(artist, g.font));
  const draw = (text: string, y: number, color: Rgb, dx: number): void =>
    outlined
      ? p.textOutlined(text, g.textX + dx, y, color, g.textX, g.textX + g.textW, g.font)
      : p.text(text, g.textX + dx, y, color, g.textX, g.textX + g.textW, g.font);

  if (widest <= g.textW) {
    draw(title, g.titleY, titleColor, 0);
    draw(artist, g.artistY, artistColor, 0);
  } else if (!animate) {
    draw(truncate(title, g.font, g.textW), g.titleY, titleColor, 0);
    draw(truncate(artist, g.font, g.textW), g.artistY, artistColor, 0);
  } else {
    // One shared offset and span, so the two lines stay locked together.
    const span = widest + SCROLL_GAP;
    const off = scrollOffset(sinceMs, span);
    for (const dx of [-off, span - off]) {
      draw(title, g.titleY, titleColor, dx);
      draw(artist, g.artistY, artistColor, dx);
    }
  }
}

/** A status word in the big font if it fits, otherwise the small one. */
function word(p: LedPanel, text: string, y: number, color: Rgb): void {
  const g = LAYOUTS.side;
  const f = p.textWidth(text, LARGE) <= g.textW ? LARGE : SMALL;
  p.text(text, g.textX, y, color, g.textX, g.textX + g.textW, f);
}

/** Paints one complete frame into `p`. `cover` is a 32x32 RGBA image, if there is one. */
export function paintBoard(
  p: LedPanel,
  shown: Shown,
  c: Colors,
  cover: Uint8ClampedArray | undefined,
  reduced: boolean,
  layout: Layout = 'side',
): void {
  p.clear();

  if (shown.kind === 'message') {
    const m = LAYOUTS.side.cover;
    const r = (m.size - 1) / 2;
    drawRecord(p, { cx: r, cy: r, r, spin: 0, label: c.artist, vinyl: c.title, dim: 1 });
    word(p, shown.text, 12, c.title);
    return;
  }

  if (layout === 'backdrop') return paintBackdrop(p, shown, c, cover, reduced);
  if (layout === 'flip') return reduced ? paintBoard(p, shown, c, cover, true, 'wide-small') : paintFlip(p, shown, c, cover);

  const g = LAYOUTS[layout];
  const dim = shown.playing ? 1 : PAUSED_DIM;
  const spin = reduced || !shown.playing ? 0 : (shown.positionMs / 1500) * Math.PI * 2;

  // The cover, or a plain record in its place while there is none.
  const { x, y, size } = g.cover;
  if (cover) p.blitScaled(cover, x, y, size, shown.playing ? 1 : PAUSED_DIM + 0.2);
  else {
    const r = (size - 1) / 2;
    drawRecord(p, { cx: x + r, cy: y + r, r, spin, label: c.artist, vinyl: c.title, dim });
  }

  nameLines(p, shown.title, shown.artist, g, c, dim, shown.sinceMs, !reduced);

  // The small record is the progress meter: it turns while playing, and its rim fills clockwise to the end.
  const frac = shown.durationMs > 0 ? Math.min(1, Math.max(0, shown.positionMs / shown.durationMs)) : 0;
  drawRecord(p, { ...g.record, spin, label: c.artist, vinyl: c.title, dim, ring: { frac, on: c.artist, off: c.track } });
}

type TrackShown = Extract<Shown, { kind: 'track' }>;

/** The large font if both names fit in `width`, otherwise the small one (which scrolls if it must). */
function pickFont(p: LedPanel, title: string, artist: string, width: number): PixelFont {
  return Math.max(p.textWidth(title, LARGE), p.textWidth(artist, LARGE)) <= width ? LARGE : SMALL;
}

const BLACK: Rgb = [0, 0, 0];
/** How bright the cover is when it is only a backdrop. */
const BACKDROP_GAIN = 0.35;

/** The cover as a dim wash over the whole board, names on top with an outline, progress along the bottom edge. */
function paintBackdrop(p: LedPanel, shown: TrackShown, c: Colors, cover: Uint8ClampedArray | undefined, reduced: boolean): void {
  const dim = shown.playing ? 1 : PAUSED_DIM;
  if (cover) p.blitStretch(cover, BACKDROP_GAIN * (shown.playing ? 1 : 0.8));
  else {
    const r = (ART_SIZE - 1) / 2;
    drawRecord(p, { cx: PANEL_W / 2 - 0.5, cy: r, r, spin: 0, label: c.artist, vinyl: c.title, dim: 0.4 });
  }

  const font = pickFont(p, shown.title, shown.artist, PANEL_W);
  const box: NameBox = { font, textX: 0, textW: PANEL_W, titleY: 2, artistY: font === LARGE ? 11 : 9 };
  nameLines(p, shown.title, shown.artist, box, c, dim, shown.sinceMs, !reduced, true);

  const frac = shown.durationMs > 0 ? Math.min(1, Math.max(0, shown.positionMs / shown.durationMs)) : 0;
  p.rect(0, PANEL_H - 2, PANEL_W, 1, BLACK);
  p.rect(0, PANEL_H - 1, PANEL_W, 1, c.track);
  p.rect(0, PANEL_H - 1, Math.round(PANEL_W * frac), 1, scale(c.artist, dim));
}

/** How long the cover screen stays up in the flip layout, and the names screen when nothing scrolls. */
export const FLIP_COVER_MS = 6000;
export const FLIP_NAMES_MS = 5000;
const FLIP_NAMES_W = 60;

/**
 * Two screens that take turns, each using the whole board. First the names, big, for long enough to
 * read them (a full scroll loop if they scroll), then the cover beside a big progress record.
 */
function paintFlip(p: LedPanel, shown: TrackShown, c: Colors, cover: Uint8ClampedArray | undefined): void {
  const dim = shown.playing ? 1 : PAUSED_DIM;
  const spin = shown.playing ? (shown.positionMs / 1500) * Math.PI * 2 : 0;
  const font = pickFont(p, shown.title, shown.artist, FLIP_NAMES_W);
  const widest = Math.max(p.textWidth(shown.title, font), p.textWidth(shown.artist, font));
  const scrolls = widest > FLIP_NAMES_W;
  const namesMs = scrolls ? HOLD_MS + ((widest + SCROLL_GAP) / SCROLL_PX_PER_S) * 1000 : FLIP_NAMES_MS;
  const phase = Math.max(0, shown.sinceMs) % (namesMs + FLIP_COVER_MS);
  const frac = shown.durationMs > 0 ? Math.min(1, Math.max(0, shown.positionMs / shown.durationMs)) : 0;

  if (phase < namesMs) {
    const box: NameBox = { font, textX: 2, textW: FLIP_NAMES_W, titleY: font === LARGE ? 5 : 7, artistY: 15 };
    nameLines(p, shown.title, shown.artist, box, c, dim, phase, true);
    p.rect(2, 26, FLIP_NAMES_W, 3, c.track);
    p.rect(2, 26, Math.round(FLIP_NAMES_W * frac), 3, scale(c.artist, dim));
    return;
  }

  const r = (ART_SIZE - 1) / 2;
  if (cover) p.blit(cover, 0, 0, shown.playing ? 1 : PAUSED_DIM + 0.2);
  else drawRecord(p, { cx: r, cy: r, r, spin, label: c.artist, vinyl: c.title, dim });
  drawRecord(p, { cx: ART_SIZE + 1 + r - 0.5, cy: r, r, spin, label: c.artist, vinyl: c.title, dim, ring: { frac, on: c.artist, off: c.track } });
}

interface RecordOptions {
  cx: number;
  cy: number;
  r: number;
  /** Rotation of the highlight, radians. */
  spin: number;
  label: Rgb;
  vinyl: Rgb;
  dim: number;
  /** If set, the rim is a progress ring: lit clockwise from the top for `frac` of the way round. */
  ring?: { frac: number; on: Rgb; off: Rgb };
}

/** A pixel vinyl record: grooves, a label, a spindle hole and a sheen that turns with `spin`. */
function drawRecord(p: LedPanel, o: RecordOptions): void {
  const bodyR = o.ring ? o.r - 1.6 : o.r;
  const labelR = Math.max(1.6, bodyR * 0.33);
  const holeR = Math.max(0.6, bodyR * 0.07);
  for (let y = Math.floor(o.cy - o.r - 1); y <= Math.ceil(o.cy + o.r + 1); y++) {
    for (let x = Math.floor(o.cx - o.r - 1); x <= Math.ceil(o.cx + o.r + 1); x++) {
      const dx = x - o.cx;
      const dy = y - o.cy;
      const d = Math.hypot(dx, dy);
      if (d > o.r + 0.5) continue;
      if (o.ring && d > bodyR) {
        // Clockwise angle from 12 o'clock, 0..1.
        const turn = ((Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
        const lit = turn <= o.ring.frac;
        p.set(x, y, scale(lit ? o.ring.on : o.ring.off, lit ? o.dim : 1));
        continue;
      }
      if (d < holeR) continue;
      if (d < labelR) {
        p.set(x, y, scale(o.label, 0.85 * o.dim));
        continue;
      }
      const groove = Math.floor(d) % 2 === 0 ? 0.16 : 0.07;
      const sheen = Math.max(0, Math.cos((Math.atan2(dy, dx) - o.spin) * 2)) ** 8 * 0.45;
      p.set(x, y, scale(o.vinyl, (groove + sheen) * o.dim));
    }
  }
}
