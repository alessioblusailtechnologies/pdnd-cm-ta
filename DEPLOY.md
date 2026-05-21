# Deploy su Render

L'app è un server Next.js (App Router, `next start`). Su Render si deploya come **Web Service**.

## Opzione A — Blueprint (consigliata)

1. Push del repo su GitHub/GitLab (assicurati che `render.yaml` sia incluso).
2. Su Render: **New +** → **Blueprint** → seleziona il repository.
3. Render legge `render.yaml` e propone il servizio `demo-platform`.
4. Alla prima creazione ti chiede i valori dei segreti (`sync: false`). Inseriscili (vedi sotto).
5. **Apply** → parte build + deploy.

## Opzione B — Setup manuale dalla dashboard

**New +** → **Web Service** → collega il repo, poi:

| Campo | Valore |
|---|---|
| Runtime | Node |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/` |

Poi aggiungi le variabili d'ambiente (sezione **Environment**).

## Variabili d'ambiente

| Variabile | Obbligatoria | Note |
|---|---|---|
| `NODE_VERSION` | sì | `22.16.0` (già in `render.yaml` / `.node-version`) |
| `ANTHROPIC_API_KEY` | sì | Chiave Anthropic (modelli Claude via Mastra) |
| `SUPABASE_URL` | sì | URL progetto Supabase (`https://<ref>.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | sì | Chiave service_role — solo server-side |
| `TAVILY_API_KEY` | per la ricerca web | Senza, il tool `ricercaWeb` fallisce |
| `RESEND_API_KEY` | per l'invio mail | Senza, il tool `inviaMail` fallisce |
| `RESEND_FROM` | per l'invio mail | Es. `Demo Platform <onboarding@resend.dev>` |
| `TRIBUTI_API_MODE` | sì | `mock` in demo |
| `INDICATORI_API_MODE` | sì | `mock` in demo |

> I valori reali sono nel `.env.local` (non versionato). Copiali nella dashboard di Render.

## Prerequisiti Supabase

Prima del primo avvio esegui la migrazione `supabase/migrations/0001_chats.sql`
nello SQL Editor del progetto Supabase (crea le tabelle `cmta_chats` e `cmta_messages`).

## Note operative

- **Piano**: `starter` (sempre attivo, niente sleep). Modificabile in `render.yaml` (`plan:`).
- **Allegati generati** (PDF/Word/Excel) sono in memoria con TTL 24h: a un riavvio del servizio (deploy/restart) i link `/api/files/...` non sono più validi. Per la demo è accettabile; per produzione serve uno storage persistente (es. Supabase Storage).
- `next start` lega automaticamente la porta fornita da Render via `PORT`.
- Mock attivi: i servizi tributi/indicatori rispondono con dati fittizi. Per puntare alle API PDND reali imposta `TRIBUTI_API_MODE=real` / `INDICATORI_API_MODE=real` e le rispettive `*_API_BASE_URL` / `*_API_TOKEN`.
