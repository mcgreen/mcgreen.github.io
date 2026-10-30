/**
 * Simulated beat + spectrum.
 *
 * Why simulated: Spotify's audio is DRM-protected so the browser can't analyse
 * it, and the Audio Features / Audio Analysis endpoints (tempo, beats) were
 * removed. So we pick a plausible tempo per track (stable: the same track always
 * gets the same BPM) and lock a beat clock to the real playback position.
 * It LOOKS like it reacts to the music; it isn't measuring it.
 *
 * Kept free of Angular and the DOM so it can be unit-tested.
 */
export class BeatEngine {
  /** 0-1 per frequency bin, low to high. */
  readonly levels: Float32Array;
  /** 1 on each beat, decaying. */
  kick = 0;
  /** 1 on each bar's downbeat, decaying. */
  accent = 0;
  /** Counts up on every beat (renderers watch it to spawn effects). */
  beat = 0;
  /** Counts up on every downbeat (every 4th beat). */
  bar = 0;
  bpm = 120;

  private clock = 0;
  private lastBeat = -1;
  private lastHalf = -1;
  private hat = 0;

  constructor(readonly bins = 48) {
    this.levels = new Float32Array(bins);
  }

  /**
   * @param dtMs frame time
   * @param playing whether music is playing
   * @param positionMs real playback position (re-syncs the internal clock after seeks / track changes)
   * @param seed track id, so every track gets its own tempo
   */
  update(dtMs: number, playing: boolean, positionMs: number, seed: string): void {
    this.bpm = bpmFor(seed);
    const beatMs = 60_000 / this.bpm;

    if (playing) {
      this.clock += dtMs;
      if (Math.abs(this.clock - positionMs) > 300) this.clock = positionMs;

      const beatIndex = Math.floor(this.clock / beatMs);
      if (beatIndex !== this.lastBeat) {
        this.lastBeat = beatIndex;
        this.beat++;
        this.kick = 1;
        if (beatIndex % 4 === 0) {
          this.accent = 1;
          this.bar++;
        }
      }
      const halfIndex = Math.floor(this.clock / (beatMs / 2));
      if (halfIndex !== this.lastHalf) {
        this.lastHalf = halfIndex;
        if (halfIndex % 2 === 1) this.hat = 1; // off-beat hi-hat
      }
    }

    this.kick *= Math.exp(-dtMs / 150);
    this.accent *= Math.exp(-dtMs / 260);
    this.hat *= Math.exp(-dtMs / 90);

    const t = this.clock || performance.now();
    const n = this.bins;
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1);
      let target: number;
      if (playing) {
        const low = this.kick * Math.pow(1 - f, 1.6);
        const mid = this.accent * 0.55 * Math.exp(-Math.pow((f - 0.35) / 0.22, 2));
        const high = this.hat * 0.8 * Math.pow(f, 1.1);
        const shimmer = (0.14 + 0.1 * Math.sin(t * 0.004 + i * 0.9)) * (1 - f * 0.45) * (0.6 + 0.4 * noise(i, t));
        target = Math.min(1, low + mid + high + shimmer);
      } else {
        // Idle: a slow breathing ripple so blast mode never looks dead.
        target = 0.05 + 0.04 * Math.sin(t * 0.0012 + i * 0.4);
      }
      const cur = this.levels[i];
      this.levels[i] = target > cur ? cur + (target - cur) * 0.65 : cur + (target - cur) * (1 - Math.exp(-dtMs / 130));
    }
  }
}

/** Stable pseudo-tempo in 88-147 BPM from a string. */
export function bpmFor(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 88 + (Math.abs(h) % 60);
}

/** Cheap deterministic noise in 0-1, changing ~16 times a second. */
function noise(i: number, t: number): number {
  const s = Math.sin(i * 12.9898 + Math.floor(t / 60) * 78.233) * 43758.5453;
  return s - Math.floor(s);
}
