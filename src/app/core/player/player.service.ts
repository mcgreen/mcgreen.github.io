import { HttpErrorResponse } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Subscription, firstValueFrom, from, interval, throwError, timeout } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { describeError } from '../errors';
import { StartPlaybackBody } from '../spotify/models';
import { SpotifyApi } from '../spotify/spotify-api.service';

/* ---- Minimal typings for the Web Playback SDK (loaded from sdk.scdn.co) ---- */
export interface SdkTrack {
  uri: string;
  id: string | null;
  name: string;
  artists: { name: string; uri: string }[];
  album: { name: string; uri: string; images: { url: string }[] };
}

export interface SdkState {
  paused: boolean;
  position: number;
  /** Track length in ms. Present on real SDK state objects; not shown in the docs table. */
  duration: number;
  shuffle: boolean;
  repeat_mode: 0 | 1 | 2;
  context: { uri: string | null };
  disallows: Record<string, boolean | undefined>;
  track_window: { current_track: SdkTrack; previous_tracks: SdkTrack[]; next_tracks: SdkTrack[] };
}

interface SdkPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: string, cb: (arg: any) => void): boolean;
  togglePlay(): Promise<void>;
  nextTrack(): Promise<void>;
  previousTrack(): Promise<void>;
  seek(ms: number): Promise<void>;
  setVolume(v: number): Promise<void>;
  activateElement(): Promise<void>;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: { Player: new (opts: object) => SdkPlayer };
  }
}

export interface PlayRequest {
  /** Play these tracks, starting from the first. */
  uris?: string[];
  /** Play an album, artist or playlist context. */
  contextUri?: string;
  /** Within a context, start at this track. */
  offsetUri?: string;
}

const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';

/**
 * App-wide Spotify playback. Owns the one SDK player for the whole session so
 * music keeps going while the user navigates (the v1 player lived inside the
 * Home page and never started anything).
 */
@Service()
export class PlayerService {
  private readonly auth = inject(AuthService);
  private readonly api = inject(SpotifyApi);

  private player?: SdkPlayer;
  private started = false;
  private resolveDevice!: (id: string) => void;
  private readonly deviceReady = new Promise<string>((resolve) => (this.resolveDevice = resolve));
  private tick?: Subscription;

  readonly status = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly error = signal<string | null>(null);
  readonly deviceId = signal<string | null>(null);
  readonly state = signal<SdkState | null>(null);
  /** Interpolated playback position in ms (the SDK only reports on changes). */
  readonly positionMs = signal(0);
  readonly volume = signal(0.5);

  readonly track = computed(() => this.state()?.track_window.current_track ?? null);
  readonly paused = computed(() => this.state()?.paused ?? true);
  readonly durationMs = computed(() => this.state()?.duration ?? 0);
  readonly albumArt = computed(() => this.track()?.album.images[0]?.url ?? null);

  /** Idempotent. Call once the user is logged in. */
  init(): void {
    if (this.started) return;
    this.started = true;
    this.status.set('loading');

    window.onSpotifyWebPlaybackSDKReady = () => this.createPlayer();
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.onerror = () => this.fail('Could not load the Spotify player. A content blocker may be stopping it.');
    document.head.appendChild(script);
  }

  private createPlayer(): void {
    const Spotify = window.Spotify;
    if (!Spotify) return this.fail('Spotify player failed to load.');

    const player = new Spotify.Player({
      name: 'Heat (web)',
      // Called on connect and whenever the SDK needs a fresh token.
      getOAuthToken: (cb: (token: string) => void) => {
        void this.auth.getValidToken().then((t) => t && cb(t));
      },
      volume: this.volume(),
      enableMediaSession: true,
    });
    this.player = player;

    player.addListener('ready', ({ device_id }: { device_id: string }) => {
      this.deviceId.set(device_id);
      this.status.set('ready');
      this.error.set(null);
      this.resolveDevice(device_id);
    });
    player.addListener('not_ready', () => {
      this.deviceId.set(null);
      this.status.set('loading');
    });
    player.addListener('player_state_changed', (s: SdkState | null) => this.apply(s));

    player.addListener('initialization_error', () =>
      this.fail("This browser can't play Spotify audio (no DRM support)."),
    );
    player.addListener('authentication_error', () =>
      this.fail('Spotify rejected the login for playback. Try logging out and in again.'),
    );
    player.addListener('account_error', () =>
      this.fail('Spotify Premium is required to play music in the browser.'),
    );
    player.addListener('playback_error', ({ message }: { message: string }) => this.error.set(message));

    void player.connect();
  }

  /**
   * Starts playback on this browser. Call it directly from a click handler:
   * `activateElement()` has to run inside the user gesture or browsers may block audio.
   */
  async play(req: PlayRequest): Promise<void> {
    this.init();
    void this.player?.activateElement();
    try {
      const deviceId = await firstValueFrom(
        from(this.deviceReady).pipe(
          timeout({ first: 10_000, with: () => throwError(() => new Error('Player is still starting. Try again.')) }),
        ),
      );
      const body: StartPlaybackBody = req.contextUri
        ? { context_uri: req.contextUri, ...(req.offsetUri ? { offset: { uri: req.offsetUri } } : {}) }
        : { uris: req.uris };
      try {
        await firstValueFrom(this.api.startPlayback(deviceId, body));
      } catch (e) {
        // 404: Spotify doesn't know this device yet. Transfer playback to it, then retry once.
        if (e instanceof HttpErrorResponse && e.status === 404) {
          await firstValueFrom(this.api.transferPlayback(deviceId, false));
          await firstValueFrom(this.api.startPlayback(deviceId, body));
        } else {
          throw e;
        }
      }
      this.error.set(null);
    } catch (e) {
      this.error.set(describeError(e));
    }
  }

  toggle = () => void this.player?.togglePlay();
  next = () => void this.player?.nextTrack();
  previous = () => void this.player?.previousTrack();
  seek = (ms: number) => void this.player?.seek(ms);

  setVolume(v: number): void {
    this.volume.set(v);
    void this.player?.setVolume(v);
  }

  private apply(s: SdkState | null): void {
    this.state.set(s);
    this.tick?.unsubscribe();
    if (!s) return;
    this.positionMs.set(s.position);
    if (!s.paused) {
      const startedAt = performance.now();
      this.tick = interval(250).subscribe(() => {
        this.positionMs.set(Math.min(s.position + (performance.now() - startedAt), s.duration));
      });
    }
  }

  private fail(message: string): void {
    this.status.set('error');
    this.error.set(message);
  }
}
