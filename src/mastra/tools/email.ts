import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Resend } from 'resend';
import { marked } from 'marked';
import { getFile } from '@/lib/file-store';

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY non configurata');
  return new Resend(key);
}

function buildHtml(bodyMarkdown: string): string {
  const inner = marked.parse(bodyMarkdown, { async: false }) as string;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #17324d; max-width: 600px; margin: 0 auto; padding: 24px; line-height: 1.6; }
    h1, h2, h3 { color: #00396e; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    th, td { border: 1px solid #e6ecf2; padding: 8px 12px; text-align: left; font-size: 14px; }
    th { background: #ebf2fa; color: #00396e; font-weight: 600; }
    a { color: #0066CC; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e6ecf2; font-size: 12px; color: #5c6f82; }
  </style>
</head>
<body>
  ${inner}
  <div class="footer">Inviato tramite PDMD-TA — Comune di Taranto</div>
</body>
</html>`;
}

export const inviaMail = createTool({
  id: 'invia-mail',
  description: `Invia una email a uno o più destinatari. Il corpo è in markdown e viene convertito in HTML formattato.
Puoi allegare uno o più file (PDF/Word/Excel) già generati passando i loro file_id ottenuti dai tool generaPdf/generaWord/generaExcel.
Usalo quando l'utente chiede di inviare una comunicazione, un documento o un report via mail.`,
  inputSchema: z.object({
    to: z.union([z.string(), z.array(z.string())]).describe('Email destinatario (singola o array)'),
    cc: z.array(z.string()).optional().describe('Email in copia (CC)'),
    subject: z.string().describe('Oggetto della email'),
    body_markdown: z.string().describe('Corpo del messaggio in markdown'),
    attachment_file_ids: z.array(z.string()).optional()
      .describe('Lista di file_id (da generaPdf/generaWord/generaExcel) da allegare alla mail'),
  }),
  outputSchema: z.object({
    sent: z.boolean(),
    message_id: z.string().optional(),
    to: z.array(z.string()),
    error: z.string().optional(),
  }),
  execute: async (input) => {
    const toArray = Array.isArray(input.to) ? input.to : [input.to];

    const attachments: { filename: string; content: Buffer }[] = [];
    if (input.attachment_file_ids?.length) {
      for (const fileId of input.attachment_file_ids) {
        const file = getFile(fileId);
        if (!file) {
          throw new Error(`Allegato non trovato: ${fileId}`);
        }
        attachments.push({ filename: file.filename, content: file.buffer });
      }
    }

    const resend = getResend();
    const from = process.env.RESEND_FROM || 'PDMD-TA <onboarding@resend.dev>';

    const result = await resend.emails.send({
      from,
      to: toArray,
      cc: input.cc,
      subject: input.subject,
      html: buildHtml(input.body_markdown),
      attachments: attachments.length > 0
        ? attachments.map((a) => ({ filename: a.filename, content: a.content }))
        : undefined,
    });

    if (result.error) {
      return {
        sent: false,
        to: toArray,
        error: result.error.message || 'Errore invio mail',
      };
    }

    return {
      sent: true,
      message_id: result.data?.id,
      to: toArray,
    };
  },
});
