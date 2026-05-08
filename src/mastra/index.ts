import { Mastra } from '@mastra/core';
import { assistenteAgent } from './agents/assistente';
import { titlerAgent } from './agents/titler';

export const mastra = new Mastra({
  agents: {
    assistente: assistenteAgent,
    titler: titlerAgent,
  },
});
