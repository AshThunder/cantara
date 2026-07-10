export type CantonConfig = {
  ledgerUrl: string;
  authUrl: string;
  clientId: string;
  clientSecret: string;
  packageId: string;
  operatorParty: string;
  partyMap: Record<string, string>;
};

function partyMapFromEnv(): Record<string, string> {
  const operator = process.env.CANTON_OPERATOR_PARTY ?? '';
  const defaults: Record<string, string> = {
    Alice: process.env.CANTON_PARTY_ALICE ?? operator,
    Bob: process.env.CANTON_PARTY_BOB ?? operator,
    Carol: process.env.CANTON_PARTY_CAROL ?? operator,
    Financier: process.env.CANTON_PARTY_FINANCIER ?? operator,
  };
  if (process.env.CANTON_PARTIES_JSON) {
    try {
      return { ...defaults, ...JSON.parse(process.env.CANTON_PARTIES_JSON) };
    } catch {
      console.warn('Invalid CANTON_PARTIES_JSON, using defaults');
    }
  }
  return defaults;
}

export function loadCantonConfig(): CantonConfig | null {
  const ledgerUrl = process.env.CANTON_LEDGER_URL?.replace(/\/$/, '');
  const clientSecret = process.env.CANTON_CLIENT_SECRET;
  if (!ledgerUrl || !clientSecret) return null;

  return {
    ledgerUrl,
    authUrl:
      process.env.CANTON_AUTH_URL ??
      'https://auth.sandbox.fivenorth.io/application/o/token/',
    clientId: process.env.CANTON_CLIENT_ID ?? 'validator-devnet-m2m',
    clientSecret,
    packageId:
      process.env.CANTON_PACKAGE_ID ??
      'b011f10b002d597291b67192a3c6c036a5ea9c7387726718292833d2c3cf3f58',
    operatorParty:
      process.env.CANTON_OPERATOR_PARTY ??
      '5nsandbox-devnet-2::1220a14ca128063b8dc9d1ebb0bd22633be9f2168500f4dbc1ecaeb1855b14e5acf8',
    partyMap: partyMapFromEnv(),
  };
}

export function isCantonMode(): boolean {
  return (process.env.LEDGER_MODE ?? 'canton') === 'canton' && loadCantonConfig() !== null;
}
