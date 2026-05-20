import { createTool } from '@mastra/core/tools';
import { GetAvvisiPagamentoParams } from './_client/types';
import { getTributiClient } from './_client';

export const getAvvisiPagamento = createTool({
  id: 'get-avvisi-pagamento',
  description: `Restituisce gli avvisi di pagamento dei tributi maggiori (IMU, TARI) emessi a carico del contribuente.
Include lo stato (emesso/pagato/annullato), importi (totale, versato, residuo) e flag pagoPA.
Usalo quando l'utente chiede gli avvisi di pagamento, le bollette ancora aperte, lo storico delle emissioni.`,
  inputSchema: GetAvvisiPagamentoParams,
  execute: async (params) => {
    return getTributiClient().getAvvisiPagamento(params);
  },
});
