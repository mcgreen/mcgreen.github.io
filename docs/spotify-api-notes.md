# Spotify API — what's available (as of 2026-10-28)

A working cheat sheet for building sdash v2 and for finding creative angles. Compiled from Spotify's docs and changelogs; **not yet probed against our live token**, so treat every row as "documented", not "confirmed". Add a Confirmed column as we probe.

## What changed

| When | Change |
|---|---|
| 2024-11-27 | Removed for apps registered after this date (and dev-mode apps without a pending extension): Related Artists, Recommendations, Audio Features, Audio Analysis, Featured Playlists, Category Playlists, 30-second preview URLs in multi-get responses, algorithmic/Spotify-owned editorial playlists. |
| 2026-02 | Removed endpoints (no replacement): `GET /browse/new-releases`, `GET /artists/{id}/top-tracks`, `GET /markets`, `GET /browse/categories` (+ `/{id}`), "get several" for albums, artists, audiobooks, chapters, episodes, shows, tracks, `GET /users/{id}`, `GET /users/{id}/playlists`. |
| 2026-02 | Replaced: `POST /users/{id}/playlists` → `POST /me/playlists`; per-type save/remove/contains endpoints and follow endpoints → `PUT/DELETE /me/library` and `GET /me/library/contains`; `/playlists/{id}/tracks` → `/playlists/{id}/items`. |
| 2026-02 | `GET /search`: `limit` max 50 → 10, default 20 → 5. |
| 2026-02 | Fields removed. Album: `album_group`, `available_markets`, `label`, `popularity`. Artist: `followers`, `popularity`. Track: `available_markets`, `linked_from`, `popularity`. User: `country`, `email`, `explicit_content`, `followers`, `product`. Show/Audiobook: `available_markets`, `publisher`. Playlist: `tracks` → `items` (items only for the user's own playlists). |
| 2026-03 | `external_ids` on Album and Track kept (removal reverted). |
| 2026 | Developer Mode: owner needs Premium; max 5 test users per app; wider access needs an extended-quota application. |

Docs pages also mark these as deprecated on track/artist objects: `genres` (artist), `preview_url`, `available_markets`, `popularity`, `followers`. **Verify `genres` still returns data before building anything on it.**

## Endpoints we can build on

| Area | Endpoint | Scope | Notes |
|---|---|---|---|
| Your taste | `GET /me/top/{artists\|tracks}` | `user-top-read` | `time_range`: short_term (~4 wks), medium_term (~6 mo, default), long_term (~1 yr). `limit` ≤ 50, `offset` for paging. |
| History | `GET /me/player/recently-played` | `user-read-recently-played` | `limit` ≤ 50, `after` / `before` cursors (ms, mutually exclusive). Returns `played_at` and `context` (the album/playlist/artist it was played from). No podcasts. |
| Library | `GET /me/albums`, `/me/tracks`, `/me/following?type=artist` | `user-library-read`, `user-follow-read` | Read side still documented. Writes go through `/me/library`. |
| Library | `PUT/DELETE /me/library`, `GET /me/library/contains` | `user-library-modify` | New unified save/follow endpoints. |
| Playlists | `GET /me/playlists`, `GET /playlists/{id}/items` | `playlist-read-private` | Items only for your own playlists. |
| Playlists | `POST /me/playlists`, `POST/PUT/DELETE /playlists/{id}/items` | `playlist-modify-public/private` | Create and edit; cover image needs `ugc-image-upload`. |
| Catalog | `GET /artists/{id}`, `/artists/{id}/albums`, `GET /albums/{id}`, `GET /tracks/{id}` | none beyond login | Single-item lookups only. |
| Search | `GET /search` | `user-read-private` listed | `limit` ≤ 10 now. Use `offset` to page. |
| Playback | `GET /me/player`, `/me/player/devices`, `/me/player/queue`, `/me/player/currently-playing` | `user-read-playback-state`, `user-read-currently-playing` | State and queue. |
| Playback | `PUT /me/player/play`, `pause`, `next`, `previous`, `seek`, `volume`, `shuffle`, `repeat`; `POST /me/player/queue`; `PUT /me/player` (transfer) | `user-modify-playback-state` | Pass the SDK `device_id`. Needs Premium. |
| In-browser audio | Web Playback SDK | `streaming` | Premium only. Chrome, Firefox, Safari, Edge. Audio is DRM-protected. |

## Web Playback SDK quick reference

- Constructor: `name`, `getOAuthToken(cb)`, `volume` (0–1), `enableMediaSession`.
- Methods: `connect`, `disconnect`, `addListener`, `removeListener`, `getCurrentState`, `setName`, `getVolume`, `setVolume`, `pause`, `resume`, `togglePlay`, `seek(ms)`, `previousTrack`, `nextTrack`, `activateElement`.
- Events: `ready`, `not_ready`, `player_state_changed`, `autoplay_failed`; errors `initialization_error` (usually no EME), `authentication_error`, `account_error` (not Premium), `playback_error`.
- State: `context`, `disallows`, `paused`, `position`, `repeat_mode`, `shuffle`, `track_window` (`current_track`, `previous_tracks`, `next_tracks`).
- iOS: no autoplay after transfer; volume is hardware-only.
- Call `activateElement()` from a click so transferred playback keeps playing.

## Creative angles (what the API still gives us)

Spotify now exposes **you**, not the catalog's stats. Ideas that fit that:

- **Your taste over time:** compare short vs long-term top lists → rising / cooling / loyal / one-hit-wonder.
- **Where you listen from:** `context` in recently played shows whether you reach music via albums, playlists or artists.
- **Time-of-day listening:** `played_at` from the last 50 plays, bucketed by hour or weekday.
- **Release-date shapes:** decades and "freshness" from `album.release_date`.
- **Depth:** how many of an artist's tracks are in your top lists.
- **Library gaps:** artists you follow but never play; albums saved but untouched.
- **Playlist builders:** create playlists from any of the above with `POST /me/playlists` + `items`.
- **Live "now playing" views:** SDK `player_state_changed` plus `track_window` for queue previews.
- **Outside data for what Spotify removed:** Last.fm (similar artists with `match` score; listener/playcount for a global heat) and ListenBrainz labs (similar artists/recordings). Both unverified here; see TODO Phase 7.

## Last.fm and ListenBrainz (for Spin the Record)

- Last.fm `artist.getSimilar`: params `artist` or `mbid`, `limit`, `autocorrect`, `api_key`. No user auth. Returns `name`, `mbid`, `match` (0–1), `url`, `image`. Error 29 = rate limit exceeded; no numeric limit published. Terms not yet reviewed.
- ListenBrainz labs (`labs.api.listenbrainz.org`): `similar-artists`, `similar-recordings`, `mlhd-similar-recordings`, `tag-similarity`. Parameters and auth are not documented on the index page; probe before relying on it.

## Constraints to remember

- Premium needed for the SDK and for Developer Mode ownership; 5 test users max.
- Redirect URIs must match exactly; no `localhost` (use `127.0.0.1`).
- Spotify policy notes seen on the reference pages: streaming apps may not be commercial; audio must stay in original form; Spotify content may not be synchronized or broadcast; preview clips may not be a standalone service.
- Adding scopes forces users to log in again.

## Sources

- https://developer.spotify.com/documentation/web-api/references/changes/february-2026
- https://developer.spotify.com/documentation/web-api/references/changes/march-2026
- https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api
- https://developer.spotify.com/documentation/web-api/concepts/scopes
- https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
- https://developer.spotify.com/documentation/web-api/reference/get-recently-played
- https://developer.spotify.com/documentation/web-playback-sdk/reference
- https://www.last.fm/api/show/artist.getSimilar
- https://labs.api.listenbrainz.org/
- https://techcrunch.com/2026/02/06/spotify-changes-developer-mode-api-to-require-premium-accounts-limits-test-users/
