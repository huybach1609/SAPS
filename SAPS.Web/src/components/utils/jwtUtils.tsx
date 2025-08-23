// src/utils/jwtClaims.ts
type JwtClaims = Record<string, any>;

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function parseJwt(token: string): JwtClaims {
  const normalized = token.trim().replace(/^Bearer\s+/i, '');
  const parts = normalized.split('.');
  if (parts.length < 2) throw new Error('Invalid JWT');
  const payloadJson = base64UrlDecode(parts[1]);
  return JSON.parse(payloadJson);
}

const CLAIM_KEYS = {
  userId: ['nameid', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier', 'sub'],
  email: ['email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
  fullName: ['name', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name', 'unique_name'],
  googleId: ['google_id', 'googleid', 'googleId'],
} as const;

export function getUserClaimsFromJwt(token: string) {
  const claims = parseJwt(token);
  const pick = (keys: readonly string[]) =>
    keys.map(k => claims[k]).find(v => v != null && v !== '');

  return {
    userId: pick(CLAIM_KEYS.userId) ?? '',
    email: pick(CLAIM_KEYS.email) ?? '',
    fullName: pick(CLAIM_KEYS.fullName) ?? '',
    googleId: pick(CLAIM_KEYS.googleId) ?? '',
    raw: claims,
  };
}

// // Example usage:
// const token = localStorage.getItem('auth_token');
// if (token) {
//   const { userId, email, fullName, googleId } = getUserClaimsFromJwt(token);
// }