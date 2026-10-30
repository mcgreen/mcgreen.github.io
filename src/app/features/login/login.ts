import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom, timer } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { BRAND } from '../../core/config';
import { VinylRecord } from '../../shared/ui/record';

const sleep = (ms: number) => firstValueFrom(timer(ms));

/**
 * Login screen. The token exchange after Spotify's redirect happens in the
 * `loginGate` route guard, so this page only ever shows the signed-out state.
 */
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VinylRecord],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);

  protected readonly brand = BRAND;
  protected readonly error = this.auth.loginError;
  protected readonly hover = signal(false);
  protected readonly launching = signal(false);
  /** Idle slow, quicker on hover, full speed as the login launches. */
  protected readonly speed = computed(() => (this.launching() ? 6 : this.hover() ? 2.5 : 1));

  protected async login(): Promise<void> {
    this.error.set(null);
    this.launching.set(true);
    try {
      await sleep(550); // let the record spin up before leaving the page
      await this.auth.login();
    } catch {
      this.launching.set(false);
      this.error.set('Could not start the Spotify login. Use https:// or http://127.0.0.1 so the browser allows secure crypto.');
    }
  }
}
