import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LayoutService } from '../../core/layout.service';
import { PlayerService } from '../../core/player/player.service';
import { ThemeService } from '../../core/theme.service';
import { VisualsService } from '../../core/visuals/visuals.service';
import { formatTime } from '../../core/format';
import { Icon } from './icon';

/** Full-width bottom player: now playing, transport, and the Blast / Modern-Retro / Rows toggles. */
@Component({
  selector: 'app-player-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './player-bar.html',
  styleUrl: './player-bar.scss',
})
export class PlayerBar {
  protected readonly player = inject(PlayerService);
  protected readonly theme = inject(ThemeService);
  protected readonly visuals = inject(VisualsService);
  protected readonly layout = inject(LayoutService);

  protected readonly artistNames = computed(() => this.player.track()?.artists.map((a) => a.name).join(', ') ?? '');
  protected readonly position = computed(() => formatTime(this.player.positionMs()));
  protected readonly duration = computed(() => formatTime(this.player.durationMs()));

  protected onSeek(e: Event): void {
    this.player.seek(Number((e.target as HTMLInputElement).value));
  }

  protected onVolume(e: Event): void {
    this.player.setVolume(Number((e.target as HTMLInputElement).value));
  }
}
