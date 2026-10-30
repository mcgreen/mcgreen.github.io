import { PixelFont, SMALL, textWidth, toPanelText } from './pixel-font';

/** Colour as [r, g, b], 0-255. */
export type Rgb = readonly [number, number, number];

export const PANEL_W = 64;
export const PANEL_H = 32;
export const ART_SIZE = 32;

export function scale(c: Rgb, k: number): Rgb {
  return [c[0] * k, c[1] * k, c[2] * k];
}

/** Parses "#rrggbb" / "#rgb" (what the design tokens resolve to); anything else gives `fallback`. */
export function parseHex(value: string, fallback: Rgb): Rgb {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return fallback;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/**
 * A 64x32 RGB LED matrix in memory (the size of the common HUB75 panels), plus a renderer that
 * draws it as round LEDs on a canvas. The drawing methods only touch the pixel buffer, so the same
 * layout code can later drive a real panel from a Node script on a Raspberry Pi.
 */
export class LedPanel {
  private readonly buf = new Float32Array(PANEL_W * PANEL_H * 3);

  clear(): void {
    this.buf.fill(0);
  }

  set(x: number, y: number, c: Rgb): void {
    if (x < 0 || y < 0 || x >= PANEL_W || y >= PANEL_H) return;
    const i = (Math.floor(y) * PANEL_W + Math.floor(x)) * 3;
    this.buf[i] = c[0];
    this.buf[i + 1] = c[1];
    this.buf[i + 2] = c[2];
  }

  rect(x: number, y: number, w: number, h: number, c: Rgb): void {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }

  /** Draws text with its top-left at (x, y), clipped to the columns [clipL, clipR). */
  text(raw: string, x: number, y: number, c: Rgb, clipL = 0, clipR = PANEL_W, f: PixelFont = SMALL): void {
    const s = toPanelText(raw);
    for (let n = 0; n < s.length; n++) {
      const gx = x + n * f.advance;
      if (gx + f.w <= clipL || gx >= clipR) continue;
      const rows = f.glyph(s[n]);
      for (let r = 0; r < f.h; r++) {
        for (let b = 0; b < f.w; b++) {
          if (rows[r] & (1 << (f.w - 1 - b))) {
            const px = gx + b;
            if (px >= clipL && px < clipR) this.set(px, y + r, c);
          }
        }
      }
    }
  }

  /** Text with a 1 px dark outline, so it stays readable on top of a picture. */
  textOutlined(raw: string, x: number, y: number, c: Rgb, clipL: number, clipR: number, f: PixelFont = SMALL, outline: Rgb = [0, 0, 0]): void {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx !== 0 || dy !== 0) this.text(raw, x + dx, y + dy, outline, clipL, clipR, f);
      }
    }
    this.text(raw, x, y, c, clipL, clipR, f);
  }

  /** Width in pixels `raw` would take in font `f`. */
  textWidth(raw: string, f: PixelFont = SMALL): number {
    return textWidth(toPanelText(raw), f);
  }

  /** Copies a 32x32 RGBA image to (x0, y0), multiplied by `gain`. */
  blit(rgba: Uint8ClampedArray, x0: number, y0: number, gain: number): void {
    for (let y = 0; y < ART_SIZE; y++) {
      for (let x = 0; x < ART_SIZE; x++) {
        const i = (y * ART_SIZE + x) * 4;
        this.set(x0 + x, y0 + y, [rgba[i] * gain, rgba[i + 1] * gain, rgba[i + 2] * gain]);
      }
    }
  }

  /** Fills the whole panel with the 32x32 image stretched 2x sideways (64x32), multiplied by `gain`. A backdrop. */
  blitStretch(rgba: Uint8ClampedArray, gain: number): void {
    for (let y = 0; y < PANEL_H; y++) {
      for (let x = 0; x < PANEL_W; x++) {
        const i = (y * ART_SIZE + Math.floor(x / 2)) * 4;
        this.set(x, y, [rgba[i] * gain, rgba[i + 1] * gain, rgba[i + 2] * gain]);
      }
    }
  }

  /** Like `blit`, but shrinks the 32x32 image to `size` x `size` first (box average), for smaller covers. */
  blitScaled(rgba: Uint8ClampedArray, x0: number, y0: number, size: number, gain: number): void {
    if (size === ART_SIZE) return this.blit(rgba, x0, y0, gain);
    const k = ART_SIZE / size;
    for (let y = 0; y < size; y++) {
      const sy0 = Math.floor(y * k);
      const sy1 = Math.max(sy0 + 1, Math.ceil((y + 1) * k));
      for (let x = 0; x < size; x++) {
        const sx0 = Math.floor(x * k);
        const sx1 = Math.max(sx0 + 1, Math.ceil((x + 1) * k));
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let sy = sy0; sy < sy1; sy++) {
          for (let sx = sx0; sx < sx1; sx++) {
            const i = (sy * ART_SIZE + sx) * 4;
            r += rgba[i];
            g += rgba[i + 1];
            b += rgba[i + 2];
            n++;
          }
        }
        this.set(x0 + x, y0 + y, [(r / n) * gain, (g / n) * gain, (b / n) * gain]);
      }
    }
  }

  /** Paints the dark panel body with every (unlit) LED, once per size. Reused every frame. */
  buildBase(cell: number, body: Rgb, off: Rgb): HTMLCanvasElement {
    const base = document.createElement('canvas');
    base.width = PANEL_W * cell;
    base.height = PANEL_H * cell;
    const ctx = base.getContext('2d')!;
    ctx.fillStyle = css(body);
    ctx.fillRect(0, 0, base.width, base.height);
    ctx.fillStyle = css(off);
    for (let y = 0; y < PANEL_H; y++) {
      for (let x = 0; x < PANEL_W; x++) this.dot(ctx, x, y, cell);
    }
    return base;
  }

  /** Draws the base, then every lit LED on top. */
  draw(ctx: CanvasRenderingContext2D, base: HTMLCanvasElement, cell: number): void {
    ctx.drawImage(base, 0, 0);
    for (let y = 0; y < PANEL_H; y++) {
      for (let x = 0; x < PANEL_W; x++) {
        const i = (y * PANEL_W + x) * 3;
        const r = this.buf[i];
        const g = this.buf[i + 1];
        const b = this.buf[i + 2];
        if (r + g + b < 6) continue;
        ctx.fillStyle = `rgb(${clamp(r)} ${clamp(g)} ${clamp(b)})`;
        this.dot(ctx, x, y, cell);
      }
    }
  }

  private dot(ctx: CanvasRenderingContext2D, x: number, y: number, cell: number): void {
    ctx.beginPath();
    ctx.arc(x * cell + cell / 2, y * cell + cell / 2, cell * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

const clamp = (v: number): number => Math.max(0, Math.min(255, Math.round(v)));
const css = (c: Rgb): string => `rgb(${clamp(c[0])} ${clamp(c[1])} ${clamp(c[2])})`;

/**
 * Fetches a cover image and shrinks it to 32x32 RGBA, the way the Pi would before sending it to a
 * real panel. Throws if the image host does not allow cross-origin reads (the caller then shows a
 * placeholder), so a failure is normal and never fatal.
 */
export async function loadCoverPixels(url: string, signal: AbortSignal): Promise<Uint8ClampedArray> {
  const res = await fetch(url, { signal, mode: 'cors', credentials: 'omit' });
  if (!res.ok) throw new Error(`cover request failed (${res.status})`);
  const bitmap = await createImageBitmap(await res.blob());
  try {
    const cv = document.createElement('canvas');
    cv.width = ART_SIZE;
    cv.height = ART_SIZE;
    const ctx = cv.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, ART_SIZE, ART_SIZE);
    return ctx.getImageData(0, 0, ART_SIZE, ART_SIZE).data;
  } finally {
    bitmap.close();
  }
}
