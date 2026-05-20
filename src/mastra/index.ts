import { Mastra } from '@mastra/core';
import { assistenteAgent } from './agents/assistente';
import { documentiAgent } from './agents/documenti';
import { indicatoriAgent } from './agents/indicatori';
import { titlerAgent } from './agents/titler';
import { tributiAgent } from './agents/tributi';
import { utilityAgent } from './agents/utility';

export const mastra = new Mastra({
  agents: {
    assistente: assistenteAgent,
    documenti: documentiAgent,
    titler: titlerAgent,
    tributi: tributiAgent,
    utility: utilityAgent,
    indicatori: indicatoriAgent,
  },
});
