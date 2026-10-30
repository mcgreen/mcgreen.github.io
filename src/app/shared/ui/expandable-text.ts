import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/** Long text clamped to a few lines, with a Show more / Show less toggle. */
@Component({
  selector: 'app-expandable-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './expandable-text.html',
  styleUrl: './expandable-text.scss',
})
export class ExpandableText {
  readonly text = input.required<string>();
  /** Shorter text than this never needs a toggle. */
  readonly threshold = input(240);

  protected readonly open = signal(false);
  protected readonly long = computed(() => this.text().length > this.threshold());
}
