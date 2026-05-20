import { createTool } from '@mastra/core/tools';
import { GetPosizioniTariParams } from './_client/types';
import { getTributiClient } from './_client';

export const getPosizioniTari = createTool({
  id: 'get-posizioni-tari',
  description: `Restituisce le posizioni TARI (occupazioni / utenze) del contribuente: utenza, superficie, destinazione d'uso, periodo di validità, abitazione principale, codice ATECO per le non domestiche.
Parametro mostraCessazioni (default true): se false esclude le utenze chiuse.
Usalo quando l'utente chiede le utenze TARI, le posizioni TARI, le superfici dichiarate, gli immobili soggetti a tassa rifiuti.`,
  inputSchema: GetPosizioniTariParams,
  execute: async (params) => {
    return getTributiClient().getPosizioniTari(params);
  },
});
