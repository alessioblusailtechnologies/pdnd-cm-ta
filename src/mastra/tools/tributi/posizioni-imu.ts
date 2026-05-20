import { createTool } from '@mastra/core/tools';
import { GetPosizioniImuParams } from './_client/types';
import { getTributiClient } from './_client';

export const getPosizioniImu = createTool({
  id: 'get-posizioni-imu',
  description: `Restituisce le posizioni IMU (titolarità di possesso) del contribuente: scheda, rendita, percentuale di possesso, categoria catastale, aliquota applicata, periodo di validità, eventuale stato di inagibilità.
Parametro mostraCessazioni (default true): se false esclude le titolarità chiuse.
Usalo quando l'utente chiede le posizioni IMU, le schede IMU, gli immobili soggetti a IMU, le aliquote applicate.`,
  inputSchema: GetPosizioniImuParams,
  execute: async (params) => {
    return getTributiClient().getPosizioniImu(params);
  },
});
