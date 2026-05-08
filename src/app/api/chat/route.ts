import { NextRequest } from 'next/server';
import { mastra } from '@/mastra';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, message } = body as { messages?: ChatMessage[]; message?: string };

  if (!message?.trim()) {
    return Response.json({ error: 'message is required' }, { status: 400 });
  }

  const history: ChatMessage[] = [
    ...((messages ?? []).filter((m) => m && m.role && m.content) as ChatMessage[]),
    { role: 'user', content: message.trim() },
  ];

  const agent = mastra.getAgent('assistente');

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      try {
        const result = await agent.stream(history, { maxSteps: 8 });

        let fullText = '';
        let postToolBreakPending = false;

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
            send({
              type: 'tool_result',
              tool_name: c.payload?.toolName,
              tool_call_id: c.payload?.toolCallId,
            });
          } else if (c.type === 'reasoning-delta') {
            const text = (c.payload?.text as string) || '';
            send({ type: 'reasoning', content: text });
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
