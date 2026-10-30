import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationError, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
import { BRAND } from './core/config';
import { LayoutService } from './core/layout.service';
import { PlayerService } from './core/player/player.service';
import { safe } from './core/resource';
import { SpotifyProfile } from './core/spotify/models';
import { SpotifyApi } from './core/spotify/spotify-api.service';
import { ThemeService } from './core/theme.service';
import { VisualsService } from './core/visuals/visuals.service';
import { Blast } from './shared/ui/blast';
import { PlayerBar } from './shared/ui/player-bar';
import { Sidebar } from './shared/ui/sidebar';
import { VinylRecord } from './shared/ui/record';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PlayerBar, VinylRecord, Blast, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly player = inject(PlayerService);
  protected readonly theme = inject(ThemeService);
  protected readonly visuals = inject(VisualsService);
  /** Created at startup so data-shelves is on <html> before the first page renders. */
  protected readonly layout = inject(LayoutService);
  private readonly router = inject(Router);
  private readonly api = inject(SpotifyApi);
  protected readonly brand = BRAND;

  /** Who is signed in. Cosmetic: a failure just hides the name. */
  private readonly profile = httpResource<SpotifyProfile>(() => (this.auth.isLoggedIn() ? this.api.req.me() : undefined));
  protected readonly me = computed(() => safe(this.profile));

  constructor() {
    // Start the SDK as soon as there is a session, so the player exists before the first click.
    effect(() => {
      if (this.auth.isLoggedIn()) this.player.init();
    });

    // The sign-in splash stays up until the redirect to /home has actually finished.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd || e instanceof NavigationError),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.auth.completing.set(false));
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
