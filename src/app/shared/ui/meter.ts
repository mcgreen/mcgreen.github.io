import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const RAMP = ['--heat-300', '--heat-400', '--heat-500', '--heat-600', '--heat-700'];

/**
 * Segmented heat meter. Metric-agnostic: pass any 0-100 value and a label.
 * "Heat" is just the first metric; others (freshness, depth, ...) reuse this.
 */
@Component({
  selector: 'app-meter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './meter.html',
  host: {
    // Focusable so keyboard users get the same tooltip as mouse users.
    tabindex: '0',
  },
  styleUrl: './meter.scss',
})
export class Meter {
  /** 0-100 */
  readonly value = input(0);
  readonly label = input('Heat');
  readonly segmentCount = input(10);

  protected readonly path =
    'M16 1c1.2 8 10 12 10 24a10 10 0 0 1-20 0c0-4.5 2-8 4.5-10.5.2 4.5 2 6 3.5 6C13 14 12.500 7 16 1z';
  /** A word for the score, so a 2 reads as "cold" at a glance. */
  protected readonly word = computed(() => {
    const v = this.rounded();
    return v < 15 ? 'cold' : v < 40 ? 'cool' : v < 65 ? 'warm' : v < 85 ? 'hot' : 'on fire';
  });
  protected readonly pct = computed(() => this.rounded() / 100);

  protected readonly rounded = computed(() => Math.round(Math.min(100, Math.max(0, this.value()))));

  protected readonly segments = computed(() => {
    const n = this.segmentCount();
    const lit = Math.round((this.rounded() / 100) * n);
    return Array.from({ length: n }, (_, i) => ({
      i,
      on: i < lit,
      color: `var(${RAMP[Math.min(RAMP.length - 1, Math.floor((i / n) * RAMP.length))]})`,
    }));
  });
}
