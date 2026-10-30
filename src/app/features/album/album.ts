import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { errorText } from '../../core/errors';
import { combineHeat, personalHeat } from '../../core/heat';
import { PlayerService } from '../../core/player/player.service';
import { safe } from '../../core/resource';
import { AlbumFull } from '../../core/spotify/models';
import { SpotifyApi } from '../../core/spotify/spotify-api.service';
import { TasteService } from '../../core/taste.service';
import { Icon } from '../../shared/ui/icon';
import { Meter } from '../../shared/ui/meter';
import { TrackRow } from '../../shared/ui/track-row';

@Component({
  selector: 'app-album',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Meter, TrackRow],
  templateUrl: './album.html',
  styleUrl: './album.scss',
})
export class AlbumPage {
  /** Bound from the route `/album/:id`. */
  readonly id = input.required<string>();

  private readonly api = inject(SpotifyApi);
  private readonly player = inject(PlayerService);
  private readonly taste = inject(TasteService);

  private readonly albumRes = httpResource<AlbumFull>(() => this.api.req.album(this.id()));
  protected readonly album = computed(() => safe(this.albumRes) ?? null);
  protected readonly loading = this.albumRes.isLoading;
  protected readonly error = computed(() => errorText(this.albumRes.error()));

  /**
   * World heat per track. Tracks inside an album carry no `popularity` and the "get several"
   * endpoint is gone, so this is one call per track. Failures just leave that track without it.
   */
  private readonly worldRes = rxResource({
    params: () => this.album()?.tracks.items.map((t) => t.id) ?? [],
    stream: ({ params }) =>
      params.length ? forkJoin(params.map((id) => this.api.track(id).pipe(catchError(() => of(null))))) : of([]),
  });
  private readonly worldHeat = computed(() => {
    const m = new Map<string, number>();
    for (const t of safe(this.worldRes) ?? []) if (t && t.popularity !== undefined) m.set(t.id, t.popularity);
    return m;
  });

  protected readonly rows = computed(() => {
    const al = this.album();
    if (!al) return [];
    const ranks = this.taste.trackRanks();
    const world = this.worldHeat();
    return al.tracks.items.map((track) => ({
      track,
      n: track.track_number,
      // Relinked tracks have a different id than the one in your top lists, so check both.
      heat: ranks ? Math.max(personalHeat(track.id, ranks), track.linked_from ? personalHeat(track.linked_from.id, ranks) : 0) : null,
      global: world.get(track.id) ?? null,
    }));
  });

  /** Your heat for the whole album; shown even when it is 0 so the World meter has company. */
  protected readonly albumHeat = computed(() => {
    const heats = this.rows().map((r) => r.heat);
    return heats.some((h) => h === null) || !heats.length ? null : combineHeat(heats as number[]);
  });

  protected playAlbum(al: AlbumFull): void {
    void this.player.play({ contextUri: al.uri });
  }

  protected playFrom(al: AlbumFull, trackUri: string): void {
    void this.player.play({ contextUri: al.uri, offsetUri: trackUri });
  }
}
