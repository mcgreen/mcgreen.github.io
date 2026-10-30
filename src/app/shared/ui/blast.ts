import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject, viewChild } from '@angular/core';
import { PlayerService } from '../../core/player/player.service';
import { ThemeService } from '../../core/theme.service';
import { BeatEngine } from '../../core/visuals/beat-engine';
import { HeatRenderer, Renderer, RetroRenderer } from '../../core/visuals/renderers';

/**
 * Full-screen visualizer behind the whole app ("blast mode").
 * Modern theme: radial burst. Retro theme: bars and waves.
 * The beat is simulated (see BeatEngine). Respects prefers-reduced-motion by
 * drawing a single still frame instead of animating.
 */
@Component({
  selector: 'app-blast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #cv class="blast blast-canvas" aria-hidden="true"></canvas>`,
  styleUrl: './blast.scss',
})
export class Blast implements OnDestroy {
  private readonly theme = inject(ThemeService);
  private readonly player = inject(PlayerService);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');

  private readonly engine = new BeatEngine(48);
  private readonly renderers: Record<'heat' | 'retro', Renderer> = {
    heat: new HeatRenderer(),
    retro: new RetroRenderer(),
  };
  private ctx!: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private raf = 0;
  private last = 0;
  private activeTheme: 'heat' | 'retro' | null = null;

  constructor() {
    afterNextRender(() => {
      const el = this.canvas().nativeElement;
      this.ctx = el.getContext('2d')!;
      this.resize();
      window.addEventListener('resize', this.resize);

      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        this.frame(performance.now()); // one still frame
        cancelAnimationFrame(this.raf);
      } else {
        this.raf = requestAnimationFrame(this.frame);
      }
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
  }

  private readonly resize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const el = this.canvas().nativeElement;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    el.width = Math.floor(this.w * dpr);
    el.height = Math.floor(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.activeTheme = null; // force a clean repaint at the new size
  };

  private readonly frame = (now: number): void => {
    this.raf = requestAnimationFrame(this.frame);
    if (document.hidden) {
      this.last = now;
      return;
    }
    const dt = Math.min(50, this.last ? now - this.last : 16);
    this.last = now;

    const themeName = this.theme.theme();
    const renderer = this.renderers[themeName];
    if (this.activeTheme !== themeName) {
      renderer.reset(this.ctx, this.w, this.h);
      this.activeTheme = themeName;
    }

    this.engine.update(dt, !this.player.paused(), this.player.positionMs(), this.player.track()?.id ?? 'idle');
    renderer.draw(this.ctx, this.w, this.h, this.engine, now, dt);
  };
}
