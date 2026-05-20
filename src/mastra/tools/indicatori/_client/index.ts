import { readIndicatoriConfig } from './config';
import { createMockClient } from './mock';
import { createRealClient } from './real';
import type { IndicatoreId, ResponseRisultato } from './types';

export interface IndicatoriClient {
  getIndicatore(id: IndicatoreId): Promise<ResponseRisultato>;
}

let cached: IndicatoriClient | null = null;

export function getIndicatoriClient(): IndicatoriClient {
  if (cached) return cached;
  const config = readIndicatoriConfig();
  cached = config.mode === 'real' ? createRealClient(config) : createMockClient();
  return cached;
}

export function resetIndicatoriClient(): void {
  cached = null;
}

export type { IndicatoreId, ResponseRisultato };
