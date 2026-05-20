import { z } from 'zod';

// Mirror degli enum int dell'API Civilia Next (api-tributi-next.yaml).
// Manteniamo i valori numerici dell'API ma esponiamo i nomi semantici lato tool.

export const TipoSoggetto = z.enum(['G', 'P']).describe('G = Giuridico, P = Persona Fisica');
export type TipoSoggetto = z.infer<typeof TipoSoggetto>;

export const TipoImmobile = z.union([z.literal(1), z.literal(2)]);
export type TipoImmobile = z.infer<typeof TipoImmobile>;

export const TIPO_IMMOBILE_LABEL: Record<number, string> = {
  1: 'Fabbricato',
  2: 'Terreno',
};

export const TipoImposta = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);
export type TipoImposta = z.infer<typeof TipoImposta>;

export const TIPO_IMPOSTA_LABEL: Record<number, string> = {
  1: 'ICI',
  2: 'IMU',
  3: 'TASI',
  4: 'TARES',
  5: 'TARI',
  6: 'TARI Giornaliera',
  7: 'Altro',
};

export const TipoTributoMinore = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(9),
]);
export type TipoTributoMinore = z.infer<typeof TipoTributoMinore>;

export const TIPO_TRIBUTO_MINORE_LABEL: Record<number, string> = {
  1: 'Osap',
  2: 'ICP',
  3: 'CUP',
  4: 'Accertamento Imposta Soggiorno',
  9: 'Tributi Vari',
};

export const ResultType = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type ResultType = z.infer<typeof ResultType>;

export const RESULT_TYPE_LABEL: Record<number, string> = {
  1: 'OK',
  2: 'Nessun risultato',
  3: 'Errore',
};
