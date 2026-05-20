import { createTool } from '@mastra/core/tools';
import { GetTitolaritaCatastoParams } from './_client/types';
import { getTributiClient } from './_client';

export const getTitolaritaCatasto = createTool({
  id: 'get-titolarita-catasto',
  description: `Restituisce le titolarità catastali (immobili posseduti) del contribuente: fabbricati e terreni con dati catastali, rendita, superficie, percentuale di possesso e diritto.
Filtrabile per tipoImmobile: 1=Fabbricato, 2=Terreno.
Usalo quando l'utente chiede gli immobili posseduti, i dati catastali, fabbricati o terreni intestati al soggetto.`,
  inputSchema: GetTitolaritaCatastoParams,
  execute: async (params) => {
    return getTributiClient().getTitolaritaCatasto(params);
  },
});
