import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { debounce, form, FormField } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { errorText } from '../../core/errors';
import { personalHeat } from '../../core/heat';
import { PlayerService } from '../../core/player/player.service';
import { safe } from '../../core/resource';
import { SearchResults } from '../../core/spotify/models';
import { SpotifyApi } from '../../core/spotify/spotify-api.service';
import { TasteService } from '../../core/taste.service';
import { ArtistChip } from '../../shared/ui/artist-chip';
import { TrackRow } from '../../shared/ui/track-row';

/**
 * Search. A Signal Form owns the box; `debounce()` delays the UI -> model sync, so `query()` only
 * changes after the user pauses and the resource never fires per keystroke. The URL (?q=) seeds
 * the box on load and follows the query, so results are linkable. Spotify caps search at 10
 * results per type.
 */
@Component({
  selector: 'app-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormField, TrackRow, ArtistChip],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class SearchPage {
  private readonly api = inject(SpotifyApi);
  private readonly player = inject(PlayerService);
  private readonly router = inject(Router);
  private readonly taste = inject(TasteService);

  /** Seeded synchronously from the URL, so a shared link fills the box with no effect. */
  private readonly model = signal({ q: inject(ActivatedRoute).snapshot.queryParamMap.get('q') ?? '' });
  protected readonly searchForm = form(this.model, (path) => {
    debounce(path.q, 350);
  });

  /** The debounced, trimmed query. Empty means "idle". */
  protected readonly query = computed(() => this.model().q.trim());

  private readonly searchRes = httpResource<SearchResults>(() => {
    const q = this.query();
    return q ? this.api.req.search(q, ['artist', 'album', 'track'], 10) : undefined;
  });
  protected readonly results = computed(() => safe(this.searchRes));
  protected readonly artists = computed(() => this.results()?.artists?.items ?? []);
  protected readonly albums = computed(() => this.results()?.albums?.items ?? []);
  protected readonly tracks = computed(() => this.results()?.tracks?.items ?? []);
  protected readonly loading = this.searchRes.isLoading;
  protected readonly error = computed(() => errorText(this.searchRes.error()));

  constructor() {
    // Router is a non-signal API, so syncing the URL to the query is a legitimate effect.
    effect(() => {
      void this.router.navigate([], { queryParams: { q: this.query() || null }, replaceUrl: true });
    });
  }

  protected trackHeat(id: string): number | null {
    const ranks = this.taste.trackRanks();
    return ranks ? personalHeat(id, ranks) : null;
  }

  protected artistHeat(id: string): number | null {
    const ranks = this.taste.artistRanks();
    return ranks ? personalHeat(id, ranks) : null;
  }

  protected playTrack(i: number): void {
    void this.player.play({ uris: this.tracks().slice(i).map((t) => t.uri) });
  }
}
