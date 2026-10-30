import { Service, computed, signal } from '@angular/core';
import { SPOTIFY } from '../config';
import { generateCodeChallenge, generateRandomString } from './pkce';

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds. */
  expiresAt: number;
}

/** Error from Spotify's token endpoint. */
export class TokenError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    description: string | undefined,
  ) {
    super(description ?? code ?? `Token request failed (${status})`);
  }
}

// Prefixed so v2 never collides with v1 on the same origin (127.0.0.1:4200).
const TOKENS_KEY = 'sdash2.tokens';
const VERIFIER_KEY = 'sdash2.pkce_verifier';
const STATE_KEY = 'sdash2.pkce_state';

function readTokens(): Tokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  } catch {
    return null;
  }
}

/**
 * Spotify login with the Authorization Code flow + PKCE.
 * Ported from sdash v1 and rewritten on signals + fetch.
 */
@Service()
export class AuthService {
  private readonly tokens = signal<Tokens | null>(readTokens());

  /** True while the redirect back from Spotify is being exchanged. The app shows a splash instead of the login page. */
  readonly completing = signal(false);

  /** Message from a failed login, shown on the login page. */
  readonly loginError = signal<string | null>(null);

  /** A session can be kept alive only if we hold a refresh token. */
  readonly isLoggedIn = computed(() => !!this.tokens()?.refreshToken);

  /** Shared by concurrent callers so a burst of requests triggers one refresh. */
  private refreshInFlight?: Promise<string>;

  /** Must match a redirect URI registered in the Spotify dashboard exactly. */
  get redirectUri(): string {
    // Relative to <base href>, so it is /login in dev and /<repo>/login on GitHub Pages.
    return new URL('login', document.baseURI).href;
  }

  /** Step 1: send the user to Spotify's consent page. */
  async login(): Promise<void> {
    const verifier = generateRandomString(64);
    const challenge = await generateCodeChallenge(verifier);
    const state = generateRandomString(16);

    sessionStorage.setItem(VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);

    const params = new URLSearchParams({
      client_id: SPOTIFY.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: SPOTIFY.scopes.join(' '),
      code_challenge_method: 'S256',
      code_challenge: challenge,
      state,
    });
    window.location.href = `${SPOTIFY.authorizeUrl}?${params.toString()}`;
  }

  /**
   * Step 2: handle the redirect back to /login?code=...&state=...
   * Throws an Error with a user-presentable message on any failure.
   */
  async completeLogin(params: URLSearchParams): Promise<void> {
    const expectedState = sessionStorage.getItem(STATE_KEY);
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    // Both are single-use: clear them before anything that can fail.
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(VERIFIER_KEY);

    const error = params.get('error');
    if (error) {
      throw new Error(
        error === 'access_denied' ? 'Spotify login was cancelled.' : `Spotify returned an error: ${error}`,
      );
    }
    const code = params.get('code');
    if (!code) throw new Error('Spotify did not return an authorization code. Please try again.');
    if (!expectedState || params.get('state') !== expectedState) {
      throw new Error('Login session could not be verified. Please try again.');
    }
    if (!verifier) throw new Error('Login session expired. Please try again.');

    try {
      const res = await this.requestToken(
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
          client_id: SPOTIFY.clientId,
          code_verifier: verifier,
        }),
      );
      this.storeTokens(res);
    } catch (e) {
      const detail = e instanceof Error ? e.message : 'unknown error';
      throw new Error(`Spotify login failed: ${detail}`);
    }
  }

  /** A token valid right now, refreshing first if it is expired or about to be. */
  async getValidToken(): Promise<string | undefined> {
    const t = this.tokens();
    if (!t?.refreshToken) return undefined;
    if (Date.now() < t.expiresAt - SPOTIFY.expirySkewMs) return t.accessToken;
    return this.refreshAccessToken();
  }

  refreshAccessToken(): Promise<string> {
    if (this.refreshInFlight) return this.refreshInFlight;

    const refreshToken = this.tokens()?.refreshToken;
    if (!refreshToken) return Promise.reject(new Error('No refresh token available.'));

    const pending = this.requestToken(
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: SPOTIFY.clientId,
      }),
    )
      .then((res) => {
        this.storeTokens(res);
        return res.access_token;
      })
      .catch((err) => {
        // invalid_grant: expired or revoked. Retrying won't help.
        if (err instanceof TokenError && err.status === 400 && err.code === 'invalid_grant') {
          this.logout();
        }
        throw err;
      })
      .finally(() => {
        this.refreshInFlight = undefined;
      });

    this.refreshInFlight = pending;
    return pending;
  }

  logout(): void {
    this.tokens.set(null);
    try {
      localStorage.removeItem(TOKENS_KEY);
    } catch {
      /* storage unavailable */
    }
  }

  private async requestToken(body: URLSearchParams): Promise<TokenResponse> {
    const res = await fetch(SPOTIFY.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const json = (await res.json().catch(() => ({}))) as Partial<TokenResponse> & {
      error?: string;
      error_description?: string;
    };
    if (!res.ok) throw new TokenError(res.status, json.error, json.error_description);
    return json as TokenResponse;
  }

  private storeTokens(res: TokenResponse): void {
    const next: Tokens = {
      accessToken: res.access_token,
      // A refresh response may omit the refresh token; keep the existing one.
      refreshToken: res.refresh_token ?? this.tokens()?.refreshToken ?? '',
      expiresAt: Date.now() + res.expires_in * 1000,
    };
    this.tokens.set(next);
    try {
      localStorage.setItem(TOKENS_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable: session lasts until reload */
    }
  }
}
