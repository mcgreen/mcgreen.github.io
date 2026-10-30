import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { errorText } from '../../core/errors';
import { personalHeat, topAlbums, trend } from '../../core/heat';
import { PlayerService } from '../../core/player/player.service';
import { safe } from '../../core/resource';
import { Paging, PlayHistory, TimeRange } from '../../core/spotify/models';
import { SpotifyApi } from '../../core/spotify/spotify-api.service';
import { TasteService } from '../../core/taste.service';
import { AlbumCard } from '../../shared/ui/album-card';
import { ArtistChip } from '../../shared/ui/artist-chip';
import { TrackRow } from '../../shared/ui/track-row';

const RANGES: { id: TimeRange; label: string }[] = [
  { id: 'short_term', label: 'Last 4 weeks' },
  { id: 'medium_term', label: 'Last 6 months' },
  { id: 'long_term', label: 'Last year' },
];

const TREND_LABEL = { rising: '▲ Rising', cooling: '▼ Cooling', steady: '', new: '★ New' } as const;

/**
 * Home > Music: the original heat page. Your top tracks, albums (derived) and artists with Your
 * and World heat meters, plus new releases and recently played.
 */
@Component({
  selector: 'app-music-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TrackRow, AlbumCard, ArtistChip],
  templateUrl: './music-view.html',
  styleUrl: './music-view.scss',
})
export class MusicView {
  private readonly api = inject(SpotifyApi);
  private readonly player = inject(PlayerService);
  private readonly taste = inject(TasteService);

  protected readonly ranges = RANGES;
  protected readonly range = signal<TimeRange>('medium_term');
  protected readonly loading = this.taste.tracksLoading;
  protected readonly error = computed(() => errorText(this.taste.tracksError()));

  private readonly recentRes = httpResource<Paging<PlayHistory>>(() => this.api.req.recentlyPlayed(20));
  protected readonly recent = computed(() => (safe(this.recentRes)?.items ?? []).map((h) => h.track));

  protected readonly rows = computed(() => {
    const lists = this.taste.tracks();
    const ids = this.taste.trackRanks();
    if (!lists || !ids) return [];
    return lists[this.range()].map((track, i) => ({
      track,
      rank: i + 1,
      heat: personalHeat(track.id, ids),
      global: track.popularity ?? null,
      trend: TREND_LABEL[trend(track.id, ids)],
    }));
  });

  /**
   * "New releases" from Spotify's browse endpoint is frozen (it returns 2024 albums), so build it
   * from real data instead: the latest albums and singles of your top artists, newest first.
   */
  private readonly releasesRes = rxResource({
    params: () => (this.taste.artists()?.['medium_term'] ?? []).slice(0, 15).map((a) => a.id),
    stream: ({ params }) =>
      params.length
        ? forkJoin(params.map((id) => this.api.artistAlbumsList(id).pipe(catchError(() => of(null)))))
        : of([]),
  });
  protected readonly releases = computed(() => {
    const seen = new Set<string>();
    return (safe(this.releasesRes) ?? [])
      .flatMap((page) => page?.items ?? [])
      .filter((al) => !!al.release_date && !seen.has(al.id) && !!seen.add(al.id))
      .sort((a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? ''))
      .slice(0, 12);
  });

  /** Derived from the selected range's top tracks (Spotify has no top-albums endpoint). */
  protected readonly albums = computed(() => {
    const lists = this.taste.tracks();
    const ranks = this.taste.trackRanks();
    return lists && ranks ? topAlbums(lists[this.range()], ranks).slice(0, 12) : [];
  });

  /**
   * World heat per album = the album's own `popularity` (Spotify's real album score, which can be
   * far below its tracks'). Only full albums carry it and "get several" is gone, so one call each.
   */
  private readonly worldRes = rxResource({
    params: () => this.albums().map((a) => a.id),
    stream: ({ params }) =>
      params.length ? forkJoin(params.map((id) => this.api.album(id).pipe(catchError(() => of(null))))) : of([]),
  });
  protected readonly worldHeat = computed(() => {
    const m = new Map<string, number>();
    for (const al of safe(this.worldRes) ?? []) if (al && al.popularity !== undefined) m.set(al.id, al.popularity);
    return m;
  });

  protected readonly topArtists = computed(() => {
    const ranks = this.taste.artistRanks();
    return (this.taste.artists()?.[this.range()].slice(0, 15) ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      images: a.images,
      heat: ranks ? personalHeat(a.id, ranks) : null,
      global: a.popularity ?? null,
    }));
  });

  protected readonly recentRows = computed(() => {
    const ranks = this.taste.trackRanks();
    return this.recent().map((track) => ({
      track,
      heat: ranks ? personalHeat(track.id, ranks) : null,
      global: track.popularity ?? null,
    }));
  });

  /** Plays the visible list starting at index `i`. */
  protected play(i: number): void {
    const tracks = this.taste.tracks()?.[this.range()] ?? [];
    void this.player.play({ uris: tracks.slice(i, i + 50).map((t) => t.uri) });
  }

  protected playRecent(i: number): void {
    void this.player.play({ uris: this.recent().slice(i).map((t) => t.uri) });
  }
}
