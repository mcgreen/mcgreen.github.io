import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { FormField, debounce, form } from '@angular/forms/signals';
import { AuthService } from '../../core/auth/auth.service';
import { safe } from '../../core/resource';
import { demoAt, demoCover } from '../../core/soloist/demo';
import { positionNow } from '../../core/soloist/soloist';
import { SoloistService } from '../../core/soloist/soloist.service';
import { TasteService } from '../../core/taste.service';
import { Colors, Layout, Shown, paintBoard } from '../../core/visuals/board';
import { LedPanel, PANEL_H, PANEL_W, Rgb, loadCoverPixels, parseHex } from '../../core/visuals/led-panel';
import { mineAt, pickMine } from './my-music';

type Source = 'demo' | 'mine' | 'soloist';

const LAYOUT_CHOICES: { id: Layout; label: string }[] = [
  { id: 'backdrop', label: 'Cover as backdrop' },
  { id: 'flip', label: 'Flip: names / cover' },
  { id: 'wide-small', label: 'Names on top (small)' },
  { id: 'wide-large', label: 'Names on top (large)' },
  { id: 'side', label: 'Cover beside names' },
];

/** Pixels per LED on the canvas (64 x 12 = 768 px wide). */
const CELL = 12;

const FALLBACK: Rgb = [255, 255, 255];

/** Reads the LED tokens once; the board is hardware, so it does not follow the theme. */
function readColors(): Colors {
  const css = getComputedStyle(document.documentElement);
  const tok = (name: string): Rgb => parseHex(css.getPropertyValue(name), FALLBACK);
  return {
    body: tok('--led-body'),
    off: tok('--led-off'),
    title: tok('--led-title'),
    artist: tok('--led-artist'),
    track: tok('--led-progress-track'),
  };
}

/**
 * Heat Panel: a simulated 64x32 RGB LED matrix showing what Spotify Soloist is playing.
 * Demo mode needs nothing; Soloist mode listens to a local Soloist WebSocket (read-only).
 * Everything on the board is real playback data: title, artist, cover, position, play/pause. Long names scroll together.
 */
@Component({
  selector: 'app-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
})
export class Panel {
  protected readonly soloist = inject(SoloistService);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');

  private readonly auth = inject(AuthService);
  private readonly taste = inject(TasteService);
  protected readonly loggedIn = this.auth.isLoggedIn;

  /** Signed in: start with a shuffle of your own music. Otherwise the made-up demo. */
  protected readonly source = signal<Source>(this.auth.isLoggedIn() ? 'mine' : 'demo');
  protected readonly layouts = LAYOUT_CHOICES;
  protected readonly layout = signal<Layout>('backdrop');
  /** Full "Title by Artist" of what the board is showing (the board itself can only fit ~7 characters a line). */
  protected readonly caption = signal('');
  /** The address box. `debounce` keeps a reconnect from firing on every keystroke. */
  protected readonly addressForm = form(this.soloist.settings, (path) => {
    debounce(path.address, 400);
  });

  /** Cover art for the playing track, shrunk to 32x32. Errors just mean "show the record instead". */
  private readonly art = resource({
    params: () => (this.source() === 'soloist' ? (this.soloist.state().item?.coverUrl ?? undefined) : undefined),
    loader: ({ params, abortSignal }) => loadCoverPixels(params, abortSignal),
  });

  /** One track per top artist, shuffled; changes only when your top lists reload. */
  protected readonly mine = computed(() => pickMine(this.taste.tracks()));
  /** Covers for all of those, fetched up front. A cover that can't be read is simply missing. */
  private readonly mineCovers = resource({
    params: () => (this.source() === 'mine' ? this.mine() : undefined),
    loader: async ({ params, abortSignal }) => {
      const entries = await Promise.all(
        params.map(async (t) => {
          if (!t.coverUrl) return null;
          try {
            return [t.id, await loadCoverPixels(t.coverUrl, abortSignal)] as const;
          } catch {
            return null;
          }
        }),
      );
      return new Map(entries.filter((e) => e !== null));
    },
  });
  protected readonly artFailed = computed(() => {
    if (this.source() === 'soloist') return !!this.art.error();
    const covers = safe(this.mineCovers);
    return this.source() === 'mine' && !!covers && covers.size < this.mine().length;
  });

  protected readonly status = computed(() => {
    const s = this.soloist.state();
    switch (s.connection) {
      case 'off':
        return this.soloist.url() ? 'Not connected.' : 'Use a loopback address such as 127.0.0.1:9090.';
      case 'connecting':
        return 'Connecting…';
      case 'reconnecting':
        return 'Can’t reach Soloist, retrying. Is it running with --ws? (Safari blocks ws:// from https pages.)';
      case 'open':
        if (!s.loggedIn) return 'Soloist is running but not signed in yet. Choose it in the Spotify app’s device list.';
        return s.item ? `Connected to “${s.deviceName}”.` : `Connected to “${s.deviceName}”. Start playback on it.`;
    }
  });

  protected readonly nowPlaying = computed(() => {
    const t = this.soloist.state().item;
    if (!t) return null;
    return t.artists.length ? `${t.title} by ${t.artists.join(', ')}` : t.title;
  });
  protected readonly upNext = computed(() => this.soloist.state().upcoming.slice(0, 5));

  protected readonly summary = computed(() =>
    this.source() === 'soloist'
      ? `Simulated 64 by 32 LED panel. ${this.nowPlaying() ?? this.status()}`
      : `Simulated 64 by 32 LED panel. ${this.caption() || 'Loading'}`,
  );

  // ---- Canvas loop (not signal state) ----
  private readonly panel = new LedPanel();
  private ctx!: CanvasRenderingContext2D;
  private base!: HTMLCanvasElement;
  private colors!: Colors;
  private reduced = false;
  private raf = 0;
  private startedAt = 0;
  private alive = true;
  private captionId = '';
  private trackSince = 0;
  /** Demo covers are generated once per track. */
  private readonly demoCovers = new Map<string, Uint8ClampedArray>();

  constructor() {
    afterNextRender(() => {
      const el = this.canvas().nativeElement;
      el.width = PANEL_W * CELL;
      el.height = PANEL_H * CELL;
      this.ctx = el.getContext('2d')!;
      this.colors = readColors();
      this.base = this.panel.buildBase(CELL, this.colors.body, this.colors.off);
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.startedAt = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    });
    inject(DestroyRef).onDestroy(() => {
      this.alive = false;
      cancelAnimationFrame(this.raf);
    });
  }

  protected useDemo(): void {
    this.source.set('demo');
    this.soloist.disconnect();
  }

  protected useMine(): void {
    this.source.set('mine');
    this.soloist.disconnect();
  }

  protected useSoloist(): void {
    this.source.set('soloist');
    this.soloist.connect();
  }

  private readonly frame = (now: number): void => {
    if (!this.alive) return;
    this.raf = requestAnimationFrame(this.frame);
    if (document.hidden) return;
    let shown = this.current(now);
    const id = shown.kind === 'track' ? shown.id : shown.text;
    if (id !== this.captionId) {
      this.captionId = id;
      this.trackSince = now;
      this.caption.set(shown.kind === 'track' ? `${shown.title} by ${shown.artist}` : shown.text);
    }
    if (shown.kind === 'track') shown = { ...shown, sinceMs: now - this.trackSince };
    paintBoard(this.panel, shown, this.colors, this.coverFor(shown), this.reduced, this.layout());
    this.panel.draw(this.ctx, this.base, CELL);
  };

  private current(now: number): Shown {
    if (this.source() === 'demo') {
      const { track, positionMs } = demoAt(now - this.startedAt);
      return { kind: 'track', id: track.id, title: track.title, artist: track.artist, durationMs: track.durationMs, positionMs, playing: true, sinceMs: 0 };
    }
    if (this.source() === 'mine') {
      const list = this.mine();
      if (!list.length) return { kind: 'message', text: this.taste.tracksLoading() ? 'LOADING' : 'NO DATA' };
      const { track, positionMs } = mineAt(list, now - this.startedAt);
      return { kind: 'track', id: track.id, title: track.title, artist: track.artist, durationMs: track.durationMs, positionMs, playing: true, sinceMs: 0 };
    }
    const s = this.soloist.state();
    if (s.connection !== 'open') return { kind: 'message', text: s.connection === 'off' ? 'OFF' : 'OFFLINE' };
    const t = s.item;
    if (!t) return { kind: 'message', text: s.loggedIn ? 'READY' : 'PAIR ME' };
    return {
      kind: 'track',
      id: t.id,
      title: t.title || t.uri,
      artist: t.artists.join(', ') || t.album,
      durationMs: t.durationMs,
      positionMs: positionNow(s, Date.now()),
      playing: s.status === 'playing',
      sinceMs: 0,
    };
  }

  /** Cover art for the current frame: generated for the demo, the shrunk real cover otherwise. */
  private coverFor(shown: Shown): Uint8ClampedArray | undefined {
    if (shown.kind !== 'track') return undefined;
    if (this.source() === 'soloist') return safe(this.art);
    if (this.source() === 'mine') return safe(this.mineCovers)?.get(shown.id);
    let cover = this.demoCovers.get(shown.id);
    if (!cover) {
      cover = demoCover(shown.id);
      this.demoCovers.set(shown.id, cover);
    }
    return cover;
  }
}
