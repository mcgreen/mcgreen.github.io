/**
 * Demo "now playing" for the Heat Panel, so the board works before Soloist is set up.
 * Entirely made up (fictional titles and artists); it exists only to show the layout.
 * Pure function of time, so it needs no timers.
 */
export interface DemoTrack {
  id: string;
  title: string;
  artist: string;
  durationMs: number;
}

export const DEMO_TRACKS: readonly DemoTrack[] = [
  { id: 'demo-neon-embers', title: 'Neon Embers', artist: 'The Heat Lamps', durationMs: 42_000 },
  { id: 'demo-slow-burn-in-a-fast-city', title: 'Slow Burn in a Fast City', artist: 'Cassette Weather', durationMs: 36_000 },
  { id: 'demo-vinyl-sunrise', title: 'Vinyl Sunrise', artist: 'Low Tide Orchestra', durationMs: 48_000 },
];

const LOOP_MS = DEMO_TRACKS.reduce((sum, t) => sum + t.durationMs, 0);

/** Which demo track is playing `elapsedMs` after the demo started, and how far into it. */
export function demoAt(elapsedMs: number): { track: DemoTrack; positionMs: number } {
  let t = ((elapsedMs % LOOP_MS) + LOOP_MS) % LOOP_MS;
  for (const track of DEMO_TRACKS) {
    if (t < track.durationMs) return { track, positionMs: t };
    t -= track.durationMs;
  }
  return { track: DEMO_TRACKS[0], positionMs: 0 };
}

// ---- Demo cover art -------------------------------------------------------------------------

/** [sky top hue, sky bottom hue, sun hue] in degrees, one entry per demo track. */
const COVER_HUES: readonly (readonly [number, number, number])[] = [
  [8, 330, 45],
  [210, 275, 35],
  [150, 195, 55],
];

function fromHsl(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number): number => {
    const k = (n + h / 30) % 12;
    return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return [f(0), f(8), f(4)];
}

/**
 * A made-up 32x32 "album cover" (original artwork: a striped sun over a dark horizon) so the demo
 * shows how real cover art looks once it is shrunk onto the board. RGBA, like a downsampled cover.
 */
export function demoCover(id: string): Uint8ClampedArray {
  const index = Math.max(0, DEMO_TRACKS.findIndex((t) => t.id === id));
  const [top, bottom, sunHue] = COVER_HUES[index % COVER_HUES.length];
  const out = new Uint8ClampedArray(32 * 32 * 4);
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const t = y / 31;
      let rgb: [number, number, number];
      if (y >= 26) {
        rgb = fromHsl(top, 0.45, 0.07 + 0.02 * (y - 26)); // horizon
      } else {
        const inSun = Math.hypot(x - 15.5, y - 15) < 9;
        const slit = y > 15 && (y - 15) % 3 === 0; // stripes cut through the lower sun
        rgb = inSun && !slit ? fromHsl(sunHue, 0.95, 0.72 - 0.25 * ((y - 6) / 20)) : fromHsl(top + (bottom - top) * t, 0.7, 0.18 + 0.22 * t);
      }
      const i = (y * 32 + x) * 4;
      out[i] = rgb[0];
      out[i + 1] = rgb[1];
      out[i + 2] = rgb[2];
      out[i + 3] = 255;
    }
  }
  return out;
}
