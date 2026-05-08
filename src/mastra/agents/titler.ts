import { Agent } from '@mastra/core/agent';

export const titlerAgent = new Agent({
  id: 'titler',
  name: 'Titler',
  model: 'anthropic/claude-haiku-4.5',
  instructions: `Sei un generatore di titoli per conversazioni di un assistente conversazionale italiano.

Riceverai il primo messaggio di una nuova conversazione. Il tuo compito è generare un titolo BREVE e DESCRITTIVO che riassuma l'intento dell'utente.

REGOLE:
- Massimo 6 parole
- In italiano
- Capitalizzazione naturale
- NO punteggiatura finale
- NO virgolette
- NO emoji
- Se il messaggio è generico, usa "Nuova richiesta"

Rispondi SOLO con il titolo, nient'altro.`,
});
