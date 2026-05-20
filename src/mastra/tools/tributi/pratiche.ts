import { createTool } from '@mastra/core/tools';
import { GetPraticheParams } from './_client/types';
import { getTributiClient } from './_client';

export const getPratiche = createTool({
  id: 'get-pratiche',
  description: `Restituisce le pratiche dei tributi minori a carico del contribuente: Osap, ICP, CUP, accertamento imposta soggiorno, tributi vari.
Richiede tipoTributo OBBLIGATORIO (enum: 1=Osap, 2=ICP, 3=CUP, 4=Accertamento Imposta Soggiorno, 9=Tributi Vari).
Se l'utente chiede "tutte le pratiche" senza specificare il tipo, chiama questo tool una volta per ciascun tipo rilevante e aggrega i risultati.
Usalo quando l'utente chiede le pratiche dei tributi minori, occupazione suolo pubblico, pubblicità, passi carrabili, imposta soggiorno.`,
  inputSchema: GetPraticheParams,
  execute: async (params) => {
    return getTributiClient().getPratiche(params);
  },
});
