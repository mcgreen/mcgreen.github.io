/**
 * Types and pure helpers for the Spotify Soloist WebSocket API.
 * https://developer.spotify.com/documentation/soloist/reference/websocket-api
 *
 * Soloist is a headless Spotify Connect player. Its local WebSocket pushes playback events as JSON.
 * Everything that arrives is treated as untrusted data: it is parsed defensively, numbers are
 * clamped, and cover URLs are only accepted from Spotify's image CDN.
 *
 * This file is free of Angular and the DOM so it can be unit-tested (and reused in a Node script
 * on the device that drives the real LED board).
 */

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'buffering';
export type Connection = 'off' | 'connecting' | 'open' | 'reconnecting';

export interface SoloistTrack {
  uri: string;
  /** Last segment of the URI. Stable per track. */
  id: string;
  /** `track`, `episode`, `ad`, ... */
  kind: string;
  title: string;
  artists: string[];
  album: string;
  coverUrl: string | null;
  durationMs: number;
}

/** Where playback was at `timestampMs` (wall clock), and how fast it advances (0 = paused). */
export interface PositionAnchor {
  positionMs: number;
  timestampMs: number;
  speed: number;
}

export interface SoloistState {
  connection: Connection;
  loggedIn: boolean;
  deviceName: string;
  status: PlaybackStatus;
  item: SoloistTrack | null;
  position: PositionAnchor;
  upcoming: SoloistTrack[];
  /** 0-100, or null until Soloist reports it. */
  volume: number | null;
}

export const INITIAL_STATE: SoloistState = {
  connection: 'connecting',
  loggedIn: false,
  deviceName: '',
  status: 'idle',
  item: null,
  position: { positionMs: 0, timestampMs: 0, speed: 0 },
  upcoming: [],
  volume: null,
};

/** What the reducer consumes: socket lifecycle, plus each parsed message with its arrival time. */
export type Frame =
  | { kind: 'open' }
  | { kind: 'closed' }
  | { kind: 'message'; msg: Record<string, unknown>; at: number };

/** The only messages this client ever sends. Read-only queries: no playback commands. */
export const QUERY_GET_STATE = JSON.stringify({ type: 'command', command: 'get_state' });
export const QUERY_GET_QUEUE = JSON.stringify({ type: 'command', command: 'get_queue', limit: 10 });

/** Broadcast queue events are capped at 10 entries by Soloist, so ask for no more. */
const MAX_UPCOMING = 10;

// ---- Address handling ----------------------------------------------------------------------

const LOOPBACK = /^(127\.0\.0\.1|localhost|\[::1\]):(\d{1,5})$/i;

/**
 * Turns "127.0.0.1:9090" into "ws://127.0.0.1:9090", or null if it is not a loopback address.
 * Soloist's socket has no auth, TLS or Origin checks, so this app refuses to dial anything that
 * is not on this machine. Reach a remote Soloist through an SSH tunnel or Tailscale instead.
 */
export function parseAddress(input: string): string | null {
  const m = LOOPBACK.exec(input.trim());
  if (!m) return null;
  const port = Number(m[2]);
  if (port < 1 || port > 65535) return null;
  return `ws://${m[1].toLowerCase()}:${port}`;
}

// ---- Parsing (untrusted input) --------------------------------------------------------------

const rec = (v: unknown): Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const num = (v: unknown, fallback: number, min: number, max: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

/** Parses one text frame into a message object, or null if it is not a JSON object with a `type`. */
export function parseMessage(data: unknown): Record<string, unknown> | null {
  if (typeof data !== 'string') return null;
  try {
    const msg = rec(JSON.parse(data));
    return typeof msg['type'] === 'string' ? msg : null;
  } catch {
    return null;
  }
}

const COVER_ORDER = ['small', 'default', 'large', 'xlarge'];

/** Picks the smallest cover (the panel only needs 32x32) and accepts only Spotify's image CDN over https. */
function pickCover(covers: unknown): string | null {
  const list = Array.isArray(covers) ? covers.map(rec) : [];
  list.sort((a, b) => COVER_ORDER.indexOf(str(a['size'])) - COVER_ORDER.indexOf(str(b['size'])));
  for (const c of list) {
    try {
      const u = new URL(str(c['url']));
      if (u.protocol === 'https:' && u.hostname.endsWith('.scdn.co')) return u.href;
    } catch {
      /* not a URL */
    }
  }
  return null;
}

/** `decorations.identity.name` of an entity, or "". */
const nameOf = (entity: unknown): string => str(rec(rec(rec(entity)['decorations'])['identity'])['name']);

/** Soloist "entity" envelope -> a flat track, or null when there is no usable URI. */
export function toTrack(entity: unknown): SoloistTrack | null {
  const e = rec(entity);
  const uri = str(e['uri']);
  if (!uri) return null;
  const d = rec(e['decorations']);
  const creators = Array.isArray(d['creators']) ? d['creators'] : [];
  return {
    uri,
    id: uri.split(':').pop() ?? uri,
    kind: str(e['entity_type']),
    title: nameOf(e),
    artists: creators.map((c) => nameOf(rec(c)['entity'])).filter(Boolean),
    album: nameOf(rec(d['parent'])['entity']),
    coverUrl: pickCover(rec(d['visual_identity'])['cover']),
    durationMs: num(rec(d['playback'])['duration_ms'], 0, 0, 24 * 3_600_000),
  };
}

function toPosition(v: unknown): PositionAnchor | null {
  const p = rec(v);
  if (typeof p['timestamp_ms'] !== 'number') return null;
  return {
    positionMs: num(p['position_ms'], 0, 0, 24 * 3_600_000),
    timestampMs: num(p['timestamp_ms'], 0, 0, Number.MAX_SAFE_INTEGER),
    speed: num(p['speed'], 1, 0, 4),
  };
}

function toStatus(v: unknown): PlaybackStatus {
  return v === 'playing' || v === 'paused' || v === 'buffering' ? v : 'idle';
}

// ---- Reducer ---------------------------------------------------------------------------------

/** Folds one frame into the state. Pure: the arrival time travels inside the frame. */
export function reduce(state: SoloistState, frame: Frame): SoloistState {
  switch (frame.kind) {
    case 'open':
      return { ...state, connection: 'open' };
    case 'closed':
      // Forget everything: a dead socket must never leave a stale "now playing" on the board.
      return { ...INITIAL_STATE, connection: 'reconnecting' };
    case 'message':
      return reduceMessage(state, frame.msg, frame.at);
  }
}

function reduceMessage(state: SoloistState, m: Record<string, unknown>, at: number): SoloistState {
  switch (m['type']) {
    case 'auth_state':
      return { ...state, loggedIn: m['logged_in'] === true, deviceName: str(m['device_name']) || state.deviceName };
    case 'playback_state':
      return {
        ...state,
        status: toStatus(m['status']),
        item: toTrack(m['item']),
        position: toPosition(m['position']) ?? state.position,
        volume: typeof m['volume'] === 'number' ? num(m['volume'], 0, 0, 100) : state.volume,
      };
    case 'track_changed':
      // The new position_sync arrives right after; until then restart from zero.
      return {
        ...state,
        item: toTrack(m['item']),
        position: { positionMs: 0, timestampMs: at, speed: state.status === 'playing' ? 1 : 0 },
      };
    case 'playback_changed':
      return { ...state, status: toStatus(m['status']) };
    case 'position_sync':
      return { ...state, position: toPosition(m['position']) ?? state.position };
    case 'volume_changed':
      return { ...state, volume: num(m['volume'], 0, 0, 100) };
    case 'queue_changed': {
      const up = Array.isArray(m['upcoming']) ? m['upcoming'] : [];
      const tracks = up.map((q) => toTrack(rec(q)['item'])).filter((t): t is SoloistTrack => t !== null);
      return { ...state, upcoming: tracks.slice(0, MAX_UPCOMING) };
    }
    default:
      return state; // error, command_result, device_changed, context_changed, options_changed, ...
  }
}

/** Playback position right now, interpolated from the last anchor (Soloist only sends on change). */
export function positionNow(state: SoloistState, nowMs: number): number {
  const { positionMs, timestampMs, speed } = state.position;
  const pos = state.status === 'playing' && speed > 0 ? positionMs + (nowMs - timestampMs) * speed : positionMs;
  const dur = state.item?.durationMs ?? 0;
  return dur > 0 ? Math.min(Math.max(pos, 0), dur) : Math.max(pos, 0);
}
