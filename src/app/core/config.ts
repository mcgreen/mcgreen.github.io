/** Placeholder brand name. TODO: decide the final name. */
export const BRAND = 'Heat';

export const SPOTIFY = {
  /** Public by design: PKCE apps have no client secret. Same Spotify app as sdash v1. */
  clientId: '9ce5e2c2c5d24431926e0519083ea029',
  apiUrl: 'https://api.spotify.com/v1',
  authorizeUrl: 'https://accounts.spotify.com/authorize',
  tokenUrl: 'https://accounts.spotify.com/api/token',
  /** Refresh this long before the access token actually expires. */
  expirySkewMs: 60_000,
  scopes: [
    // Playback via the Web Playback SDK (Premium)
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    // Taste and history
    'user-top-read',
    'user-read-recently-played',
    // Library and follows
    'user-library-read',
    'user-library-modify',
    'user-follow-read',
    // Playlists
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-private',
    'playlist-modify-public',
    // Search and profile
    'user-read-private',
  ],
} as const;
