import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from './icon';

/** One episode or chapter: art, title, meta line, a clamped description and a play button. */
@Component({
  selector: 'app-media-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './media-row.html',
  styleUrl: './media-row.scss',
})
export class MediaRow {
  readonly title = input.required<string>();
  readonly meta = input('');
  readonly description = input('');
  readonly image = input<string | null>(null);
  readonly explicit = input(false);
  readonly play = output<void>();
}
