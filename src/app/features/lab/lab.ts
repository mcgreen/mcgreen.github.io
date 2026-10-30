import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom, timer } from 'rxjs';
import { SpotifyApi } from '../../core/spotify/spotify-api.service';
import { inferShape } from './infer-shape';

type Verdict = 'pending' | 'running' | 'works' | 'gone' | 'forbidden' | 'empty' | 'error';

interface Probe {
  group: string;
  label: string;
  path: (ids: Ids) => string;
  /** What the docs say should happen, so surprises stand out. */
  expect: 'works' | 'gone';
}
interface Ids { artist: string; album: string; track: string; category: string; show: string; audiobook: string; episode: string; }
interface Row extends Probe {
  verdict: Verdict;
  status?: number;
  keys?: string;
  body?: string;
  /** Parsed response, kept only so we can infer its shape. */
  data?: unknown;
  ms?: number;
}

const PROBES: Probe[] = [
  { group: 'You', label: 'Profile', path: () => '/me', expect: 'works' },
  { group: 'You', label: 'Top tracks', path: () => '/me/top/tracks?limit=1', expect: 'works' },
  { group: 'You', label: 'Top artists', path: () => '/me/top/artists?limit=1', expect: 'works' },
  { group: 'You', label: 'Recently played', path: () => '/me/player/recently-played?limit=1', expect: 'works' },
  { group: 'Library', label: 'Saved albums', path: () => '/me/albums?limit=1', expect: 'works' },
  { group: 'Library', label: 'Saved tracks', path: () => '/me/tracks?limit=1', expect: 'works' },
  { group: 'Library', label: 'Followed artists', path: () => '/me/following?type=artist&limit=1', expect: 'works' },
  { group: 'Library', label: 'Your playlists', path: () => '/me/playlists?limit=1', expect: 'works' },
  { group: 'Library', label: 'Saved shows', path: () => '/me/shows?limit=1', expect: 'works' },
  { group: 'Library', label: 'Saved episodes', path: () => '/me/episodes?limit=1', expect: 'works' },
  { group: 'Library', label: 'Saved audiobooks', path: () => '/me/audiobooks?limit=1', expect: 'works' },
  { group: 'Podcasts & books', label: 'Show', path: (i) => `/shows/${i.show}`, expect: 'works' },
  { group: 'Podcasts & books', label: 'Show episodes', path: (i) => `/shows/${i.show}/episodes?limit=2`, expect: 'works' },
  { group: 'Podcasts & books', label: 'Episode', path: (i) => `/episodes/${i.episode}`, expect: 'works' },
  { group: 'Podcasts & books', label: 'Audiobook', path: (i) => `/audiobooks/${i.audiobook}`, expect: 'works' },
  { group: 'Podcasts & books', label: 'Audiobook chapters', path: (i) => `/audiobooks/${i.audiobook}/chapters?limit=2`, expect: 'works' },
  { group: 'Player', label: 'Player state', path: () => '/me/player', expect: 'works' },
  { group: 'Player', label: 'Devices', path: () => '/me/player/devices', expect: 'works' },
  { group: 'Player', label: 'Queue', path: () => '/me/player/queue', expect: 'works' },
  { group: 'Player', label: 'Currently playing', path: () => '/me/player/currently-playing', expect: 'works' },
  { group: 'Catalog', label: 'Search (limit 10)', path: () => '/search?q=radiohead&type=artist,track,album&limit=10', expect: 'works' },
  { group: 'Catalog', label: 'Artist', path: (i) => `/artists/${i.artist}`, expect: 'works' },
  { group: 'Catalog', label: 'Artist albums', path: (i) => `/artists/${i.artist}/albums?limit=1`, expect: 'works' },
  { group: 'Catalog', label: 'Album', path: (i) => `/albums/${i.album}`, expect: 'works' },
  { group: 'Catalog', label: 'Album tracks', path: (i) => `/albums/${i.album}/tracks?limit=1`, expect: 'works' },
  { group: 'Catalog', label: 'Track', path: (i) => `/tracks/${i.track}`, expect: 'works' },
  { group: 'Removed?', label: 'Artist top tracks', path: (i) => `/artists/${i.artist}/top-tracks`, expect: 'gone' },
  { group: 'Removed?', label: 'Related artists', path: (i) => `/artists/${i.artist}/related-artists`, expect: 'gone' },
  { group: 'Removed?', label: 'Audio features', path: (i) => `/audio-features/${i.track}`, expect: 'gone' },
  { group: 'Removed?', label: 'Audio analysis', path: (i) => `/audio-analysis/${i.track}`, expect: 'gone' },
  { group: 'Removed?', label: 'Recommendations', path: (i) => `/recommendations?seed_artists=${i.artist}&limit=1`, expect: 'gone' },
  { group: 'Removed?', label: 'New releases', path: () => '/browse/new-releases?limit=1', expect: 'gone' },
  { group: 'Removed?', label: 'Categories', path: () => '/browse/categories?limit=1', expect: 'gone' },
  { group: 'Removed?', label: 'Featured playlists', path: () => '/browse/featured-playlists?limit=1', expect: 'gone' },
  { group: 'Removed?', label: 'Category playlists', path: (i) => `/browse/categories/${i.category}/playlists?limit=1`, expect: 'gone' },
  { group: 'Removed?', label: 'Markets', path: () => '/markets', expect: 'gone' },
];

const sleep = (ms: number) => firstValueFrom(timer(ms));

/**
 * API Lab: calls every endpoint we care about with your own token and shows what
 * Spotify actually answers today. Read-only GETs only, spaced out to be polite.
 */
@Component({
  selector: 'app-lab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lab.html',
  styleUrl: './lab.scss',
})
export class Lab {
  private readonly api = inject(SpotifyApi);

  protected readonly groups = [...new Set(PROBES.map((p) => p.group))];
  protected readonly rows = signal<Row[]>(PROBES.map((p) => ({ ...p, verdict: 'pending' as Verdict })));
  protected readonly running = signal(false);
  protected readonly done = signal(false);
  protected readonly open = signal<string | null>(null);

  protected rowsOf(g: string): Row[] {
    return this.rows().filter((r) => r.group === g);
  }
  protected toggle(label: string): void {
    this.open.set(this.open() === label ? null : label);
  }
  protected text(r: Row): string {
    return { pending: '—', running: '…', works: 'works', gone: 'gone', forbidden: 'forbidden', empty: 'no data', error: 'error' }[r.verdict];
  }
  protected surprise(r: Row): boolean {
    if (r.verdict === 'pending' || r.verdict === 'running') return false;
    const live = r.verdict === 'works' || r.verdict === 'empty';
    return r.expect === 'gone' ? live : !live;
  }

  protected shape(r: Row): string {
    return r.data === undefined ? 'No body.' : inferShape(r.data);
  }

  /** Shapes only: field names and types, never values, so the file is safe to commit. */
  protected download(): void {
    const out = [
      '# Spotify API: observed response shapes',
      '',
      `Generated by the in-app API Lab on ${new Date().toISOString().slice(0, 10)}. Field names and types only; no values.`,
      'Optional (`?`) means missing from at least one item in the sample. Verdict is what the live API did for this app.',
      '',
      '| Endpoint | Status | Verdict | Docs said |',
      '|---|---|---|---|',
      ...this.rows().map((r) => `| ${r.label} | ${r.status ?? ''} | ${this.text(r)} | ${r.expect} |`),
      '',
      ...this.rows().flatMap((r) => [`## ${r.label}`, '', `Status ${r.status ?? 'n/a'} (${this.text(r)})`, '', '```ts', this.shape(r), '```', '']),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([out], { type: 'text/markdown' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spotify-responses.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  private patch(label: string, change: Partial<Row>): void {
    this.rows.update((rs) => rs.map((r) => (r.label === label ? { ...r, ...change } : r)));
  }

  protected async run(): Promise<void> {
    this.running.set(true);
    this.rows.update((rs) => rs.map((r) => ({ ...r, verdict: 'pending', status: undefined, keys: undefined, body: undefined })));
    const ids = await this.seedIds();
    for (const p of PROBES) {
      this.patch(p.label, { verdict: 'running' });
      const t0 = performance.now();
      try {
        const res = await firstValueFrom(this.api.probe(p.path(ids)));
        const body = res.body;
        const empty = res.status === 204 || body == null || (typeof body === 'object' && 'items' in (body as object) && ((body as { items: unknown[] }).items?.length ?? 0) === 0);
        this.patch(p.label, {
          verdict: empty ? 'empty' : 'works',
          status: res.status,
          keys: body && typeof body === 'object' ? Object.keys(body as object).join(', ') : undefined,
          body: body == null ? undefined : JSON.stringify(body, null, 2).slice(0, 6000),
          data: body ?? undefined,
          ms: Math.round(performance.now() - t0),
        });
      } catch (e) {
        const err = e as HttpErrorResponse;
        const status = err.status;
        this.patch(p.label, {
          verdict: status === 403 ? 'forbidden' : status === 404 || status === 410 ? 'gone' : 'error',
          status,
          body: typeof err.error === 'object' ? JSON.stringify(err.error, null, 2) : String(err.error ?? err.message),
        });
      }
      await sleep(200);
    }
    this.running.set(false);
    this.done.set(true);
  }

  /** Real ids from the user's own top lists, falling back to well-known public ones. */
  private async seedIds(): Promise<Ids> {
    const ids: Ids = { artist: '4Z8W4fKeB5YxbusRsdQVPb', album: '6dVIqQ8qmQ5GBnJ9shOYGE', track: '2EqlS6tkEnglzr7tkKAAYD', category: 'toplists', show: '', audiobook: '', episode: '' };
    try {
      const a = await firstValueFrom(this.api.probe('/me/top/artists?time_range=medium_term&limit=1'));
      const artist = (a.body as { items?: { id: string }[] } | null)?.items?.[0];
      if (artist) ids.artist = artist.id;
      const t = await firstValueFrom(this.api.probe('/me/top/tracks?time_range=medium_term&limit=1'));
      const track = (t.body as { items?: { id: string; album: { id: string } }[] } | null)?.items?.[0];
      if (track) {
        ids.track = track.id;
        ids.album = track.album.id;
      }
    } catch {
      /* keep the fallback ids */
    }
    try {
      const sh = await firstValueFrom(this.api.probe('/me/shows?limit=1'));
      const show = (sh.body as { items?: { show: { id: string } }[] } | null)?.items?.[0]?.show.id;
      if (show) {
        ids.show = show;
        const ep = await firstValueFrom(this.api.probe(`/shows/${show}/episodes?limit=1`));
        ids.episode = (ep.body as { items?: { id: string }[] } | null)?.items?.[0]?.id ?? '';
      }
      const ab = await firstValueFrom(this.api.probe('/me/audiobooks?limit=1'));
      ids.audiobook = (ab.body as { items?: { id: string }[] } | null)?.items?.[0]?.id ?? '';
    } catch {
      /* no saved podcasts or audiobooks: those probes will 404, which is itself informative */
    }
    try {
      const c = await firstValueFrom(this.api.probe('/browse/categories?limit=1'));
      const first = (c.body as { categories?: { items?: { id: string }[] } } | null)?.categories?.items?.[0];
      if (first) ids.category = first.id;
    } catch {
      /* categories are gone: keep the fallback */
    }
    return ids;
  }
}
