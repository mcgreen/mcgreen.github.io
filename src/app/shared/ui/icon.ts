import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName = 'play' | 'pause' | 'next' | 'prev' | 'flame';

/** Tiny inline-SVG icon set. Uses currentColor so it follows the theme. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class Icon {
  readonly name = input.required<IconName>();
}
