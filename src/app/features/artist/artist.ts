import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { errorText } from '../../core/errors';
import { personalHeat } from '../../core/heat';
import { PlayerService } from '../../core/player/player.service';
import { safe } from '../../core/resource';
import { AlbumSummary, Paging, SpotifyArtist, SpotifyTrack, TimeRange } from '../../core/spotify/models';
import { SpotifyApi } from '../../core/spotify/spotify-api.service';
import { TasteService } from '../../core/taste.service';
import { Icon } from '../../shared/ui/icon';
import { Meter } from '../../shared/ui/meter';
import { TrackRow } from '../../shared/ui/track-row';

const RANGES: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

/**
 * Artist page: the artist's albums, YOUR tracks by them, and (if Spotify still answers) their
 * top tracks with your heat next to global heat. Top tracks and popularity are documented as
 * removed, so everything built on them is optional and hides itself when missing.
 */
@Component({
  selector: 'app-artist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Meter, TrackRow],
  templateUrl: './artist.html',
  styleUrl: './artist.scss',
})
export class ArtistPage {
  /** Bound from the route `/artist/:id`. */
  readonly id = input.required<string>();

  private readonly api = inject(SpotifyApi);
  private readonly player = inject(PlayerService);
  private readonly taste = inject(TasteService);

  private readonly artistRes = httpResource<SpotifyArtist>(() => this.api.req.artist(this.id()));
  private readonly albumsRes = httpResource<Paging<AlbumSummary>>(() => this.api.req.artistAlbums(this.id()));
  /** Separate resource: this endpoint is officially gone, so its failure must never hide the page. */
  private readonly topRes = httpResource<{ tracks: SpotifyTrack[] }>(() => this.api.req.artistTopTracks(this.id()));

  protected readonly artist = computed(() => safe(this.artistRes) ?? null);
  protected readonly albums = computed<AlbumSummary[]>(() => safe(this.albumsRes)?.items ?? []);
  protected readonly loading = computed(() => this.artistRes.isLoading() || this.albumsRes.isLoading());
  protected readonly error = computed(() => errorText(this.artistRes.error() ?? this.albumsRes.error()));

  protected readonly topTracks = computed(() => {
    const ranks = this.taste.trackRanks();
    return (safe(this.topRes)?.tracks ?? []).map((track) => ({
      track,
      heat: ranks ? personalHeat(track.id, ranks) : null,
      global: track.popularity ?? null,
    }));
  });

  protected readonly artistHeat = computed(() => {
    const ranks = this.taste.artistRanks();
    return ranks ? personalHeat(this.id(), ranks) : null;
  });

  protected readonly yourTracks = computed(() => {
    const lists = this.taste.tracks();
    const ranks = this.taste.trackRanks();
    if (!lists || !ranks) return [];
    const id = this.id();
    const found = new Map<string, SpotifyTrack>();
    for (const r of RANGES) for (const t of lists[r]) if (t.artists.some((a) => a.id === id)) found.set(t.id, t);
    return [...found.values()]
      .map((track) => ({ track, heat: personalHeat(track.id, ranks) }))
      .sort((a, b) => b.heat - a.heat);
  });

  protected year(a: AlbumSummary): string {
    return a.release_date?.slice(0, 4) ?? '';
  }

  protected playArtist(a: SpotifyArtist): void {
    void this.player.play({ contextUri: a.uri });
  }

  protected playTop(i: number): void {
    void this.player.play({ uris: this.topTracks().slice(i).map((r) => r.track.uri) });
  }

  protected playYours(i: number): void {
    void this.player.play({ uris: this.yourTracks().slice(i).map((r) => r.track.uri) });
  }
}
