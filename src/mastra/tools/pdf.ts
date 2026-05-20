import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { storeFile } from '@/lib/file-store';
import { PdfDocument } from '../pdf/PdfDocument';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export const generaPdf = createTool({
  id: 'genera-pdf',
  description: `Genera un documento PDF a partire da titolo e contenuto in markdown.
Il contenuto può includere headings (#, ##, ###), paragrafi, **grassetto**, *corsivo*, liste e tabelle markdown.
Il PDF viene salvato e ritorna un id riutilizzabile per allegarlo a una mail.
Usalo quando l'utente chiede di generare un documento, riepilogo, scheda, report, ecc.`,
  inputSchema: z.object({
    title: z.string().describe('Titolo del documento PDF'),
    subtitle: z.string().optional().describe('Sottotitolo opzionale'),
    content_markdown: z.string().describe('Contenuto del PDF in formato markdown'),
    meta: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).optional().describe('Coppie chiave-valore mostrate in alto a destra'),
    filename: z.string().optional().describe('Nome del file senza estensione'),
  }),
  outputSchema: z.object({
    file_id: z.string().describe('Identificativo del file (riusabile in inviaMail come attachment_file_ids)'),
    url: z.string().describe('URL interno del file. NON inserirlo nella risposta: l\'allegato viene già mostrato sotto il messaggio.'),
    filename: z.string(),
  }),
  execute: async (input) => {
    const element = React.createElement(PdfDocument, {
      title: input.title,
      subtitle: input.subtitle,
      contentMarkdown: input.content_markdown,
      meta: input.meta,
    });
    const buffer = await renderToBuffer(element);

    const baseName = input.filename || slugify(input.title) || 'documento';
    const filename = `${baseName}.pdf`;

    const stored = storeFile({
      kind: 'pdf',
      filename,
      contentType: 'application/pdf',
      buffer: buffer as Buffer,
    });

    return {
      file_id: stored.id,
      url: `/api/files/${stored.id}`,
      filename,
    };
  },
});
