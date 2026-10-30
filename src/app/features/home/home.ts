import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudiobooksView } from './audiobooks-view';
import { MusicView } from './music-view';
import { PodcastsView } from './podcasts-view';

type Kind = 'music' | 'podcasts' | 'audiobooks';

const KINDS: { id: Kind; label: string }[] = [
  { id: 'music', label: 'Music' },
  { id: 'podcasts', label: 'Podcasts' },
  { id: 'audiobooks', label: 'Audiobooks' },
];

/**
 * Home. A toggle flips between the kinds of things in your Spotify: music (full heat), and
 * podcasts / audiobooks (library facts only: Spotify exposes no popularity or play history for
 * them). The choice lives in the URL (?view=), so it is linkable and the back button works.
 */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MusicView, PodcastsView, AudiobooksView],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  /** Bound from `?view=`. The router sets a missing param to `undefined`, so the type allows it. */
  readonly view = input<string | undefined>(undefined);

  protected readonly kinds = KINDS;
  protected readonly kind = computed<Kind>(() => KINDS.find((k) => k.id === this.view())?.id ?? 'music');
}
