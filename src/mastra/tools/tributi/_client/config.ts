// Switch tra implementazione mock e implementazione reale dell'API tributi
// Civilia Next. Default: mock (sicuro in sviluppo, nessuna credenziale).
//
// Per puntare alla API reale impostare:
//   TRIBUTI_API_MODE=real
//   TRIBUTI_API_BASE_URL=https://tributipdnd.civilianext.it
//   TRIBUTI_API_TOKEN=<voucher JWT PDND>

export type TributiApiMode = 'mock' | 'real';

export interface TributiClientConfig {
  mode: TributiApiMode;
  baseUrl: string;
  token: string;
}

export function readTributiConfig(): TributiClientConfig {
  const rawMode = (process.env.TRIBUTI_API_MODE ?? 'mock').toLowerCase();
  const mode: TributiApiMode = rawMode === 'real' ? 'real' : 'mock';

  return {
    mode,
    baseUrl: process.env.TRIBUTI_API_BASE_URL ?? '',
    token: process.env.TRIBUTI_API_TOKEN ?? '',
  };
}
