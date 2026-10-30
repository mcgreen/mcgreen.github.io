import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, from, switchMap, throwError, timer } from 'rxjs';
import { SPOTIFY } from '../config';
import { AuthService } from './auth.service';

/**
 * Adds the bearer token to Spotify API calls and handles the failure modes:
 *  - expired token: refreshed before sending (AuthService.getValidToken)
 *  - 401: refresh once and retry
 *  - 429: honour Retry-After, with exponential backoff, up to MAX_429_RETRIES times
 *  - unrecoverable session: clear it and go to /login
 */
const MAX_429_RETRIES = 3;
const MAX_WAIT_MS = 30_000;

/** Wait for Retry-After when Spotify sends it, never less than 1s, 2s, 4s... (exponential), capped. */
function backoffMs(err: HttpErrorResponse, attempt: number): number {
  const asked = (Number(err.headers.get('Retry-After')) || 0) * 1000;
  return Math.min(Math.max(asked, 1000 * 2 ** attempt), MAX_WAIT_MS);
}

export const spotifyAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(SPOTIFY.apiUrl)) return next(req);

  const auth = inject(AuthService);
  const router = inject(Router);

  const send = (token: string, attempt = 0): Observable<HttpEvent<unknown>> =>
    next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 429 && attempt < MAX_429_RETRIES) {
          return timer(backoffMs(err, attempt)).pipe(
            switchMap(() => from(auth.getValidToken())),
            switchMap((token2) => (token2 ? send(token2, attempt + 1) : expire(err))),
          );
        }
        return throwError(() => err);
      }),
    );
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
          switchMap((t) => send(t)),
          catchError((e: unknown) => expire(e)),
        );
      }
      // Token refresh itself failed and cleared the session.
      if (!(err instanceof HttpErrorResponse) && !auth.isLoggedIn()) return expire(err);
      return throwError(() => err);
    }),
  );
};
