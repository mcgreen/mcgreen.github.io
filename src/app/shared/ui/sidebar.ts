import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PlayerService } from '../../core/player/player.service';
import { safe } from '../../core/resource';
import {
  FollowedArtistsResponse,
  Paging,
  PlaylistSummary,
  SavedAlbum,
  SavedAudiobook,
  SavedShow,
} from '../../core/spotify/models';
import { SpotifyApi } from '../../core/spotify/spotify-api.service';

type Tab = 'albums' | 'artists' | 'playlists' | 'shows' | 'audiobooks';

interface LibItem {
  key: string;
  name: string;
  sub: string;
  image: string | null;
  /** Detail page, or null for playlists, which play instead. */
  link: string[] | null;
  uri: string;
  round: boolean;
}

/** Alphabetical by label. */
const TABS: { id: Tab; label: string }[] = [
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
  { id: 'audiobooks', label: 'Audiobooks' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'shows', label: 'Podcasts' },
];

/**
 * Left pane: main navigation on top, then "Your library" (saved albums, followed artists,
 * your playlists). New user-related features get a nav entry or a library tab here.
 */
@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly api = inject(SpotifyApi);
  private readonly player = inject(PlayerService);

  /** Leave out the main-nav card (the Library page on phones, where the top bar has the nav). */
  readonly compact = input(false);

  protected readonly tabs = TABS;
  protected readonly tab = signal<Tab>('albums');
  protected readonly filter = signal('');

  /**
   * One resource per tab, each active only while its tab is selected (an `undefined` request
   * idles it). A failure just shows an empty list.
   */
  private readonly albums = httpResource<Paging<SavedAlbum>>(() => (this.tab() === 'albums' ? this.api.req.savedAlbums() : undefined));
  private readonly artists = httpResource<FollowedArtistsResponse>(() => (this.tab() === 'artists' ? this.api.req.followedArtists() : undefined));
  private readonly playlists = httpResource<Paging<PlaylistSummary>>(() => (this.tab() === 'playlists' ? this.api.req.playlists() : undefined));
  private readonly shows = httpResource<Paging<SavedShow>>(() => (this.tab() === 'shows' ? this.api.req.savedShows() : undefined));
  private readonly audiobooks = httpResource<Paging<SavedAudiobook>>(() => (this.tab() === 'audiobooks' ? this.api.req.savedAudiobooks() : undefined));

  protected readonly loading = computed(
    () => this.albums.isLoading() || this.artists.isLoading() || this.playlists.isLoading() || this.shows.isLoading() || this.audiobooks.isLoading(),
  );

  protected readonly items = computed<LibItem[]>(() => {
    switch (this.tab()) {
      case 'albums':
        return (safe(this.albums)?.items ?? []).map(({ album }) => ({
          key: album.id,
          name: album.name,
          sub: `Album · ${album.artists[0]?.name ?? ''}`,
          image: album.images[0]?.url ?? null,
          link: ['/album', album.id],
          uri: album.uri,
          round: false,
        }));
      case 'artists':
        return (safe(this.artists)?.artists.items ?? []).map((a) => ({
          key: a.id,
          name: a.name,
          sub: 'Artist',
          image: a.images[0]?.url ?? null,
          link: ['/artist', a.id],
          uri: a.uri,
          round: true,
        }));
      case 'shows':
        return (safe(this.shows)?.items ?? []).map(({ show }) => ({
          key: show.id,
          name: show.name,
          sub: `Podcast · ${show.publisher}`,
          image: show.images[0]?.url ?? null,
          link: ['/show', show.id],
          uri: show.uri,
          round: false,
        }));
      case 'audiobooks':
        return (safe(this.audiobooks)?.items ?? []).map((b) => ({
          key: b.id,
          name: b.name,
          sub: `Audiobook · ${b.authors.map((a) => a.name).join(', ')}`,
          image: b.images[0]?.url ?? null,
          link: ['/audiobook', b.id],
          uri: b.uri,
          round: false,
        }));
      case 'playlists':
        return (safe(this.playlists)?.items ?? []).map((p) => ({
          key: p.id,
          name: p.name,
          sub: `Playlist · ${p.owner.display_name ?? ''}`,
          image: p.images?.[0]?.url ?? null,
          link: null,
          uri: p.uri,
          round: false,
        }));
    }
  });

  protected readonly shown = computed(() => {
    const q = this.filter().trim().toLowerCase();
    const items = this.items();
    return q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items;
  });

  protected play(it: LibItem): void {
    void this.player.play({ contextUri: it.uri });
  }
}
