export const AuthConstants = {
  API_URL: 'https://api.spotify.com/v1',
  API_ACCOUNT_URL: 'https://accounts.spotify.com',
  REDIRECT_URI: 'http://localhost:4200/home',
  API_AUTH: '/authorize',
  API_PROFILE: '/me',
  API_TOP_TRACKS: '/top/tracks',
  API_TOP_ARTISTS: '/top/artists',

  AUTH_KEY: 'access_token',
  AUTH_TYPE: 'token_type,',

  CLIENT_ID: '9ce5e2c2c5d24431926e0519083ea029',

  SCOPES: [
    'user-read-email',
    'user-read-currently-playing',
    'user-modify-playback-state',
    'streaming',
    'user-read-playback-state',
    'user-read-private',
    'user-top-read',
    'user-read-email',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-follow-read',
  ],

};
