import type { IndicatoriClient } from './index';
import type { IndicatoreId, ResponseRisultato } from './types';

// ----------------------------------------------------------------------------
// Dataset mock — valori plausibili per il Comune di Taranto (anno 2024).
// Comune capoluogo del Sud, ~196k abitanti, declino demografico.
// Riferimenti: ordini di grandezza tipici per comuni capoluogo meridionali
// (Open BDAP, ISTAT). I dati NON sono reali, sono coerenti come scenario demo.
// "valoreprevisionale" = budget/bilancio di previsione
// "valorereale" = consuntivo/dato effettivo
// ----------------------------------------------------------------------------

const ANNO = '2024';

const VALORI: Record<IndicatoreId, { previsionale: string; reale: string }> = {
  // Indici finanziari ---------------------------------------------------------
  'indice-autonomia-finanziaria': { previsionale: '0,62', reale: '0,64' },
  'indice-autonomia-impositiva': { previsionale: '0,46', reale: '0,48' },
  'prelievo-tributario-pro-capite': { previsionale: '510,00', reale: '524,30' },
  'indice-autonomia-tariffaria-propria': { previsionale: '0,13', reale: '0,14' },
  'rigidita-spese-correnti': { previsionale: '0,67', reale: '0,69' },
  'incidenza-oneri-finanziari-spese-correnti': { previsionale: '0,025', reale: '0,028' },
  'percentuale-copertura-spese-correnti': { previsionale: '0,33', reale: '0,31' },
  'spese-correnti-pro-capite': { previsionale: '965,00', reale: '982,40' },
  'spese-conto-capitale-pro-capite': { previsionale: '210,00', reale: '178,60' },

  // Propensione spesa (quota su spese correnti) -------------------------------
  'propensione-spesa-sociale': { previsionale: '0,17', reale: '0,18' },
  'propensione-spesa-istruzione': { previsionale: '0,08', reale: '0,08' },
  'propensione-spesa-giovani': { previsionale: '0,012', reale: '0,011' },
  'propensione-spesa-ambiente': { previsionale: '0,12', reale: '0,12' },

  // Personale -----------------------------------------------------------------
  'incidenza-spesa-personale-spese-correnti': { previsionale: '0,28', reale: '0,28' },
  'spesa-personale-media': { previsionale: '34.500,00', reale: '34.820,00' },
  'rapporto-dipendenti-popolazione': { previsionale: '6,20', reale: '6,15' },
  'spesa-formazione-personale': { previsionale: '95,00', reale: '82,50' },

  // Digitalizzazione ----------------------------------------------------------
  'spesa-digitalizzazione-ente': { previsionale: '850.000,00', reale: '792.300,00' },
  'spesa-digitalizzazione-ente-pro-capite': { previsionale: '4,30', reale: '4,02' },

  // Demografia (valori per 1000 abitanti, eccetto crescita-naturale in %) -----
  'tasso-natalita': { previsionale: '6,0', reale: '5,8' },
  'tasso-mortalita': { previsionale: '11,0', reale: '11,2' },
  'saldo-naturale': { previsionale: '-5,0', reale: '-5,4' },
  'crescita-naturale': { previsionale: '-0,50', reale: '-0,54' },
  'saldo-migratorio': { previsionale: '-3,5', reale: '-3,8' },
  'saldo-popolazione': { previsionale: '-8,5', reale: '-9,2' },
};

function build(id: IndicatoreId): ResponseRisultato {
  const v = VALORI[id];
  return {
    anno: ANNO,
    valoreprevisionale: v.previsionale,
    valorereale: v.reale,
  };
}

export function createMockClient(): IndicatoriClient {
  return {
    async getIndicatore(id: IndicatoreId): Promise<ResponseRisultato> {
      return build(id);
    },
  };
}
