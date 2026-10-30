import { SpotifyTrack } from '../../core/spotify/models';

/** One entry of the "my top artists" preview. */
export interface MineTrack {
  id: string;
  title: string;
  artist: string;
  durationMs: number;
  /** Smallest album image on Spotify's CDN (the board only needs 32x32), or null. */
  coverUrl: string | null;
}

type Lists = Record<'short_term' | 'medium_term' | 'long_term', SpotifyTrack[]>;

/** How many artists to shuffle through, and how long each one stays on the board. */
export const MINE_COUNT = 8;
export const SLOT_MS = 15_000;

function smallestCover(t: SpotifyTrack): string | null {
  const images = [...(t.album.images ?? [])].sort((a, b) => (a.width ?? Infinity) - (b.width ?? Infinity));
  for (const img of images) {
    try {
      const u = new URL(img.url);
      if (u.protocol === 'https:' && u.hostname.endsWith('.scdn.co')) return u.href;
    } catch {
      /* not a URL */
    }
  }
  return null;
}

/**
 * One track for each of your top artists, in random order. "Top artists" here means the artists of
 * your most-played tracks (medium term first, then short, then long), one track per artist, so you
 * see songs you actually know. Returns [] until the lists have loaded.
 */
export function pickMine(lists: Lists | null, rng: () => number = Math.random): MineTrack[] {
  if (!lists) return [];
  const seen = new Set<string>();
  const picked: MineTrack[] = [];
  for (const t of [...lists.medium_term, ...lists.short_term, ...lists.long_term]) {
    const artist = t.artists[0];
    if (!artist || seen.has(artist.id)) continue;
    seen.add(artist.id);
    picked.push({ id: t.id, title: t.name, artist: artist.name, durationMs: t.duration_ms, coverUrl: smallestCover(t) });
    if (picked.length === MINE_COUNT) break;
  }
  // Fisher-Yates
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return picked;
}

/** Which track is on the board `elapsedMs` after the preview started. The clock is simulated: nothing is playing. */
export function mineAt(list: readonly MineTrack[], elapsedMs: number): { track: MineTrack; positionMs: number } {
  const slot = Math.floor(Math.max(0, elapsedMs) / SLOT_MS) % list.length;
  const track = list[slot];
  const within = Math.max(0, elapsedMs) % SLOT_MS;
  return { track, positionMs: Math.min(track.durationMs, track.durationMs * 0.25 + within) };
}
