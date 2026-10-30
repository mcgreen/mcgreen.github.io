/**
 * Helpers for the OAuth 2.0 Authorization Code flow with PKCE (RFC 7636).
 * `crypto.getRandomValues` and `crypto.subtle` need a secure context:
 * HTTPS or a loopback address such as http://127.0.0.1.
 */

/** Base64url-encodes bytes without padding, as PKCE requires. */
export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Random URL-safe string. 64 bytes -> 86 chars, inside the 43-128 range allowed for a verifier. */
export function generateRandomString(byteLength = 64): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(byteLength)));
}

/** code_challenge = BASE64URL(SHA256(code_verifier)) */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  return base64UrlEncode(new Uint8Array(digest));
}
