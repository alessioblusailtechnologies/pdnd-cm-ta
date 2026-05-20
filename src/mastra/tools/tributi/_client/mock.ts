import type { TributiClient } from './index';
import type {
  AvvisiPagamentoResponse,
  OccupazioniResponse,
  PraticheResponse,
  ProvvedimentiResponse,
  Soggetto,
  TitolaritaCatastoResponse,
  TitolaritaResponse,
  VersamentiResponse,
} from './types';

// ----------------------------------------------------------------------------
// Mock dataset — 3 contribuenti fittizi con dati coerenti su tutti gli ambiti.
// Sostituito dall'implementazione reale via TRIBUTI_API_MODE=real.
// ----------------------------------------------------------------------------

const SOGGETTI: Soggetto[] = [
  {
    idSoggetto: 12345,
    codiceFiscale: 'RSSMRA80A01H501U',
    tipoSoggetto: 'P',
    denominazione: 'Mario Rossi',
  },
  {
    idSoggetto: 67890,
    codiceFiscale: 'VRDLGI75B15H501Z',
    tipoSoggetto: 'P',
    denominazione: 'Luigi Verdi',
  },
  {
    idSoggetto: 99001,
    codiceFiscale: '12345678901',
    tipoSoggetto: 'G',
    denominazione: 'Acme Tarantina S.r.l.',
  },
];

function findSoggetto(cf: string): Soggetto | null {
  const normalized = cf.trim().toUpperCase();
  return SOGGETTI.find((s) => s.codiceFiscale.toUpperCase() === normalized) ?? null;
}

function empty<T>(): { resultType: 1; resultDescription: string; totalCount: number; result: T[] } {
  return {
    resultType: 1,
    resultDescription: 'Nessun risultato per il soggetto indicato',
    totalCount: 0,
    result: [],
  };
}

function ok<T>(items: T[]): {
  resultType: 1;
  resultDescription: string;
  totalCount: number;
  result: T[];
} {
  return {
    resultType: 1,
    resultDescription: 'OK',
    totalCount: items.length,
    result: items,
  };
}

function filterByAnno<T extends Record<string, unknown>>(
  items: T[],
  anno: number | undefined,
  dateFields: string[],
): T[] {
  if (!anno) return items;
  return items.filter((item) =>
    dateFields.some((f) => {
      const v = item[f];
      return typeof v === 'string' && v.startsWith(String(anno));
    }),
  );
}

// ----------------------------------------------------------------------------
// Dati per soggetto — indicizzati per idSoggetto
// ----------------------------------------------------------------------------

type AvvisoItem = NonNullable<AvvisiPagamentoResponse['result']>[number];
type TitoloCatastoItem = NonNullable<TitolaritaCatastoResponse['result']>[number];
type OccupazioneItem = NonNullable<OccupazioniResponse['result']>[number];
type TitoloImuItem = NonNullable<TitolaritaResponse['result']>[number];
type VersamentoItem = NonNullable<VersamentiResponse['result']>[number];
type ProvvedimentoItem = NonNullable<ProvvedimentiResponse['result']>[number];
type PraticaItem = NonNullable<PraticheResponse['result']>[number];

const AVVISI: Record<number, AvvisoItem[]> = {
  12345: [
    {
      idAvviso: 5001,
      codiceAvvisoCodice: 'IMU-2024',
      codiceAvvisoDescrizione: 'IMU saldo 2024',
      statoEmissione: 'Emesso',
      numeroAvviso: '2024/00125',
      dataAvviso: '2024-12-16',
      importoTotale: '420,50',
      importoVersato: '0,00',
      importoResiduo: '420,50',
      tipoAvviso: 'Ordinario',
      pagoPa: true,
    },
    {
      idAvviso: 5002,
      codiceAvvisoCodice: 'TARI-2024',
      codiceAvvisoDescrizione: 'TARI 2024 rata unica',
      statoEmissione: 'Pagato',
      numeroAvviso: '2024/04412',
      dataAvviso: '2024-06-30',
      importoTotale: '186,00',
      importoVersato: '186,00',
      importoResiduo: '0,00',
      tipoAvviso: 'Ordinario',
      pagoPa: true,
    },
  ],
  67890: [
    {
      idAvviso: 5101,
      codiceAvvisoCodice: 'TARI-2025',
      codiceAvvisoDescrizione: 'TARI 2025 prima rata',
      statoEmissione: 'Emesso',
      numeroAvviso: '2025/00088',
      dataAvviso: '2025-05-12',
      importoTotale: '95,40',
      importoVersato: '0,00',
      importoResiduo: '95,40',
      tipoAvviso: 'Ordinario',
      pagoPa: true,
    },
  ],
  99001: [
    {
      idAvviso: 5201,
      codiceAvvisoCodice: 'ICP-2025',
      codiceAvvisoDescrizione: 'Imposta comunale pubblicità 2025',
      statoEmissione: 'Emesso',
      numeroAvviso: '2025/00301',
      dataAvviso: '2025-03-15',
      importoTotale: '1.240,00',
      importoVersato: '0,00',
      importoResiduo: '1.240,00',
      tipoAvviso: 'Ordinario',
      pagoPa: true,
    },
  ],
};

const TITOLARITA_CATASTO: Record<number, TitoloCatastoItem[]> = {
  12345: [
    {
      identificativoImmobile: 700001,
      tipoImmobile: 'F',
      sezione: 'TA',
      foglio: '128',
      numero: '345',
      subalterno: '4',
      categoria: 'A/3',
      desCategoria: 'Abitazione di tipo economico',
      renditaEuro: '512,40',
      superficie: 95,
      titolo: 'Proprietà',
      percentualePossesso: '100',
      dataValiditaInizio: '2010-04-12',
      dataValiditaFine: null,
      codiceFiscalePiva: 'RSSMRA80A01H501U',
      denominazione: 'Mario Rossi',
    },
  ],
  67890: [
    {
      identificativoImmobile: 700101,
      tipoImmobile: 'F',
      sezione: 'TA',
      foglio: '45',
      numero: '12',
      subalterno: '2',
      categoria: 'A/2',
      desCategoria: 'Abitazione di tipo civile',
      renditaEuro: '740,10',
      superficie: 120,
      titolo: 'Proprietà',
      percentualePossesso: '50',
      dataValiditaInizio: '2015-09-01',
      dataValiditaFine: null,
      codiceFiscalePiva: 'VRDLGI75B15H501Z',
      denominazione: 'Luigi Verdi',
    },
    {
      identificativoImmobile: 700102,
      tipoImmobile: 'T',
      sezione: 'TA',
      foglio: '88',
      numero: '203',
      subalterno: null,
      categoria: null,
      desCategoria: 'Terreno agricolo',
      renditaEuro: '21,30',
      superficie: 4500,
      titolo: 'Proprietà',
      percentualePossesso: '100',
      dataValiditaInizio: '2008-02-18',
      dataValiditaFine: null,
      codiceFiscalePiva: 'VRDLGI75B15H501Z',
      denominazione: 'Luigi Verdi',
    },
  ],
  99001: [
    {
      identificativoImmobile: 700201,
      tipoImmobile: 'F',
      sezione: 'TA',
      foglio: '15',
      numero: '78',
      subalterno: '1',
      categoria: 'C/1',
      desCategoria: 'Negozio',
      renditaEuro: '2.340,00',
      superficie: 180,
      titolo: 'Proprietà',
      percentualePossesso: '100',
      dataValiditaInizio: '2019-11-04',
      dataValiditaFine: null,
      codiceFiscalePiva: '12345678901',
      denominazione: 'Acme Tarantina S.r.l.',
    },
  ],
};

const POSIZIONI_TARI: Record<number, OccupazioneItem[]> = {
  12345: [
    {
      idSoggetto: 12345,
      numeroUtenza: 100245,
      domestica: 'S',
      dataInizio: '2010-04-12',
      dataFine: null,
      abitazionePrincipale: 'S',
      totaleSuperficie: '95',
      tipoOccupazione: 'Proprietario',
      codiceAteco: null,
      destinazioneUso: 'Abitativo',
      annullato: false,
      iscrizione: true,
    },
  ],
  67890: [
    {
      idSoggetto: 67890,
      numeroUtenza: 100401,
      domestica: 'S',
      dataInizio: '2015-09-01',
      dataFine: null,
      abitazionePrincipale: 'N',
      totaleSuperficie: '60',
      tipoOccupazione: 'Comproprietario',
      codiceAteco: null,
      destinazioneUso: 'Abitativo',
      annullato: false,
      iscrizione: true,
    },
  ],
  99001: [
    {
      idSoggetto: 99001,
      numeroUtenza: 100888,
      domestica: 'N',
      dataInizio: '2019-11-04',
      dataFine: null,
      abitazionePrincipale: 'N',
      totaleSuperficie: '180',
      tipoOccupazione: 'Conduttore',
      codiceAteco: '47.71.10',
      destinazioneUso: 'Commerciale - negozio',
      annullato: false,
      iscrizione: true,
    },
  ],
};

const POSIZIONI_IMU: Record<number, TitoloImuItem[]> = {
  12345: [
    {
      idSoggetto: 12345,
      numeroScheda: 1,
      percentualePossesso: 100,
      rendita: 512.4,
      categoriaCatastale: 'A/3',
      classeCatastale: '3',
      tipoTitolarita: 'Proprietà',
      dataInizio: '2010-04-12',
      dataFine: null,
      aliquota: '4',
      storico: false,
      inagibile: false,
      annullato: false,
      iscrizione: true,
    },
  ],
  67890: [
    {
      idSoggetto: 67890,
      numeroScheda: 1,
      percentualePossesso: 50,
      rendita: 740.1,
      categoriaCatastale: 'A/2',
      classeCatastale: '4',
      tipoTitolarita: 'Proprietà',
      dataInizio: '2015-09-01',
      dataFine: null,
      aliquota: '10.6',
      storico: false,
      inagibile: false,
      annullato: false,
      iscrizione: true,
    },
    {
      idSoggetto: 67890,
      numeroScheda: 2,
      percentualePossesso: 100,
      rendita: 21.3,
      categoriaCatastale: null,
      classeCatastale: null,
      tipoTitolarita: 'Proprietà',
      dataInizio: '2008-02-18',
      dataFine: null,
      aliquota: '7.6',
      storico: false,
      inagibile: false,
      annullato: false,
      iscrizione: true,
    },
  ],
  99001: [
    {
      idSoggetto: 99001,
      numeroScheda: 1,
      percentualePossesso: 100,
      rendita: 2340,
      categoriaCatastale: 'C/1',
      classeCatastale: '5',
      tipoTitolarita: 'Proprietà',
      dataInizio: '2019-11-04',
      dataFine: null,
      aliquota: '10.6',
      storico: false,
      inagibile: false,
      annullato: false,
      iscrizione: true,
    },
  ],
};

const VERSAMENTI: Record<number, VersamentoItem[]> = {
  12345: [
    {
      idSoggetto: 12345,
      anno: 2024,
      modulo: 'IMU',
      tipoVersamento: 'F24',
      codiceTributoF24: '3918',
      dataPagamento: '2024-06-15',
      importo: '210,25',
      annullato: false,
      violazione: false,
    },
    {
      idSoggetto: 12345,
      anno: 2024,
      modulo: 'TARI',
      tipoVersamento: 'F24',
      codiceTributoF24: '3944',
      dataPagamento: '2024-07-02',
      importo: '186,00',
      annullato: false,
      violazione: false,
    },
  ],
  67890: [
    {
      idSoggetto: 67890,
      anno: 2024,
      modulo: 'IMU',
      tipoVersamento: 'F24',
      codiceTributoF24: '3918',
      dataPagamento: '2024-06-15',
      importo: '395,80',
      annullato: false,
      violazione: false,
    },
  ],
  99001: [
    {
      idSoggetto: 99001,
      anno: 2024,
      modulo: 'IMU',
      tipoVersamento: 'F24',
      codiceTributoF24: '3918',
      dataPagamento: '2024-06-15',
      importo: '1.450,00',
      annullato: false,
      violazione: false,
    },
  ],
};

const ACCERTAMENTI: Record<number, ProvvedimentoItem[]> = {
  12345: [],
  67890: [
    {
      idAvvisoProvvedimento: 9001,
      codiceAvvisoCodice: 'IMU-ACC-2022',
      codiceAvvisoDescrizione: 'Accertamento IMU 2022 omesso versamento',
      statoEmissione: 'Notificato',
      numeroAvviso: '2024/A/0042',
      dataAvviso: '2024-02-10',
      stato: 'Aperto',
      importoTotale: '780,00',
      importoVersato: '0,00',
      importoResiduo: '780,00',
      dataNotifica: '2024-02-28',
      tipoAvviso: 'Accertamento',
    },
  ],
  99001: [],
};

const PRATICHE: Record<number, PraticaItem[]> = {
  12345: [],
  67890: [
    {
      id: 11001,
      tipoTributo: 'Osap',
      idIndividuo: 67890,
      numeroPratica: 240015,
      dataInizio: '2024-04-01',
      dataFine: '2024-09-30',
      ubicazione: 'Via Garibaldi 12 - TA',
      categoria: 'Permanente',
      dimensione: '8',
      valoreImponibile: '320,00',
      tipoPratica: 'Concessione',
      tipologia: 'Suolo pubblico',
      nota: null,
    },
  ],
  99001: [
    {
      id: 11101,
      tipoTributo: 'ICP',
      idIndividuo: 99001,
      numeroPratica: 250003,
      dataInizio: '2025-01-01',
      dataFine: '2025-12-31',
      ubicazione: 'Via Garibaldi 78 - TA',
      categoria: 'Insegna esercizio',
      dimensione: '5',
      valoreImponibile: '1.240,00',
      tipoPratica: 'Autorizzazione',
      tipologia: 'Insegna',
      nota: null,
    },
  ],
};

const TIPO_TRIBUTO_MAP: Record<number, string> = {
  1: 'Osap',
  2: 'ICP',
  3: 'CUP',
  4: 'Accertamento Imposta Soggiorno',
  9: 'Tributi Vari',
};

// ----------------------------------------------------------------------------
// Factory mock
// ----------------------------------------------------------------------------

export function createMockClient(): TributiClient {
  return {
    async resolveCodiceFiscale(codiceFiscale) {
      return findSoggetto(codiceFiscale);
    },

    async getAvvisiPagamento({ codiceFiscale, anno }) {
      const soggetto = findSoggetto(codiceFiscale);
      if (!soggetto) return empty<AvvisoItem>();
      const items = AVVISI[soggetto.idSoggetto] ?? [];
      return ok(filterByAnno(items, anno, ['dataAvviso']));
    },

    async getTitolaritaCatasto({ codiceFiscale, tipoImmobile }) {
      const soggetto = findSoggetto(codiceFiscale);
      if (!soggetto) return empty<TitoloCatastoItem>();
      let items = TITOLARITA_CATASTO[soggetto.idSoggetto] ?? [];
      if (tipoImmobile === 1) items = items.filter((i) => i.tipoImmobile === 'F');
      if (tipoImmobile === 2) items = items.filter((i) => i.tipoImmobile === 'T');
      return ok(items);
    },

    async getPosizioniTari({ codiceFiscale, mostraCessazioni }) {
      const soggetto = findSoggetto(codiceFiscale);
      if (!soggetto) return empty<OccupazioneItem>();
      let items = POSIZIONI_TARI[soggetto.idSoggetto] ?? [];
      if (mostraCessazioni === false) items = items.filter((i) => !i.dataFine);
      return ok(items);
    },

    async getPosizioniImu({ codiceFiscale, mostraCessazioni }) {
      const soggetto = findSoggetto(codiceFiscale);
      if (!soggetto) return empty<TitoloImuItem>();
      let items = POSIZIONI_IMU[soggetto.idSoggetto] ?? [];
      if (mostraCessazioni === false) items = items.filter((i) => !i.dataFine);
      return ok(items);
    },

    async getVersamenti({ codiceFiscale, anno, imposta }) {
      const soggetto = findSoggetto(codiceFiscale);
      if (!soggetto) return empty<VersamentoItem>();
      let items = VERSAMENTI[soggetto.idSoggetto] ?? [];
      if (anno) items = items.filter((i) => i.anno === anno);
      if (imposta === 2) items = items.filter((i) => i.modulo === 'IMU');
      if (imposta === 5) items = items.filter((i) => i.modulo === 'TARI');
      return ok(items);
    },

    async getAccertamenti({ codiceFiscale, anno }) {
      const soggetto = findSoggetto(codiceFiscale);
      if (!soggetto) return empty<ProvvedimentoItem>();
      const items = ACCERTAMENTI[soggetto.idSoggetto] ?? [];
      return ok(filterByAnno(items, anno, ['dataAvviso']));
    },

    async getPratiche({ codiceFiscale, tipoTributo }) {
      const soggetto = findSoggetto(codiceFiscale);
      if (!soggetto) return empty<PraticaItem>();
      const all = PRATICHE[soggetto.idSoggetto] ?? [];
      const filtered = all.filter((p) => p.tipoTributo === TIPO_TRIBUTO_MAP[tipoTributo]);
      return ok(filtered);
    },
  };
}
