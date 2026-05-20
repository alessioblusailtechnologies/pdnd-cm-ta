import { NextRequest } from 'next/server';
import { mastra } from '@/mastra';
import { getServerSupabase, TABLES } from '@/lib/supabase';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type AttachmentKind = 'pdf' | 'word' | 'excel';

interface Attachment {
  kind: AttachmentKind;
  filename: string;
  url: string;
  file_id: string;
}

const TOOL_TO_KIND: Record<string, AttachmentKind> = {
  generaPdf: 'pdf',
  generaWord: 'word',
  generaExcel: 'excel',
};

interface DocToolResult {
  file_id?: unknown;
  filename?: unknown;
  url?: unknown;
}

function extractAttachment(toolName: string, result: unknown): Attachment | null {
  const kind = TOOL_TO_KIND[toolName];
  if (!kind) return null;
  const r = result as DocToolResult | null | undefined;
  if (!r || typeof r.file_id !== 'string' || typeof r.filename !== 'string' || typeof r.url !== 'string') {
    return null;
  }
  return { kind, file_id: r.file_id, filename: r.filename, url: r.url };
}

interface SubAgentToolResult {
  toolName?: unknown;
  result?: unknown;
}

function extractSubAgentAttachments(result: unknown): Attachment[] {
  const r = result as { subAgentToolResults?: unknown } | null | undefined;
  const list = r?.subAgentToolResults;
  if (!Array.isArray(list)) return [];
  const attachments: Attachment[] = [];
  for (const item of list as SubAgentToolResult[]) {
    if (typeof item?.toolName !== 'string') continue;
    const a = extractAttachment(item.toolName, item.result);
    if (a) attachments.push(a);
  }
  return attachments;
}

async function generateTitle(firstMessage: string): Promise<string | null> {
  try {
    const titler = mastra.getAgent('titler');
    if (!titler) return null;
    const result = await titler.generate([{ role: 'user', content: firstMessage }]);
    const text = (result as { text?: unknown }).text;
    if (typeof text !== 'string') return null;
    return text.trim().replace(/^["']|["']$/g, '').slice(0, 120) || null;
  } catch (err) {
    console.error('[titler] generazione titolo fallita:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    messages,
    message,
    chat_id: chatId,
  } = body as { messages?: ChatMessage[]; message?: string; chat_id?: string };

  if (!message?.trim()) {
    return Response.json({ error: 'message is required' }, { status: 400 });
  }
  if (!chatId) {
    return Response.json({ error: 'chat_id is required' }, { status: 400 });
  }

  const userContent = message.trim();
  const history: ChatMessage[] = [
    ...((messages ?? []).filter((m) => m && m.role && m.content) as ChatMessage[]),
    { role: 'user', content: userContent },
  ];

  const supabase = getServerSupabase();

  // Persisti il messaggio utente prima di iniziare lo stream. Bloccante per
  // evitare race condition con eventuali letture (navigazione, refresh)
  // mentre lo stream è ancora in corso.
  const { error: insertUserErr } = await supabase
    .from(TABLES.messages)
    .insert({ chat_id: chatId, role: 'user', content: userContent });
  if (insertUserErr) {
    console.error('[chat] insert user msg fallito:', insertUserErr);
  }

  // Se è il primo messaggio della chat, avvia la generazione titolo in
  // parallelo allo stream. Il titolo verrà emesso nello stream quando pronto
  // ed aggiornato anche su DB.
  const isFirstMessage = (messages?.length ?? 0) === 0;
  let titlePromise: Promise<string | null> | null = null;
  if (isFirstMessage) {
    titlePromise = generateTitle(userContent).then(async (title) => {
      if (!title) return null;
      await supabase.from(TABLES.chats).update({ title }).eq('id', chatId);
      return title;
    });
  }

  const agent = mastra.getAgent('assistente');

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      try {
        const result = await agent.stream(history, { maxSteps: 10 });

        let fullText = '';
        let postToolBreakPending = false;
        const collectedAttachments: Attachment[] = [];

        for await (const chunk of result.fullStream) {
          const c = chunk as { type: string; payload?: Record<string, unknown> };

          if (c.type === 'text-delta') {
            let text = (c.payload?.text as string) || '';
            if (postToolBreakPending && text.length > 0) {
              postToolBreakPending = false;
              if (fullText.length > 0) {
                const tailNewlines = (fullText.match(/\n*$/)?.[0] || '').length;
                const headNewlines = (text.match(/^\n*/)?.[0] || '').length;
                const missing = 2 - (tailNewlines + headNewlines);
                if (missing > 0) text = '\n'.repeat(missing) + text;
              }
            }
            fullText += text;
            send({ type: 'text', content: text });
          } else if (c.type === 'tool-call') {
            postToolBreakPending = true;
            send({
              type: 'tool_call',
              tool_name: c.payload?.toolName,
              tool_call_id: c.payload?.toolCallId,
            });
          } else if (c.type === 'tool-result') {
            postToolBreakPending = true;
            const toolName = c.payload?.toolName as string;
            const result = c.payload?.result;

            const direct = extractAttachment(toolName, result);
            if (direct) {
              collectedAttachments.push(direct);
              send({ type: 'attachment', attachment: direct });
            }

            if (toolName?.startsWith('agent-')) {
              for (const a of extractSubAgentAttachments(result)) {
                collectedAttachments.push(a);
                send({ type: 'attachment', attachment: a });
              }
            }

            send({
              type: 'tool_result',
              tool_name: toolName,
              tool_call_id: c.payload?.toolCallId,
            });
          } else if (c.type === 'reasoning-delta') {
            const text = (c.payload?.text as string) || '';
            send({ type: 'reasoning', content: text });
          }
        }

        // Persisti il messaggio assistant a fine stream. Awaitato per
        // garantire che il messaggio sia in DB prima che il client emetta
        // l'eventuale navigazione post-stream (vedi ChatView).
        const { error: insertAsstErr } = await supabase.from(TABLES.messages).insert({
          chat_id: chatId,
          role: 'assistant',
          content: fullText,
          attachments: collectedAttachments.length > 0 ? collectedAttachments : null,
        });
        if (insertAsstErr) {
          console.error('[chat] insert assistant msg fallito:', insertAsstErr);
        }

        // Se stiamo aspettando il titolo, emettilo prima del done.
        if (titlePromise) {
          const title = await titlePromise;
          if (title) {
            send({ type: 'title', title });
          }
        }

        send({ type: 'done' });
        controller.close();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Errore durante la generazione della risposta';
        send({ type: 'error', content: errorMsg });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
