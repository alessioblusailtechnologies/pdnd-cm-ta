import { readTributiConfig } from './config';
import { createMockClient } from './mock';
import { createRealClient } from './real';
import type {
  AvvisiPagamentoResponse,
  GetAccertamentiParams,
  GetAvvisiPagamentoParams,
  GetPosizioniImuParams,
  GetPosizioniTariParams,
  GetPraticheParams,
  GetTitolaritaCatastoParams,
  GetVersamentiParams,
  OccupazioniResponse,
  PraticheResponse,
  ProvvedimentiResponse,
  Soggetto,
  TitolaritaCatastoResponse,
  TitolaritaResponse,
  VersamentiResponse,
} from './types';

// Interfaccia comune mock/real. Tutti i metodi accettano `codiceFiscale` come
// input user-friendly: l'implementazione si occupa di risolvere il
// `idSoggetto` numerico richiesto dall'API Civilia Next.
export interface TributiClient {
  resolveCodiceFiscale(codiceFiscale: string): Promise<Soggetto | null>;

  getAvvisiPagamento(params: GetAvvisiPagamentoParams): Promise<AvvisiPagamentoResponse>;
  getTitolaritaCatasto(params: GetTitolaritaCatastoParams): Promise<TitolaritaCatastoResponse>;
  getPosizioniTari(params: GetPosizioniTariParams): Promise<OccupazioniResponse>;
  getPosizioniImu(params: GetPosizioniImuParams): Promise<TitolaritaResponse>;
  getVersamenti(params: GetVersamentiParams): Promise<VersamentiResponse>;
  getAccertamenti(params: GetAccertamentiParams): Promise<ProvvedimentiResponse>;
  getPratiche(params: GetPraticheParams): Promise<PraticheResponse>;
}

let cached: TributiClient | null = null;

export function getTributiClient(): TributiClient {
  if (cached) return cached;
  const config = readTributiConfig();
  cached = config.mode === 'real' ? createRealClient(config) : createMockClient();
  return cached;
}

// Utile in test o se cambi env a runtime.
export function resetTributiClient(): void {
  cached = null;
}

export type {
  AvvisiPagamentoResponse,
  GetAccertamentiParams,
  GetAvvisiPagamentoParams,
  GetPosizioniImuParams,
  GetPosizioniTariParams,
  GetPraticheParams,
  GetTitolaritaCatastoParams,
  GetVersamentiParams,
  OccupazioniResponse,
  PraticheResponse,
  ProvvedimentiResponse,
  Soggetto,
  TitolaritaCatastoResponse,
  TitolaritaResponse,
  VersamentiResponse,
};
