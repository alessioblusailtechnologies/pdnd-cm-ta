# PDMD-TA

Assistente conversazionale del Comune di Taranto. Frontend Next.js + backend AI con [Mastra](https://mastra.ai).

## Stack

- Next.js 16 (App Router) + React 19
- Mastra (`@mastra/core`) per agenti e tool AI
- HugeIcons per le icone
- SCSS modules per lo styling
- Palette: blu, rosso, bianco

## Tool AI disponibili

- **ricercaWeb** — ricerca sul web tramite Tavily

## Setup

1. Installa le dipendenze:
   ```bash
   npm install
   ```

2. Copia `.env.example` in `.env.local` e compila le chiavi:
   ```bash
   cp .env.example .env.local
   ```
   - `ANTHROPIC_API_KEY` per il modello Claude
   - `TAVILY_API_KEY` per la ricerca web (https://tavily.com)

3. Avvia il dev server:
   ```bash
   npm run dev
   ```

Apri [http://localhost:3000](http://localhost:3000).

## Struttura

```
src/
  app/
    api/chat/route.ts       # Endpoint streaming SSE
    layout.tsx
    page.tsx
    globals.scss
  components/
    chat/
      ChatView.tsx          # UI conversazionale
      MarkdownRenderer.tsx
      *.module.scss
  mastra/
    index.ts                # Mastra root
    agents/
      assistente.ts         # Agente principale
      titler.ts             # Generatore titoli conversazione
    tools/
      web-search.ts         # Tool Tavily
```
