import { Mastra } from '@mastra/core';
import { assistenteAgent } from './agents/assistente';
import { documentiAgent } from './agents/documenti';
import { titlerAgent } from './agents/titler';
import { tributiAgent } from './agents/tributi';

export const mastra = new Mastra({
  agents: {
    assistente: assistenteAgent,
    documenti: documentiAgent,
    titler: titlerAgent,
    tributi: tributiAgent,
  },
});
