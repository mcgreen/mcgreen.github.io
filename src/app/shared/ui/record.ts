import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';

/** One revolution at speed 1 (about 25 rpm: slow and stately). */
const BASE_ROTATION_MS = 2400;

/**
 * Pure-CSS vinyl record. The grooves rotate; the light sheen stays put, which
 * is what makes it read as a spinning disc rather than a spinning picture.
 *
 * Rotation uses the Web Animations API so the speed can ramp smoothly: the disc
 * spins up when `spinning` turns on, spins down (with inertia) when it turns
 * off, and `speed` can change on the fly without the angle jumping.
 */
@Component({
  selector: 'app-record',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--record-size]': 'size()' },
  templateUrl: './record.html',
  styleUrl: './record.scss',
})
export class VinylRecord implements OnDestroy {
  /** CSS length, e.g. "220px", "34px" or "var(--deck)". */
  readonly size = input('220px');
  readonly spinning = input(false);
  /** Speed multiplier while spinning. 1 = about 25 rpm. */
  readonly speed = input(1);
  /** Optional image for the centre label (e.g. album art). */
  readonly labelUrl = input<string | null>(null);

  private readonly disc = viewChild<ElementRef<HTMLElement>>('disc');
  private anim?: Animation;
  private rate = 0;
  private target = 0;
  private raf = 0;
  private last = 0;
  private readonly reduced =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    effect(() => {
      const el = this.disc()?.nativeElement;
      const target = this.spinning() && !this.reduced ? this.speed() : 0;
      if (!el) return;
      this.ensureAnimation(el);
      this.target = target;
      if (!this.raf) {
        this.last = 0;
        this.raf = requestAnimationFrame(this.step);
      }
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.anim?.cancel();
  }

  private ensureAnimation(el: HTMLElement): void {
    if (this.anim) return;
    this.anim = el.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
      duration: BASE_ROTATION_MS,
      iterations: Infinity,
    });
    this.anim.playbackRate = this.rate;
  }

  /** Eases the playback rate toward the target (spin-up and spin-down inertia). */
  private readonly step = (now: number): void => {
    const dt = this.last ? Math.min(now - this.last, 64) : 16;
    this.last = now;
    this.rate += (this.target - this.rate) * (1 - Math.exp(-dt / 450));
    if (Math.abs(this.target - this.rate) < 0.003) this.rate = this.target;
    if (this.anim) this.anim.playbackRate = this.rate;
    this.raf = this.rate === this.target ? 0 : requestAnimationFrame(this.step);
  };
}
