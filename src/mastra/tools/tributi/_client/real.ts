import type { TributiClientConfig } from './config';
import type { TributiClient } from './index';
import {
  AvvisiPagamentoResponseSchema,
  OccupazioniResponseSchema,
  PraticheResponseSchema,
  ProvvedimentiResponseSchema,
  TitolaritaCatastoResponseSchema,
  TitolaritaResponseSchema,
  VersamentiResponseSchema,
  type AvvisiPagamentoResponse,
  type OccupazioniResponse,
  type PraticheResponse,
  type ProvvedimentiResponse,
  type Soggetto,
  type TitolaritaCatastoResponse,
  type TitolaritaResponse,
  type VersamentiResponse,
} from './types';
import type { ZodTypeAny, z } from 'zod';

// Page size alta: i tool non espongono paginazione, prendiamo la prima pagina
// "lunga" e basta. Se i dataset crescono oltre, va rivisto.
const DEFAULT_PAGE_SIZE = 200;

// ----------------------------------------------------------------------------
// Implementazione reale del TributiClient.
// Mantiene la stessa interfaccia del mock — switch via TRIBUTI_API_MODE=real.
//
// PRE-PRODUZIONE:
// - resolveCodiceFiscale è stub: l'YAML di api-tributi-next NON espone un
//   endpoint pubblico CF→idSoggetto. Va integrato con il servizio anagrafico
//   reale (ANPR locale / endpoint Civilia Next dedicato) prima di switchare
//   in real, oppure i tool vanno cambiati per accettare direttamente idSoggetto.
// - Le response sono validate con i Zod schema in types.ts (passthrough sui
//   campi sconosciuti) per accorgersi subito di breaking change lato server.
// ----------------------------------------------------------------------------

export function createRealClient(config: TributiClientConfig): TributiClient {
  if (!config.baseUrl) {
    throw new Error(
      'TRIBUTI_API_BASE_URL non configurata. Imposta la variabile d\'ambiente o usa TRIBUTI_API_MODE=mock.',
    );
  }
  if (!config.token) {
    throw new Error(
      'TRIBUTI_API_TOKEN non configurata. Imposta il voucher JWT PDND o usa TRIBUTI_API_MODE=mock.',
    );
  }

  const baseUrl = config.baseUrl.replace(/\/$/, '');

  async function get<S extends ZodTypeAny>(
    path: string,
    query: Record<string, string | number | boolean | undefined>,
    schema: S,
  ): Promise<z.infer<S>> {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      qs.set(k, String(v));
    }
    const url = `${baseUrl}${path}${qs.toString() ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(
        `Tributi API ${path} ${res.status} ${res.statusText}${body ? ` - ${body.slice(0, 500)}` : ''}`,
      );
    }

    const data = await res.json();
    return schema.parse(data);
  }

  async function resolveIdSoggetto(codiceFiscale: string): Promise<number> {
    const soggetto = await client.resolveCodiceFiscale(codiceFiscale);
    if (!soggetto) {
      throw new Error(`Soggetto non trovato per codice fiscale ${codiceFiscale}`);
    }
    return soggetto.idSoggetto;
  }

  const client: TributiClient = {
    async resolveCodiceFiscale(): Promise<Soggetto | null> {
      // TODO: integrare con il servizio anagrafico reale.
      // L'API api-tributi-next.yaml non espone un endpoint pubblico per la
      // risoluzione CF → idSoggetto. Possibili strategie:
      //   1) tabella di mapping locale aggiornata via ETL
      //   2) chiamata a un altro e-service PDND (es. ANPR / anagrafe tributi)
      //   3) modificare l'interfaccia dei tool per accettare idSoggetto
      throw new Error(
        'resolveCodiceFiscale non implementato per la modalità reale: integra il servizio anagrafico prima di switchare.',
      );
    },

    async getAvvisiPagamento({ codiceFiscale, anno }): Promise<AvvisiPagamentoResponse> {
      const idSoggetto = await resolveIdSoggetto(codiceFiscale);
      return get(
        '/avvisipagamento/get-avvisipagamento',
        { IdSoggetto: idSoggetto, Anno: anno, PageSize: DEFAULT_PAGE_SIZE, CurrentPage: 1 },
        AvvisiPagamentoResponseSchema,
      );
    },

    async getTitolaritaCatasto({
      codiceFiscale,
      anno,
      tipoImmobile,
    }): Promise<TitolaritaCatastoResponse> {
      const idSoggetto = await resolveIdSoggetto(codiceFiscale);
      const soggetto = await client.resolveCodiceFiscale(codiceFiscale);
      return get(
        '/catasto/get-titolaritacatasto',
        {
          IdentificativoSoggetto: idSoggetto,
          TipoSoggetto: soggetto?.tipoSoggetto,
          Anno: anno,
          TipoImmobile: tipoImmobile,
          PageSize: DEFAULT_PAGE_SIZE,
          CurrentPage: 1,
        },
        TitolaritaCatastoResponseSchema,
      );
    },

    async getPosizioniTari({
      codiceFiscale,
      anno,
      mostraCessazioni,
      annoPrecSucc,
    }): Promise<OccupazioniResponse> {
      const idSoggetto = await resolveIdSoggetto(codiceFiscale);
      return get(
        '/occupazioni/get-posizionitari',
        {
          IdentificativoSoggetto: idSoggetto,
          Anno: anno,
          MostraCessazioni: mostraCessazioni,
          AnnoPrecSucc: annoPrecSucc,
          PageSize: DEFAULT_PAGE_SIZE,
          CurrentPage: 1,
        },
        OccupazioniResponseSchema,
      );
    },

    async getPosizioniImu({
      codiceFiscale,
      anno,
      mostraCessazioni,
      annoPrecSucc,
    }): Promise<TitolaritaResponse> {
      const idSoggetto = await resolveIdSoggetto(codiceFiscale);
      return get(
        '/titolarita/get-posizioniimu',
        {
          IdentificativoSoggetto: idSoggetto,
          Anno: anno,
          MostraCessazioni: mostraCessazioni,
          AnnoPrecSucc: annoPrecSucc,
          PageSize: DEFAULT_PAGE_SIZE,
          CurrentPage: 1,
        },
        TitolaritaResponseSchema,
      );
    },

    async getVersamenti({ codiceFiscale, anno, imposta }): Promise<VersamentiResponse> {
      const idSoggetto = await resolveIdSoggetto(codiceFiscale);
      return get(
        '/versamenti/get-versamenti',
        {
          IdSoggetto: idSoggetto,
          Anno: anno,
          Imposta: imposta,
          PageSize: DEFAULT_PAGE_SIZE,
          CurrentPage: 1,
        },
        VersamentiResponseSchema,
      );
    },

    async getAccertamenti({ codiceFiscale, anno }): Promise<ProvvedimentiResponse> {
      const idSoggetto = await resolveIdSoggetto(codiceFiscale);
      return get(
        '/provvedimenti/get-accertamenti',
        { IdSoggetto: idSoggetto, Anno: anno, PageSize: DEFAULT_PAGE_SIZE, CurrentPage: 1 },
        ProvvedimentiResponseSchema,
      );
    },

    async getPratiche({
      codiceFiscale,
      tipoTributo,
      anno,
      mostraCessazioni,
    }): Promise<PraticheResponse> {
      const idSoggetto = await resolveIdSoggetto(codiceFiscale);
      return get(
        '/pratiche/get-pratiche',
        {
          IdSoggetto: idSoggetto,
          TipoTributo: tipoTributo,
          Anno: anno,
          MostraCessazioni: mostraCessazioni,
          PageSize: DEFAULT_PAGE_SIZE,
          CurrentPage: 1,
        },
        PraticheResponseSchema,
      );
    },
  };

  return client;
}
