import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meter } from './meter';

/** Round artist tile with your heat and world heat under the name. Used on Home and Search. */
@Component({
  selector: 'app-artist-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Meter],
  templateUrl: './artist-chip.html',
  styleUrl: './artist-chip.scss',
})
export class ArtistChip {
  readonly id = input.required<string>();
  readonly name = input.required<string>();
  readonly image = input<string | null>(null);
  readonly heat = input<number | null>(null);
  readonly globalHeat = input<number | null>(null);
}
