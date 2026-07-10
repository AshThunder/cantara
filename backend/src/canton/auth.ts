import type { CantonConfig } from './config.js';

type TokenCache = { token: string; expiresAt: number };

let cache: TokenCache | null = null;

export async function getCantonToken(config: CantonConfig): Promise<string> {
  const now = Date.now();
  if (cache && cache.expiresAt > now + 60_000) return cache.token;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    audience: config.clientId,
    scope: 'daml_ledger_api',
  });

  const res = await fetch(config.authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Canton auth failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in?: number };
  cache = {
    token: data.access_token,
    expiresAt: now + (data.expires_in ?? 28_800) * 1000,
  };
  return cache.token;
}
