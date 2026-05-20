import { z } from 'zod';

// Shape della response per TUTTI i 25 endpoint /contesto/<indicatore>.
// Tre stringhe — il contratto è lo stesso per ogni indicatore.
export const ResponseRisultatoSchema = z
  .object({
    anno: z.string(),
    valoreprevisionale: z.string(),
    valorereale: z.string(),
  })
  .passthrough();

export type ResponseRisultato = z.infer<typeof ResponseRisultatoSchema>;

// Enum interno con tutti gli identificativi degli indicatori (= path API).
// Utile per il client e per la factory dei tool.
export const INDICATORI = [
  // Indici finanziari
  'indice-autonomia-finanziaria',
  'indice-autonomia-impositiva',
  'prelievo-tributario-pro-capite',
  'indice-autonomia-tariffaria-propria',
  'rigidita-spese-correnti',
  'incidenza-oneri-finanziari-spese-correnti',
  'percentuale-copertura-spese-correnti',
  'spese-correnti-pro-capite',
  'spese-conto-capitale-pro-capite',
  // Propensione spesa
  'propensione-spesa-sociale',
  'propensione-spesa-istruzione',
  'propensione-spesa-giovani',
  'propensione-spesa-ambiente',
  // Personale
  'incidenza-spesa-personale-spese-correnti',
  'spesa-personale-media',
  'rapporto-dipendenti-popolazione',
  'spesa-formazione-personale',
  // Digitalizzazione
  'spesa-digitalizzazione-ente',
  'spesa-digitalizzazione-ente-pro-capite',
  // Demografia
  'tasso-natalita',
  'tasso-mortalita',
  'saldo-naturale',
  'crescita-naturale',
  'saldo-migratorio',
  'saldo-popolazione',
] as const;

export type IndicatoreId = (typeof INDICATORI)[number];

// Tool prendono nessun input (l'ente è implicito nel voucher PDND), ma per
// uniformità di interfaccia accettiamo un oggetto vuoto.
export const GetIndicatoreParams = z.object({});
export type GetIndicatoreParams = z.infer<typeof GetIndicatoreParams>;
