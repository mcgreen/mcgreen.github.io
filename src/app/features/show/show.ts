import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { errorText } from '../../core/errors';
import { formatDate, formatLong } from '../../core/format';
import { PlayerService } from '../../core/player/player.service';
import { safe } from '../../core/resource';
import { EpisodeSummary, Paging, ShowSummary } from '../../core/spotify/models';
import { SpotifyApi } from '../../core/spotify/spotify-api.service';
import { ExpandableText } from '../../shared/ui/expandable-text';
import { Icon } from '../../shared/ui/icon';
import { MediaRow } from '../../shared/ui/media-row';

/**
 * A podcast: facts about the show and its episodes. No heat: Spotify returns no popularity or
 * play history for shows or episodes.
 */
@Component({
  selector: 'app-show',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ExpandableText, Icon, MediaRow],
  templateUrl: './show.html',
  styleUrl: './show.scss',
})
export class ShowPage {
  /** Bound from the route `/show/:id`. */
  readonly id = input.required<string>();

  private readonly api = inject(SpotifyApi);
  private readonly player = inject(PlayerService);

  private readonly showRes = httpResource<ShowSummary>(() => this.api.req.show(this.id()));
  private readonly episodesRes = httpResource<Paging<EpisodeSummary>>(() => this.api.req.showEpisodes(this.id()));

  protected readonly show = computed(() => safe(this.showRes) ?? null);
  protected readonly loading = computed(() => this.showRes.isLoading());
  protected readonly error = computed(() => errorText(this.showRes.error()));
  protected readonly episodesError = computed(() => errorText(this.episodesRes.error()));
  protected readonly episodesLoading = this.episodesRes.isLoading;

  protected readonly episodes = computed(() =>
    (safe(this.episodesRes)?.items ?? [])
      // Spotify sometimes returns null items for unavailable episodes.
      .filter((e): e is EpisodeSummary => !!e)
      .map((e) => ({
        id: e.id,
        uri: e.uri,
        title: e.name,
        image: e.images?.[0]?.url ?? null,
        explicit: e.explicit,
        description: e.description,
        meta: [formatDate(e.release_date), formatLong(e.duration_ms)].filter(Boolean).join(' · '),
      })),
  );

  protected playShow(show: ShowSummary): void {
    void this.player.play({ contextUri: show.uri });
  }

  protected playEpisode(uri: string): void {
    void this.player.play({ uris: [uri] });
  }
}
