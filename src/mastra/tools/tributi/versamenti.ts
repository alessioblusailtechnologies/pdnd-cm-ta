import { createTool } from '@mastra/core/tools';
import { GetVersamentiParams } from './_client/types';
import { getTributiClient } from './_client';

export const getVersamenti = createTool({
  id: 'get-versamenti',
  description: `Restituisce i versamenti dei tributi maggiori effettuati dal contribuente: anno, modulo (IMU/TARI/...), codice tributo F24, data pagamento, importo, eventuali annullamenti o violazioni.
Filtrabile per anno e per imposta (enum: 1=ICI, 2=IMU, 3=TASI, 4=TARES, 5=TARI, 6=TARI giornaliera, 7=Altro).
Usalo quando l'utente chiede i pagamenti effettuati, lo storico versamenti, le ricevute F24, "quanto ho già pagato".`,
  inputSchema: GetVersamentiParams,
  execute: async (params) => {
    return getTributiClient().getVersamenti(params);
  },
});
