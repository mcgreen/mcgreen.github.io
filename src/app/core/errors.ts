import { HttpErrorResponse } from '@angular/common/http';

/** Turns any thrown value into a message that is safe to show the user. */
export function describeError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    // Spotify's own message ({ error: { status, message } }) is the most useful detail we have.
    const detail: string | undefined = err.error?.error?.message;
    const suffix = detail ? ` Spotify says: ${detail}` : '';
    switch (err.status) {
      case 0:
        return 'Could not reach Spotify. Check your connection.';
      case 401:
        return 'Your Spotify session expired. Please log in again.';
      case 403:
        return `Spotify refused this request (403).${suffix} Logging out and back in grants any new permissions.`;
      case 404:
        return `Spotify could not find that (404).${suffix}`;
      case 429:
        return 'Spotify is rate limiting us. Try again in a moment.';
      case 400:
        return `Spotify rejected the request (400).${suffix}`;
      default:
        return `Spotify error ${err.status}: ${err.error?.error?.message ?? err.statusText}`;
    }
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
}

/** Message for a resource's `error()` signal, or null when there is none. */
export function errorText(err: unknown): string | null {
  return err ? describeError(err) : null;
}
