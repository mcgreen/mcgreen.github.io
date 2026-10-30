import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../core/theme.service';
import { Icon } from '../../shared/ui/icon';
import { Meter } from '../../shared/ui/meter';
import { VinylRecord } from '../../shared/ui/record';

/** Design system kit: every token and shared component in one place. Route: /kit */
@Component({
  selector: 'app-kit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Meter, VinylRecord],
  templateUrl: './kit.html',
  styleUrl: './kit.scss',
})
export class Kit {
  protected readonly theme = inject(ThemeService);
  protected readonly heat = ['--heat-100', '--heat-300', '--heat-400', '--heat-500', '--heat-600', '--heat-700', '--heat-800'];
  protected readonly ink = ['--ink-950', '--ink-900', '--ink-850', '--ink-800', '--ink-700', '--ink-500', '--ink-300', '--ink-100', '--ink-0'];
  protected readonly values = [0, 20, 40, 60, 80, 100];
  protected readonly custom = signal(55);
  protected readonly spin = signal(true);
}
