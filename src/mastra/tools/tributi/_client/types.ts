import { z } from 'zod';
import {
  ResultType,
  TipoImmobile,
  TipoImposta,
  TipoTributoMinore,
  TipoSoggetto,
} from './enums';

// ----------------------------------------------------------------------------
// Tipi response — modellati 1:1 dagli schemi OpenAPI di api-tributi-next.yaml.
// Conserviamo solo i campi rilevanti per l'agente; gli altri sono passthrough
// (z.passthrough) per evitare lock-in sui contratti dell'API reale.
// ----------------------------------------------------------------------------

const PaginatedResponseBase = z.object({
  resultType: ResultType.nullable().optional(),
  resultDescription: z.string().nullable().optional(),
  totalCount: z.number().int().nullable().optional(),
});

// --- Avvisi di pagamento ----------------------------------------------------

export const AvvisoPagamentoSchema = z
  .object({
    idAvviso: z.number().int(),
    codiceAvvisoCodice: z.string().nullable().optional(),
    codiceAvvisoDescrizione: z.string().nullable().optional(),
    statoEmissione: z.string().nullable().optional(),
    numeroAvviso: z.string().nullable().optional(),
    dataAvviso: z.string().nullable().optional(),
    importoTotale: z.string().nullable().optional(),
    importoVersato: z.string().nullable().optional(),
    importoResiduo: z.string().nullable().optional(),
    tipoAvviso: z.string().nullable().optional(),
    pagoPa: z.boolean().optional(),
  })
  .passthrough();
export type AvvisoPagamento = z.infer<typeof AvvisoPagamentoSchema>;

export const AvvisiPagamentoResponseSchema = PaginatedResponseBase.extend({
  result: z.array(AvvisoPagamentoSchema).nullable().optional(),
});
export type AvvisiPagamentoResponse = z.infer<typeof AvvisiPagamentoResponseSchema>;

// --- Titolarità catastali ---------------------------------------------------

export const TitoloCatastoSchema = z
  .object({
    identificativoImmobile: z.number().int(),
    tipoImmobile: z.string().nullable().optional(),
    sezione: z.string().nullable().optional(),
    foglio: z.string().nullable().optional(),
    numero: z.string().nullable().optional(),
    subalterno: z.string().nullable().optional(),
    categoria: z.string().nullable().optional(),
    desCategoria: z.string().nullable().optional(),
    renditaEuro: z.string().nullable().optional(),
    superficie: z.number().int().nullable().optional(),
    titolo: z.string().nullable().optional(),
    percentualePossesso: z.string().nullable().optional(),
    dataValiditaInizio: z.string().nullable().optional(),
    dataValiditaFine: z.string().nullable().optional(),
    codiceFiscalePiva: z.string().nullable().optional(),
    denominazione: z.string().nullable().optional(),
  })
  .passthrough();
export type TitoloCatasto = z.infer<typeof TitoloCatastoSchema>;

export const TitolaritaCatastoResponseSchema = PaginatedResponseBase.extend({
  result: z.array(TitoloCatastoSchema).nullable().optional(),
});
export type TitolaritaCatastoResponse = z.infer<typeof TitolaritaCatastoResponseSchema>;

// --- Posizioni TARI (occupazioni) -------------------------------------------

export const OccupazioneSchema = z
  .object({
    idSoggetto: z.number().int(),
    numeroUtenza: z.number().int(),
    domestica: z.string().nullable().optional(),
    dataInizio: z.string().nullable().optional(),
    dataFine: z.string().nullable().optional(),
    abitazionePrincipale: z.string().nullable().optional(),
    totaleSuperficie: z.string().nullable().optional(),
    tipoOccupazione: z.string().nullable().optional(),
    codiceAteco: z.string().nullable().optional(),
    destinazioneUso: z.string().nullable().optional(),
    annullato: z.boolean().optional(),
    iscrizione: z.boolean().optional(),
  })
  .passthrough();
export type Occupazione = z.infer<typeof OccupazioneSchema>;

export const OccupazioniResponseSchema = PaginatedResponseBase.extend({
  result: z.array(OccupazioneSchema).nullable().optional(),
});
export type OccupazioniResponse = z.infer<typeof OccupazioniResponseSchema>;

// --- Posizioni IMU (titolarità) ---------------------------------------------

export const TitoloImuSchema = z
  .object({
    idSoggetto: z.number().int(),
    numeroScheda: z.number().int(),
    percentualePossesso: z.number(),
    rendita: z.number(),
    categoriaCatastale: z.string().nullable().optional(),
    classeCatastale: z.string().nullable().optional(),
    tipoTitolarita: z.string().nullable().optional(),
    dataInizio: z.string().nullable().optional(),
    dataFine: z.string().nullable().optional(),
    aliquota: z.string().nullable().optional(),
    storico: z.boolean().optional(),
    inagibile: z.boolean().optional(),
    annullato: z.boolean().optional(),
    iscrizione: z.boolean().optional(),
  })
  .passthrough();
export type TitoloImu = z.infer<typeof TitoloImuSchema>;

export const TitolaritaResponseSchema = PaginatedResponseBase.extend({
  result: z.array(TitoloImuSchema).nullable().optional(),
});
export type TitolaritaResponse = z.infer<typeof TitolaritaResponseSchema>;

// --- Versamenti -------------------------------------------------------------

export const VersamentoSchema = z
  .object({
    idSoggetto: z.number().int(),
    anno: z.number().int(),
    modulo: z.string().nullable().optional(),
    tipoVersamento: z.string().nullable().optional(),
    codiceTributoF24: z.string().nullable().optional(),
    dataPagamento: z.string().nullable().optional(),
    importo: z.string().nullable().optional(),
    annullato: z.boolean().optional(),
    violazione: z.boolean().nullable().optional(),
  })
  .passthrough();
export type Versamento = z.infer<typeof VersamentoSchema>;

export const VersamentiResponseSchema = PaginatedResponseBase.extend({
  result: z.array(VersamentoSchema).nullable().optional(),
});
export type VersamentiResponse = z.infer<typeof VersamentiResponseSchema>;

// --- Accertamenti (provvedimenti) -------------------------------------------

export const ProvvedimentoSchema = z
  .object({
    idAvvisoProvvedimento: z.number().int(),
    codiceAvvisoCodice: z.string().nullable().optional(),
    codiceAvvisoDescrizione: z.string().nullable().optional(),
    statoEmissione: z.string().nullable().optional(),
    numeroAvviso: z.string().nullable().optional(),
    dataAvviso: z.string().nullable().optional(),
    stato: z.string().nullable().optional(),
    importoTotale: z.string().nullable().optional(),
    importoVersato: z.string().nullable().optional(),
    importoResiduo: z.string().nullable().optional(),
    dataNotifica: z.string().nullable().optional(),
    tipoAvviso: z.string().nullable().optional(),
  })
  .passthrough();
export type Provvedimento = z.infer<typeof ProvvedimentoSchema>;

export const ProvvedimentiResponseSchema = PaginatedResponseBase.extend({
  result: z.array(ProvvedimentoSchema).nullable().optional(),
});
export type ProvvedimentiResponse = z.infer<typeof ProvvedimentiResponseSchema>;

// --- Pratiche (tributi minori) ----------------------------------------------

export const PraticaSchema = z
  .object({
    id: z.number().int(),
    tipoTributo: z.string().nullable().optional(),
    idIndividuo: z.number().int(),
    numeroPratica: z.number().int(),
    dataInizio: z.string().nullable().optional(),
    dataFine: z.string().nullable().optional(),
    ubicazione: z.string().nullable().optional(),
    categoria: z.string().nullable().optional(),
    dimensione: z.string().nullable().optional(),
    valoreImponibile: z.string().nullable().optional(),
    tipoPratica: z.string().nullable().optional(),
    tipologia: z.string().nullable().optional(),
    nota: z.string().nullable().optional(),
  })
  .passthrough();
export type Pratica = z.infer<typeof PraticaSchema>;

export const PraticheResponseSchema = PaginatedResponseBase.extend({
  result: z.array(PraticaSchema).nullable().optional(),
});
export type PraticheResponse = z.infer<typeof PraticheResponseSchema>;

// --- Lookup soggetto --------------------------------------------------------
// L'API espone gli endpoint per idSoggetto numerico (int64). Per i tool è
// più ergonomico accettare codiceFiscale: il client traduce internamente.
// In mock c'è una mappa hardcoded; in real va integrato con un servizio reale.

export const SoggettoSchema = z.object({
  idSoggetto: z.number().int(),
  codiceFiscale: z.string(),
  tipoSoggetto: TipoSoggetto,
  denominazione: z.string(),
});
export type Soggetto = z.infer<typeof SoggettoSchema>;

// ----------------------------------------------------------------------------
// Parametri input dei metodi del client (formato user-friendly: codiceFiscale).
// ----------------------------------------------------------------------------

const CodiceFiscaleParam = z.object({
  codiceFiscale: z.string().min(11).max(16),
});

export const GetAvvisiPagamentoParams = CodiceFiscaleParam.extend({
  anno: z.number().int().optional(),
});
export type GetAvvisiPagamentoParams = z.infer<typeof GetAvvisiPagamentoParams>;

export const GetTitolaritaCatastoParams = CodiceFiscaleParam.extend({
  anno: z.number().int().optional(),
  tipoImmobile: TipoImmobile.optional(),
});
export type GetTitolaritaCatastoParams = z.infer<typeof GetTitolaritaCatastoParams>;

export const GetPosizioniTariParams = CodiceFiscaleParam.extend({
  anno: z.number().int().optional(),
  mostraCessazioni: z.boolean().optional(),
  annoPrecSucc: z.number().int().optional(),
});
export type GetPosizioniTariParams = z.infer<typeof GetPosizioniTariParams>;

export const GetPosizioniImuParams = GetPosizioniTariParams;
export type GetPosizioniImuParams = z.infer<typeof GetPosizioniImuParams>;

export const GetVersamentiParams = CodiceFiscaleParam.extend({
  anno: z.number().int().optional(),
  imposta: TipoImposta.optional(),
});
export type GetVersamentiParams = z.infer<typeof GetVersamentiParams>;

export const GetAccertamentiParams = CodiceFiscaleParam.extend({
  anno: z.number().int().optional(),
});
export type GetAccertamentiParams = z.infer<typeof GetAccertamentiParams>;

export const GetPraticheParams = CodiceFiscaleParam.extend({
  tipoTributo: TipoTributoMinore,
  anno: z.number().int().optional(),
  mostraCessazioni: z.boolean().optional(),
});
export type GetPraticheParams = z.infer<typeof GetPraticheParams>;
