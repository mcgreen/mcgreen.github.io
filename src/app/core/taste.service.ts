import { httpResource } from '@angular/common/http';
import { Service, computed, inject } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { RankLists } from './heat';
import { Paging, SpotifyArtist, SpotifyTrack, TimeRange } from './spotify/models';
import { SpotifyApi } from './spotify/spotify-api.service';

const RANGES: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

type ByRange<T> = Record<TimeRange, T[]>;

/**
 * Your top tracks and artists across the three time ranges. Everything that shows "heat"
 * (home, artist, album, search) reads from here instead of refetching.
 *
 * Six httpResources, one per list. They start when the service is first injected and only
 * while signed in: logging out makes the request `undefined`, which idles them and drops the
 * values, so there is no manual reset.
 */
@Service()
export class TasteService {
  private readonly api = inject(SpotifyApi);
  private readonly auth = inject(AuthService);

  private readonly trackRes = {
    short_term: this.tracksFor('short_term'),
    medium_term: this.tracksFor('medium_term'),
    long_term: this.tracksFor('long_term'),
  };
  private readonly artistRes = {
    short_term: this.artistsFor('short_term'),
    medium_term: this.artistsFor('medium_term'),
    long_term: this.artistsFor('long_term'),
  };

  /** All three ranges loaded, or null while any is missing. */
  readonly tracks = computed<ByRange<SpotifyTrack> | null>(() => this.collect(this.trackRes));
  readonly artists = computed<ByRange<SpotifyArtist> | null>(() => this.collect(this.artistRes));

  readonly trackRanks = computed<RankLists | null>(() => ranksOf(this.tracks()));
  readonly artistRanks = computed<RankLists | null>(() => ranksOf(this.artists()));

  readonly tracksLoading = computed(() => RANGES.some((r) => this.trackRes[r].isLoading()));
  /** First error among the track lists (the page can't show heat without them). */
  readonly tracksError = computed<unknown>(() => RANGES.map((r) => this.trackRes[r].error()).find((e) => !!e) ?? null);

  private tracksFor(range: TimeRange) {
    return httpResource<Paging<SpotifyTrack>>(() => (this.auth.isLoggedIn() ? this.api.req.topTracks(range) : undefined));
  }

  private artistsFor(range: TimeRange) {
    return httpResource<Paging<SpotifyArtist>>(() => (this.auth.isLoggedIn() ? this.api.req.topArtists(range) : undefined));
  }

  private collect<T>(res: Record<TimeRange, { hasValue(): boolean; value(): Paging<T> | undefined }>): ByRange<T> | null {
    if (!RANGES.every((r) => res[r].hasValue())) return null;
    const get = (r: TimeRange) => res[r].value()?.items ?? [];
    return { short_term: get('short_term'), medium_term: get('medium_term'), long_term: get('long_term') };
  }
}

function ranksOf(lists: ByRange<{ id: string }> | null): RankLists | null {
  return lists
    ? { short_term: ids(lists.short_term), medium_term: ids(lists.medium_term), long_term: ids(lists.long_term) }
    : null;
}

function ids(list: { id: string }[]): string[] {
  return list.map((x) => x.id);
}
