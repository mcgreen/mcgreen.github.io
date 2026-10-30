/**
 * Two pixel fonts for the LED panel.
 *  - LARGE (5x7): titles and artists, readable from across a room.
 *  - SMALL (3x5): times and other fine print.
 * Each glyph is a list of rows; each row is a bit mask (the highest bit is the leftmost pixel).
 * Text is drawn upper-case; accents are stripped.
 */
export interface PixelFont {
  /** Glyph width and height in pixels. */
  readonly w: number;
  readonly h: number;
  /** Pixels from one character's left edge to the next (glyph plus a 1 px gap). */
  readonly advance: number;
  glyph(ch: string): readonly number[];
}

type Table = Record<string, readonly number[]>;

function font(w: number, h: number, table: Table, unknown: readonly number[]): PixelFont {
  return { w, h, advance: w + 1, glyph: (ch) => table[ch] ?? unknown };
}

const SMALL_TABLE: Table = {
  A: [2, 5, 7, 5, 5], B: [6, 5, 6, 5, 6], C: [3, 4, 4, 4, 3], D: [6, 5, 5, 5, 6], E: [7, 4, 6, 4, 7],
  F: [7, 4, 6, 4, 4], G: [3, 4, 5, 5, 3], H: [5, 5, 7, 5, 5], I: [7, 2, 2, 2, 7], J: [1, 1, 1, 5, 2],
  K: [5, 5, 6, 5, 5], L: [4, 4, 4, 4, 7], M: [5, 7, 7, 5, 5], N: [7, 5, 5, 5, 5], O: [2, 5, 5, 5, 2],
  P: [6, 5, 6, 4, 4], Q: [2, 5, 5, 6, 3], R: [6, 5, 6, 5, 5], S: [3, 4, 2, 1, 6], T: [7, 2, 2, 2, 2],
  U: [5, 5, 5, 5, 7], V: [5, 5, 5, 5, 2], W: [5, 5, 7, 7, 5], X: [5, 5, 2, 5, 5], Y: [5, 5, 2, 2, 2],
  Z: [7, 1, 2, 4, 7],
  '0': [7, 5, 5, 5, 7], '1': [2, 6, 2, 2, 7], '2': [6, 1, 2, 4, 7], '3': [6, 1, 2, 1, 6], '4': [5, 5, 7, 1, 1],
  '5': [7, 4, 6, 1, 6], '6': [3, 4, 7, 5, 7], '7': [7, 1, 2, 2, 2], '8': [7, 5, 7, 5, 7], '9': [7, 5, 7, 1, 6],
  ' ': [0, 0, 0, 0, 0], '.': [0, 0, 0, 0, 2], ',': [0, 0, 0, 2, 4], '-': [0, 0, 7, 0, 0], "'": [2, 2, 0, 0, 0],
  '!': [2, 2, 2, 0, 2], '?': [6, 1, 2, 0, 2], ':': [0, 2, 0, 2, 0], '&': [2, 5, 2, 5, 3], '(': [1, 2, 2, 2, 1],
  ')': [4, 2, 2, 2, 4], '/': [1, 1, 2, 4, 4], '+': [0, 2, 7, 2, 0], '*': [5, 2, 7, 2, 5], '#': [5, 7, 5, 7, 5],
};

const LARGE_TABLE: Table = {
  A: [14, 17, 17, 31, 17, 17, 17], B: [30, 17, 17, 30, 17, 17, 30], C: [14, 17, 16, 16, 16, 17, 14],
  D: [30, 17, 17, 17, 17, 17, 30], E: [31, 16, 16, 30, 16, 16, 31], F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 15], H: [17, 17, 17, 31, 17, 17, 17], I: [14, 4, 4, 4, 4, 4, 14],
  J: [7, 2, 2, 2, 2, 18, 12], K: [17, 18, 20, 24, 20, 18, 17], L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17], N: [17, 25, 21, 19, 17, 17, 17], O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16], Q: [14, 17, 17, 17, 21, 18, 13], R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30], T: [31, 4, 4, 4, 4, 4, 4], U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4], W: [17, 17, 17, 21, 21, 27, 17], X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4], Z: [31, 1, 2, 4, 8, 16, 31],
  '0': [14, 17, 19, 21, 25, 17, 14], '1': [4, 12, 4, 4, 4, 4, 14], '2': [14, 17, 1, 2, 4, 8, 31],
  '3': [31, 2, 4, 2, 1, 17, 14], '4': [2, 6, 10, 18, 31, 2, 2], '5': [31, 16, 30, 1, 1, 17, 14],
  '6': [6, 8, 16, 30, 17, 17, 14], '7': [31, 1, 2, 4, 8, 8, 8], '8': [14, 17, 17, 14, 17, 17, 14],
  '9': [14, 17, 17, 15, 1, 2, 12],
  ' ': [0, 0, 0, 0, 0, 0, 0], '.': [0, 0, 0, 0, 0, 12, 12], ',': [0, 0, 0, 0, 12, 4, 8], '-': [0, 0, 0, 31, 0, 0, 0],
  "'": [4, 4, 8, 0, 0, 0, 0], '!': [4, 4, 4, 4, 4, 0, 4], '?': [14, 17, 1, 2, 4, 0, 4], ':': [0, 12, 12, 0, 12, 12, 0],
  '&': [12, 18, 20, 8, 21, 18, 13], '(': [2, 4, 8, 8, 8, 4, 2], ')': [8, 4, 2, 2, 2, 4, 8],
  '/': [1, 1, 2, 4, 8, 16, 16], '+': [0, 4, 4, 31, 4, 4, 0], '*': [0, 21, 14, 31, 14, 21, 0],
  '#': [10, 10, 31, 10, 31, 10, 10],
};

/** Shown for anything a font lacks (CJK, emoji, ...): a hollow box. */
export const SMALL = font(3, 5, SMALL_TABLE, [7, 5, 5, 5, 7]);
export const LARGE = font(5, 7, LARGE_TABLE, [31, 17, 17, 17, 17, 17, 31]);

/** Upper-cases and strips accents so "Beyoncé" -> "BEYONCE". */
export function toPanelText(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
}

/** Width in pixels of already-normalized text (no trailing gap). */
export function textWidth(text: string, f: PixelFont): number {
  return text.length === 0 ? 0 : text.length * f.advance - 1;
}
