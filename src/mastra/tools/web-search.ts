import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const ricercaWeb = createTool({
  id: 'ricerca-web',
  description:
    'Esegue una ricerca sul web per ottenere informazioni aggiornate. Usalo quando servono fonti esterne, dati recenti, riferimenti normativi o quando l\'utente chiede esplicitamente di cercare online.',
  inputSchema: z.object({
    query: z.string().describe('Query di ricerca in linguaggio naturale'),
    max_results: z
      .number()
      .int()
      .min(1)
      .max(10)
      .default(5)
      .describe('Numero massimo di risultati da restituire (default 5)'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string(),
      }),
    ),
    answer: z.string().nullable(),
  }),
  execute: async (input) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error('TAVILY_API_KEY non configurata. Imposta la variabile d\'ambiente per abilitare la ricerca web.');
    }

    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: input.query,
        max_results: input.max_results ?? 5,
        include_answer: true,
        search_depth: 'basic',
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Errore ricerca web (${res.status}): ${text || res.statusText}`);
    }

    const data = (await res.json()) as {
      answer?: string | null;
      results?: Array<{ title?: string; url?: string; content?: string }>;
    };

    return {
      results: (data.results ?? []).map((r) => ({
        title: r.title ?? '',
        url: r.url ?? '',
        snippet: r.content ?? '',
      })),
      answer: data.answer ?? null,
    };
  },
});
