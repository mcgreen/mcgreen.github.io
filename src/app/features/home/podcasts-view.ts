import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { errorText } from '../../core/errors';
import { formatDate } from '../../core/format';
import { safe } from '../../core/resource';
import { Paging, SavedShow } from '../../core/spotify/models';
import { SpotifyApi } from '../../core/spotify/spotify-api.service';
import { AlbumCard } from '../../shared/ui/album-card';

type Sort = 'added' | 'episodes' | 'name';

const SORTS: { id: Sort; label: string }[] = [
  { id: 'added', label: 'Recently added' },
  { id: 'episodes', label: 'Most episodes' },
  { id: 'name', label: 'A to Z' },
];

/**
 * Home > Podcasts. Spotify returns NO popularity, followers or listening history for shows, so
 * there is no heat to draw here; this view shows the library facts the API really gives.
 */
@Component({
  selector: 'app-podcasts-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AlbumCard],
  templateUrl: './podcasts-view.html',
  styleUrl: './library-view.scss',
})
export class PodcastsView {
  private readonly api = inject(SpotifyApi);

  private readonly res = httpResource<Paging<SavedShow>>(() => this.api.req.savedShows());

  protected readonly sorts = SORTS;
  protected readonly sort = signal<Sort>('added');
  protected readonly loading = this.res.isLoading;
  protected readonly error = computed(() => errorText(this.res.error()));

  protected readonly items = computed(() =>
    (safe(this.res)?.items ?? []).map(({ added_at, show }) => ({
      id: show.id,
      name: show.name,
      image: show.images[0]?.url ?? null,
      publisher: show.publisher,
      episodes: show.total_episodes,
      explicit: show.explicit,
      added: added_at,
      subtitle: `${show.publisher} · ${show.total_episodes.toLocaleString()} ${show.total_episodes === 1 ? 'episode' : 'episodes'}`,
    })),
  );

  protected readonly sorted = computed(() => {
    const list = [...this.items()];
    switch (this.sort()) {
      case 'episodes':
        return list.sort((a, b) => b.episodes - a.episodes);
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list.sort((a, b) => b.added.localeCompare(a.added));
    }
  });

  protected readonly stats = computed(() => {
    const list = this.items();
    const newest = [...list].sort((a, b) => b.added.localeCompare(a.added))[0];
    return {
      shows: list.length,
      episodes: list.reduce((n, s) => n + s.episodes, 0),
      newest: newest ? `${newest.name} (${formatDate(newest.added)})` : '',
    };
  });
}
