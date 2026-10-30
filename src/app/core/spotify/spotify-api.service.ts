import { HttpClient, HttpParams, HttpResourceRequest, HttpResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SPOTIFY } from '../config';
import { AlbumFull, AlbumSummary, Paging, SpotifyTrack, StartPlaybackBody, TimeRange } from './models';

/** Search limit is capped at 10 since Feb 2026 (default 5). */
const SEARCH_MAX = 10;

const api = (path: string): string => `${SPOTIFY.apiUrl}${path}`;
const seg = encodeURIComponent;

/**
 * Typed access to the Spotify Web API. Auth, token refresh and rate-limit retry live in the
 * HTTP interceptor, not here.
 *
 * Two kinds of members, following the Angular skill ("httpResource for reads, HttpClient for
 * mutations"):
 *  - `req.*` builds a read request. Components pass it to `httpResource(() => ...)`; return
 *    `undefined` from that function to skip the request.
 *  - Observable methods: writes (playback), the Lab's raw probe, and the two per-id reads that
 *    are fanned out with forkJoin (album/track popularity), which a single resource can't express.
 */
@Service()
export class SpotifyApi {
  private readonly http = inject(HttpClient);

  /** Read requests for `httpResource`. */
  readonly req = {
    me: (): HttpResourceRequest => ({ url: api('/me') }),
    topTracks: (range: TimeRange, limit = 50): HttpResourceRequest => ({
      url: api('/me/top/tracks'),
      params: { time_range: range, limit },
    }),
    topArtists: (range: TimeRange, limit = 50): HttpResourceRequest => ({
      url: api('/me/top/artists'),
      params: { time_range: range, limit },
    }),
    recentlyPlayed: (limit = 50): HttpResourceRequest => ({ url: api('/me/player/recently-played'), params: { limit } }),
    artist: (id: string): HttpResourceRequest => ({ url: api(`/artists/${seg(id)}`) }),
    artistAlbums: (id: string, limit = 50): HttpResourceRequest => ({
      url: api(`/artists/${seg(id)}/albums`),
      params: { include_groups: 'album,single', limit },
    }),
    /** Officially removed Feb 2026 but still answers for this app. Treat failure as "hide it". */
    artistTopTracks: (id: string): HttpResourceRequest => ({ url: api(`/artists/${seg(id)}/top-tracks`) }),
    /** Same caveat as artistTopTracks. */
    newReleases: (limit = 20): HttpResourceRequest => ({ url: api('/browse/new-releases'), params: { limit } }),
    album: (id: string): HttpResourceRequest => ({ url: api(`/albums/${seg(id)}`) }),
    search: (query: string, types: ('track' | 'artist' | 'album')[], limit = 5, offset = 0): HttpResourceRequest => ({
      url: api('/search'),
      params: { q: query, type: types.join(','), limit: Math.min(limit, SEARCH_MAX), offset },
    }),
    savedAlbums: (limit = 50): HttpResourceRequest => ({ url: api('/me/albums'), params: { limit } }),
    followedArtists: (limit = 50): HttpResourceRequest => ({ url: api('/me/following'), params: { type: 'artist', limit } }),
    playlists: (limit = 50): HttpResourceRequest => ({ url: api('/me/playlists'), params: { limit } }),
    savedShows: (limit = 50): HttpResourceRequest => ({ url: api('/me/shows'), params: { limit } }),
    savedAudiobooks: (limit = 50): HttpResourceRequest => ({ url: api('/me/audiobooks'), params: { limit } }),
    show: (id: string): HttpResourceRequest => ({ url: api(`/shows/${seg(id)}`) }),
    showEpisodes: (id: string, limit = 50): HttpResourceRequest => ({ url: api(`/shows/${seg(id)}/episodes`), params: { limit } }),
    audiobook: (id: string): HttpResourceRequest => ({ url: api(`/audiobooks/${seg(id)}`) }),
    audiobookChapters: (id: string, limit = 50): HttpResourceRequest => ({
      url: api(`/audiobooks/${seg(id)}/chapters`),
      params: { limit },
    }),
  };

  // ---- fan-out reads (one call per id; "get several" is gone) ----

  album(id: string): Observable<AlbumFull> {
    return this.http.get<AlbumFull>(api(`/albums/${seg(id)}`));
  }

  artistAlbumsList(id: string, limit = 5): Observable<Paging<AlbumSummary>> {
    return this.http.get<Paging<AlbumSummary>>(api(`/artists/${seg(id)}/albums`), {
      params: { include_groups: 'album,single', limit },
    });
  }

  track(id: string): Observable<SpotifyTrack> {
    return this.http.get<SpotifyTrack>(api(`/tracks/${seg(id)}`));
  }

  // ---- mutations ----

  startPlayback(deviceId: string, body: StartPlaybackBody): Observable<void> {
    return this.http.put<void>(api('/me/player/play'), body, { params: new HttpParams().set('device_id', deviceId) });
  }

  transferPlayback(deviceId: string, play: boolean): Observable<void> {
    return this.http.put<void>(api('/me/player'), { device_ids: [deviceId], play });
  }

  /** Raw GET used by the API Lab: returns the full response so status and body can be shown. */
  probe(path: string): Observable<HttpResponse<unknown>> {
    return this.http.get<unknown>(api(path), { observe: 'response' });
  }
}
