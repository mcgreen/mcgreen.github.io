import { TimeRange } from './spotify/models';

/**
 * "Personal heat": Spotify removed `popularity`, so heat is now derived from
 * YOUR listening: how high an item ranks in your short, medium and long-term
 * top lists. Recent rank counts most.
 */
export type RankLists = Record<TimeRange, string[]>;

const WEIGHTS: Record<TimeRange, number> = { short_term: 0.5, medium_term: 0.3, long_term: 0.2 };

/** 0-100. 100 = #1 in every list. 0 = in none of them. */
export function personalHeat(id: string, lists: RankLists): number {
  let score = 0;
  for (const range of Object.keys(WEIGHTS) as TimeRange[]) {
    const list = lists[range];
    const idx = list.indexOf(id);
    if (idx >= 0 && list.length > 0) {
      // Rank 0 -> 1.0, last place -> 0.1
      score += WEIGHTS[range] * (1 - (idx / list.length) * 0.9);
    }
  }
  return Math.round(score * 100);
}

export type Trend = 'rising' | 'cooling' | 'steady' | 'new';

/** Compares recent rank against long-term rank. */
export function trend(id: string, lists: RankLists): Trend {
  const short = lists.short_term.indexOf(id);
  const long = lists.long_term.indexOf(id);
  if (short >= 0 && long < 0) return 'new';
  if (short < 0 && long >= 0) return 'cooling';
  if (short < 0 && long < 0) return 'steady';
  const delta = long - short; // positive = climbed toward #1
  if (delta >= 5) return 'rising';
  if (delta <= -5) return 'cooling';
  return 'steady';
}

export interface HeatGap {
  /** personal - global, -100..100. Positive = hotter for you than for the world. */
  delta: number;
  label: string;
}

/**
 * Compares YOUR heat with global heat (Spotify's 0-100 popularity). Only call it when a
 * global value exists. The label stays empty unless the gap is big enough to mean something.
 */
export function heatGap(personal: number, global: number): HeatGap {
  const delta = Math.round(personal - global);
  const label = delta >= 25 ? 'Your secret' : delta <= -25 ? 'Hit you skip' : Math.abs(delta) <= 10 && personal >= 50 ? 'In sync' : '';
  return { delta, label };
}

export interface AlbumHeat {
  id: string;
  name: string;
  image: string | null;
  artist: string;
  /** How many of the album's tracks are in the list. */
  tracks: number;
  heat: number;
}

/** An album's heat: its hottest track plus a quarter of each extra track's heat, capped at 100. */
export function combineHeat(heats: number[]): number {
  if (!heats.length) return 0;
  const sorted = [...heats].sort((a, b) => b - a);
  const rest = sorted.slice(1).reduce((s, h) => s + h, 0);
  return Math.min(100, Math.round(sorted[0] + rest * 0.25));
}

/**
 * Spotify has no "top albums", so derive them: group tracks by album. An album's heat is its
 * hottest track plus a quarter of each extra track's heat, capped at 100. Sorted hottest first.
 */
export function topAlbums(
  tracks: { id: string; album: { id: string; name: string; images: { url: string }[] }; artists: { name: string }[] }[],
  lists: RankLists,
): AlbumHeat[] {
  const byAlbum = new Map<string, AlbumHeat & { rest: number }>();
  for (const t of tracks) {
    const h = personalHeat(t.id, lists);
    const cur = byAlbum.get(t.album.id);
    if (!cur) {
      byAlbum.set(t.album.id, { id: t.album.id, name: t.album.name, image: t.album.images[0]?.url ?? null, artist: t.artists[0]?.name ?? '', tracks: 1, heat: h, rest: 0 });
    } else {
      cur.tracks++;
      if (h > cur.heat) { cur.rest += cur.heat; cur.heat = h; } else cur.rest += h;
    }
  }
  return [...byAlbum.values()]
    .map(({ rest, ...a }) => ({ ...a, heat: Math.min(100, Math.round(a.heat + rest * 0.25)) }))
    .sort((a, b) => b.heat - a.heat);
}
