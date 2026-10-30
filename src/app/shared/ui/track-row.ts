import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { heatGap } from '../../core/heat';
import { Icon } from './icon';
import { Meter } from './meter';

/** Anything track-like: full tracks, album tracks (no album) and search results all fit. */
export interface RowTrack {
  id: string;
  name: string;
  uri: string;
  explicit?: boolean;
  artists: { id: string; name: string }[];
  album?: { id: string; name: string; images: { url: string }[] };
}

/**
 * One track line, used everywhere. Title links to its album, each artist links
 * to their page, and the button plays it. This is the drill-down workhorse.
 */
@Component({
  selector: 'app-track-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Meter],
  templateUrl: './track-row.html',
  styleUrl: './track-row.scss',
})
export class TrackRow {
  readonly track = input.required<RowTrack>();
  readonly rank = input<number | null>(null);
  readonly heat = input<number | null>(null);
  /** 0-100 global heat (Spotify popularity), when available. */
  readonly globalHeat = input<number | null>(null);
  readonly note = input('');
  readonly play = output<void>();

  protected readonly gapLabel = computed(() => {
    const mine = this.heat();
    const world = this.globalHeat();
    return mine !== null && world !== null ? heatGap(mine, world).label : '';
  });

  protected readonly art = computed(() => this.track().album?.images[0]?.url ?? null);
}
