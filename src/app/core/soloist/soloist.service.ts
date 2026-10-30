import { Service, computed, effect, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, repeat, scan, startWith } from 'rxjs';
import { safe } from '../resource';
import {
  Frame,
  INITIAL_STATE,
  QUERY_GET_QUEUE,
  QUERY_GET_STATE,
  SoloistState,
  parseAddress,
  parseMessage,
  reduce,
} from './soloist';

const KEY = 'sdash2.soloist';
const DEFAULT_ADDRESS = '127.0.0.1:9090';
/** Pause between reconnect attempts (RxJS `repeat` schedules it; no timers by hand). */
const RECONNECT_MS = 2000;

function savedAddress(): string {
  try {
    return localStorage.getItem(KEY) || DEFAULT_ADDRESS;
  } catch {
    return DEFAULT_ADDRESS;
  }
}

/**
 * Live view of a local Spotify Soloist process.
 *
 * - Read-only: the only things ever sent are `get_state` and `get_queue` queries.
 * - Local-only: `parseAddress` rejects anything but loopback, because Soloist's WebSocket has no
 *   authentication, TLS or Origin checks.
 * - Opt-in: nothing connects until `connect()` is called.
 */
@Service()
export class SoloistService {
  /** Form model for the address box (the page binds a Signal Form to this). */
  readonly settings = signal({ address: savedAddress() });
  /** Validated `ws://` URL, or null while the typed address is not a loopback address. */
  readonly url = computed(() => parseAddress(this.settings().address));

  private readonly enabled = signal(false);

  private readonly feed = rxResource<SoloistState, string | undefined>({
    params: () => (this.enabled() ? (this.url() ?? undefined) : undefined),
    stream: ({ params }) =>
      frames(params).pipe(
        // Socket closed: wait, then dial again. State resets on every close (see `reduce`).
        repeat({ delay: RECONNECT_MS }),
        scan(reduce, INITIAL_STATE),
        startWith(INITIAL_STATE),
      ),
  });

  readonly state = computed<SoloistState>(
    () => safe(this.feed) ?? { ...INITIAL_STATE, connection: this.enabled() && this.url() ? 'connecting' : 'off' },
  );
  readonly connected = computed(() => this.state().connection === 'open');

  constructor() {
    // localStorage is a non-signal API, so persisting the address is a legitimate effect.
    effect(() => {
      const address = this.settings().address;
      try {
        localStorage.setItem(KEY, address);
      } catch {
        /* storage unavailable */
      }
    });
  }

  connect(): void {
    this.enabled.set(true);
  }

  disconnect(): void {
    this.enabled.set(false);
  }
}

/** One connection attempt as a stream of frames. Completes when the socket closes. */
function frames(url: string): Observable<Frame> {
  return new Observable<Frame>((sub) => {
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      // e.g. a browser that blocks ws:// from an https page. Report it as a closed socket and retry.
      sub.next({ kind: 'closed' });
      sub.complete();
      return;
    }
    const ask = (query: string): void => {
      if (ws.readyState === WebSocket.OPEN) ws.send(query);
    };

    ws.onopen = () => sub.next({ kind: 'open' });
    ws.onmessage = (ev: MessageEvent) => {
      const msg = parseMessage(ev.data);
      if (!msg) return;
      sub.next({ kind: 'message', msg, at: Date.now() });
      // A full snapshot is the cue to also fetch the queue; a fresh login is the cue to fetch the snapshot.
      if (msg['type'] === 'playback_state') ask(QUERY_GET_QUEUE);
      if (msg['type'] === 'auth_state' && msg['logged_in'] === true) ask(QUERY_GET_STATE);
    };
    ws.onclose = () => {
      sub.next({ kind: 'closed' });
      sub.complete();
    };
    ws.onerror = () => {
      /* `close` always follows an error, and handles it */
    };

    return () => {
      ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
      ws.close();
    };
  });
}
