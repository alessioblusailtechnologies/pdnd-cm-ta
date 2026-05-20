import { createTool } from '@mastra/core/tools';
import { GetAccertamentiParams } from './_client/types';
import { getTributiClient } from './_client';

export const getAccertamenti = createTool({
  id: 'get-accertamenti',
  description: `Restituisce gli accertamenti (provvedimenti) dei tributi maggiori a carico del contribuente: omessi/insufficienti versamenti, stato, importi (totale, versato, residuo), data notifica, protocollo.
Usalo quando l'utente chiede gli accertamenti, le contestazioni, i provvedimenti sanzionatori, le posizioni in contenzioso.`,
  inputSchema: GetAccertamentiParams,
  execute: async (params) => {
    return getTributiClient().getAccertamenti(params);
  },
});
