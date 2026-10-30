import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError, timer } from 'rxjs';
import { SPOTIFY } from '../config';
import { AuthService } from './auth.service';

/**
 * Adds the bearer token to Spotify API calls and handles the failure modes:
 *  - expired token: refreshed before sending (AuthService.getValidToken)
 *  - 401: refresh once and retry
 *  - 429: wait for Retry-After (capped) and retry once
 *  - unrecoverable session: clear it and go to /login
 */
export const spotifyAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(SPOTIFY.apiUrl)) return next(req);

  const auth = inject(AuthService);
  const router = inject(Router);

  const send = (token: string) => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  const expire = (err: unknown) => {
    auth.logout();
    void router.navigate(['/login']);
    return throwError(() => err);
  };

  return from(auth.getValidToken()).pipe(
    switchMap((token) => (token ? send(token) : expire(new Error('Not signed in')))),
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return from(auth.refreshAccessToken()).pipe(
          switchMap(send),
          catchError((e: unknown) => expire(e)),
        );
      }
      if (err instanceof HttpErrorResponse && err.status === 429) {
        const waitMs = Math.min((Number(err.headers.get('Retry-After')) || 1) * 1000, 10_000);
        return timer(waitMs).pipe(
          switchMap(() => from(auth.getValidToken())),
          switchMap((token) => (token ? send(token) : expire(err))),
        );
      }
      // Token refresh itself failed and cleared the session.
      if (!(err instanceof HttpErrorResponse) && !auth.isLoggedIn()) return expire(err);
      return throwError(() => err);
    }),
  );
};
