// Switch tra implementazione mock e implementazione reale dell'API
// "Indici di efficacia ed efficienza finanziaria e demografica" (BoxxApps).
// Default: mock (sicuro in sviluppo, nessuna credenziale).
//
// Per puntare alla API reale impostare:
//   INDICATORI_API_MODE=real
//   INDICATORI_API_BASE_URL=<base url BoxxApps>
//   INDICATORI_API_TOKEN=<voucher JWT PDND>

export type IndicatoriApiMode = 'mock' | 'real';

export interface IndicatoriClientConfig {
  mode: IndicatoriApiMode;
  baseUrl: string;
  token: string;
}

export function readIndicatoriConfig(): IndicatoriClientConfig {
  const rawMode = (process.env.INDICATORI_API_MODE ?? 'mock').toLowerCase();
  const mode: IndicatoriApiMode = rawMode === 'real' ? 'real' : 'mock';

  return {
    mode,
    baseUrl: process.env.INDICATORI_API_BASE_URL ?? '',
    token: process.env.INDICATORI_API_TOKEN ?? '',
  };
}
