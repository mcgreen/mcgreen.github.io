import { BeatEngine } from './beat-engine';

export interface Renderer {
  /** Fill the canvas fully; called when the theme or size changes. */
  reset(ctx: CanvasRenderingContext2D, w: number, h: number): void;
  draw(ctx: CanvasRenderingContext2D, w: number, h: number, e: BeatEngine, nowMs: number, dtMs: number): void;
}

const TAU = Math.PI * 2;

/** Reads a design token (CSS custom property) so canvas drawing follows the active theme. */
function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Modern theme: a Milkdrop-style radial burst. Spectrum bars fan out from a
 * glowing core, shockwave rings fire on each beat, and trails smear the frame.
 */
interface Shape {
  x: number;
  y: number;
  r: number;
  rot: number;
  spin: number;
  sides: number;
  hue: number;
  a: number;
  grow: number;
}

export class HeatRenderer implements Renderer {
  private rings: { r: number; a: number }[] = [];
  private shapes: Shape[] = [];
  private lastBeat = 0;
  private lastBar = 0;
  /** Palette rotation in degrees; eases toward a new random target every bar. */
  private hueShift = 0;
  private hueTarget = 0;

  /** Filled from tokens in reset(), which always runs before the first frame. */
  private bg = '';

  reset(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    this.bg = token('--viz-bg') || this.bg;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.bg;
    ctx.fillRect(0, 0, w, h);
    this.rings = [];
    this.shapes = [];
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, e: BeatEngine, now: number, dt: number): void {
    // Trails: fade the previous frame instead of clearing it.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.24 - e.kick * 0.1;
    ctx.fillStyle = this.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.5;
    const step = dt / 16.7; // frame-rate independent motion

    if (e.bar !== this.lastBar) {
      this.lastBar = e.bar;
      // New bar: swing the whole palette to a random place on the colour wheel.
      this.hueTarget = Math.random() * 360;
    }
    // Take the short way round the colour wheel.
    const diff = ((this.hueTarget - this.hueShift + 540) % 360) - 180;
    this.hueShift = (this.hueShift + diff * Math.min(1, dt / 500) + 360) % 360;

    if (e.beat !== this.lastBeat) {
      this.lastBeat = e.beat;
      this.rings.push({ r: R * 0.22, a: 0.85 });
      if (this.rings.length > 8) this.rings.shift();
      // Often fire an outlined shape in a random colour, anywhere on screen.
      if (Math.random() < 0.55) {
        const centred = Math.random() < 0.4;
        this.shapes.push({
          x: centred ? cx : Math.random() * w,
          y: centred ? cy : Math.random() * h,
          r: R * (0.05 + Math.random() * 0.12),
          rot: Math.random() * TAU,
          spin: (Math.random() - 0.5) * 0.08,
          sides: 3 + Math.floor(Math.random() * 6), // triangle .. decagon
          hue: Math.random() * 360,
          a: 0.9,
          grow: 1.01 + Math.random() * 0.02,
        });
        if (this.shapes.length > 14) this.shapes.shift();
      }
    }

    ctx.globalCompositeOperation = 'lighter';

    // Core glow
    const glowR = R * (0.34 + e.kick * 0.26);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    glow.addColorStop(0, `hsla(${(14 + this.hueShift) % 360}, 100%, 58%, ${0.32 + e.kick * 0.38})`);
    glow.addColorStop(0.55, `hsla(${(338 + this.hueShift) % 360}, 80%, 46%, ${0.16 + e.kick * 0.2})`);
    glow.addColorStop(1, `hsla(${(310 + this.hueShift) % 360}, 80%, 35%, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, TAU);
    ctx.fill();

    // Shockwave rings
    for (const ring of this.rings) {
      ring.r += R * 0.014 * step * (1 + e.accent);
      ring.a *= Math.pow(0.965, step);
      ctx.strokeStyle = `hsla(${(24 + this.hueShift) % 360}, 100%, 62%, ${ring.a})`;
      ctx.lineWidth = 2 + ring.a * 5;
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r, 0, TAU);
      ctx.stroke();
    }
    this.rings = this.rings.filter((r) => r.a > 0.02 && r.r < R * 1.6);

    // Outlined shapes: expand, spin and fade
    for (const sh of this.shapes) {
      sh.r *= Math.pow(sh.grow, step);
      sh.rot += sh.spin * step;
      sh.a *= Math.pow(0.975, step);
      ctx.strokeStyle = `hsla(${sh.hue}, 100%, 60%, ${sh.a})`;
      ctx.lineWidth = 1.5 + sh.a * 3;
      ctx.beginPath();
      for (let k = 0; k <= sh.sides; k++) {
        const ang = sh.rot + (k / sh.sides) * TAU;
        const px = sh.x + Math.cos(ang) * sh.r;
        const py = sh.y + Math.sin(ang) * sh.r;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    this.shapes = this.shapes.filter((sh) => sh.a > 0.03);

    // Radial spectrum, mirrored so it is symmetric
    const n = e.levels.length;
    const total = n * 2;
    const inner = R * 0.24 * (1 + e.kick * 0.1);
    const rot = now * 0.00007 + e.accent * 0.05;
    ctx.lineCap = 'round';
    for (let i = 0; i < total; i++) {
      const level = e.levels[i < n ? i : total - 1 - i];
      const ang = (i / total) * TAU + rot;
      const len = R * 0.04 + level * R * 0.55;
      const frac = i / total;
      // Ember (20deg) through red to magenta (310deg)
      const hue = (20 - frac * 70 + this.hueShift + 720) % 360;
      ctx.strokeStyle = `hsl(${hue} 100% ${48 + level * 18}%)`;
      ctx.lineWidth = 2 + level * 5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner);
      ctx.lineTo(cx + Math.cos(ang) * (inner + len), cy + Math.sin(ang) * (inner + len));
      ctx.stroke();
    }
  }
}

/**
 * Retro theme: the classic media-player "Bars and Waves": chunky green/yellow/red
 * segment bars with falling peak caps, plus an oscilloscope line.
 */
export class RetroRenderer implements Renderer {
  private peaks = new Float32Array(32);
  private c = { bg: '', good: '', warn: '', bad: '', peak: '', wave: '', grid: '' };

  reset(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    this.c = {
      bg: token('--viz-bg') || this.c.bg,
      good: token('--viz-good') || this.c.good,
      warn: token('--viz-warn') || this.c.warn,
      bad: token('--viz-bad') || this.c.bad,
      peak: token('--viz-peak') || this.c.peak,
      wave: token('--viz-wave') || this.c.wave,
      grid: token('--viz-grid') || this.c.grid,
    };
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.c.bg;
    ctx.fillRect(0, 0, w, h);
    this.peaks.fill(0);
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, e: BeatEngine, now: number, dt: number): void {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = this.c.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    const bars = this.peaks.length;
    const bw = w / bars;
    const block = 10;
    const maxH = h * 0.62;

    // Faint grid
    ctx.strokeStyle = this.c.grid;
    ctx.lineWidth = 1;
    for (let y = h; y > h - maxH; y -= block * 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    for (let b = 0; b < bars; b++) {
      const level = e.levels[Math.floor((b / bars) * e.levels.length)];
      this.peaks[b] = Math.max(level, this.peaks[b] - dt * 0.0005);
      const blocks = Math.floor((level * maxH) / block);
      for (let k = 0; k < blocks; k++) {
        const frac = (k * block) / maxH;
        ctx.fillStyle = frac < 0.6 ? this.c.good : frac < 0.85 ? this.c.warn : this.c.bad;
        ctx.fillRect(b * bw + 1, h - (k + 1) * block, bw - 3, block - 2);
      }
      // Peak cap
      const peakY = h - Math.floor((this.peaks[b] * maxH) / block) * block - block;
      ctx.fillStyle = this.c.peak;
      ctx.fillRect(b * bw + 1, peakY, bw - 3, 3);
    }

    // Oscilloscope
    const avg = e.levels.reduce((s, v) => s + v, 0) / e.levels.length;
    const amp = h * 0.1 * (0.25 + avg * 2 + e.kick);
    ctx.strokeStyle = this.c.wave;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 6) {
      const y =
        h * 0.3 +
        Math.sin(x * 0.012 + now * 0.004) * amp +
        Math.sin(x * 0.031 - now * 0.007) * amp * 0.4;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
