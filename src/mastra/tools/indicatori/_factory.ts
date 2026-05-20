import { createTool } from '@mastra/core/tools';
import { getIndicatoriClient } from './_client';
import { GetIndicatoreParams, type IndicatoreId } from './_client/types';

// Helper per creare tool indicatori senza ripetere il boilerplate.
// Tutti i 25 endpoint hanno la stessa firma — cambia solo l'id e la
// descrizione semantica esposta al modello.
export function createIndicatoreTool(args: {
  id: string;
  indicatore: IndicatoreId;
  description: string;
}) {
  return createTool({
    id: args.id,
    description: args.description,
    inputSchema: GetIndicatoreParams,
    execute: async () => {
      return getIndicatoriClient().getIndicatore(args.indicatore);
    },
  });
}
