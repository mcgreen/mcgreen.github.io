import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
};

/**
 * Guards /login. This is what stops the login page from flashing:
 *  - Back from Spotify (?code=...): finish the token exchange BEFORE the page is
 *    created, then go straight to /home. `completing` drives a splash meanwhile
 *    (the App clears it when navigation ends).
 *  - Already signed in: skip the login page entirely.
 *  - Failed exchange: land on a clean /login (no code in the URL) with the error.
 */
export const loginGate: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const params = new URLSearchParams(window.location.search);
  const returning = params.has('code') || params.has('error');

  if (returning && !auth.isLoggedIn()) {
    auth.completing.set(true);
    auth.loginError.set(null);
    try {
      await auth.completeLogin(params);
      return router.createUrlTree(['/home']);
    } catch (e) {
      auth.loginError.set(e instanceof Error ? e.message : 'Login failed. Please try again.');
      return router.createUrlTree(['/login']);
    }
  }

  return auth.isLoggedIn() ? router.createUrlTree(['/home']) : true;
};
