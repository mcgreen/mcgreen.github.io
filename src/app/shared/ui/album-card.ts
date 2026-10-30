import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { heatGap } from '../../core/heat';
import { Meter } from './meter';

/**
 * A drill-down tile with your heat and (when known) world heat side by side. Links to the album
 * page unless `link` says otherwise (podcasts and audiobooks reuse it).
 */
@Component({
  selector: 'app-album-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Meter],
  templateUrl: './album-card.html',
  styleUrl: './album-card.scss',
})
export class AlbumCard {
  readonly id = input.required<string>();
  readonly name = input.required<string>();
  readonly image = input<string | null>(null);
  readonly subtitle = input('');
  /** Router link; defaults to the album page for `id`. */
  readonly link = input<string[] | null>(null);
  readonly heat = input<number | null>(null);
  readonly globalHeat = input<number | null>(null);

  protected readonly route = computed(() => this.link() ?? ['/album', this.id()]);

  protected readonly gap = computed(() => {
    const mine = this.heat();
    const world = this.globalHeat();
    return mine !== null && world !== null ? heatGap(mine, world).label : '';
  });
}
