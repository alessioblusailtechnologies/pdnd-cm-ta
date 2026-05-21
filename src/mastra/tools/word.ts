import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import { marked, type Token, type Tokens } from 'marked';
import { storeFile } from '@/lib/file-store';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const NAVY = '00396E';
const TEXT = '17324D';
const MUTED = '5C6F82';
const BORDER = 'E6ECF2';

function inlineRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.slice(lastIndex, match.index), color: TEXT }));
    }
    if (match[2]) runs.push(new TextRun({ text: match[2], bold: true, color: TEXT }));
    else if (match[3]) runs.push(new TextRun({ text: match[3], italics: true, color: TEXT }));
    else if (match[4]) runs.push(new TextRun({ text: match[4], italics: true, color: NAVY }));
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) runs.push(new TextRun({ text: text.slice(lastIndex), color: TEXT }));
  return runs.length > 0 ? runs : [new TextRun({ text, color: TEXT })];
}

function headingLevel(depth: number): (typeof HeadingLevel)[keyof typeof HeadingLevel] {
  if (depth <= 1) return HeadingLevel.HEADING_1;
  if (depth === 2) return HeadingLevel.HEADING_2;
  return HeadingLevel.HEADING_3;
}

function tokenToBlocks(token: Token): (Paragraph | Table)[] {
  switch (token.type) {
    case 'heading': {
      const t = token as Tokens.Heading;
      return [
        new Paragraph({
          heading: headingLevel(t.depth),
          spacing: { before: 200, after: 120 },
          children: [new TextRun({ text: t.text, bold: true, color: NAVY })],
        }),
      ];
    }
    case 'paragraph': {
      const t = token as Tokens.Paragraph;
      return [
        new Paragraph({
          spacing: { after: 120 },
          children: inlineRuns(t.text),
        }),
      ];
    }
    case 'list': {
      const t = token as Tokens.List;
      return t.items.map((item, i) =>
        new Paragraph({
          spacing: { after: 60 },
          indent: { left: 360 },
          children: [
            new TextRun({ text: t.ordered ? `${i + 1}. ` : '• ', color: NAVY, bold: true }),
            ...inlineRuns(item.text),
          ],
        }),
      );
    }
    case 'table': {
      const t = token as Tokens.Table;
      const headerRow = new TableRow({
        tableHeader: true,
        children: t.header.map((cell) =>
          new TableCell({
            shading: { fill: 'EBF2FA' },
            children: [
              new Paragraph({
                children: [new TextRun({ text: cell.text, bold: true, color: NAVY })],
              }),
            ],
          }),
        ),
      });
      const bodyRows = t.rows.map((row) =>
        new TableRow({
          children: row.map((cell) =>
            new TableCell({
              children: [
                new Paragraph({ children: inlineRuns(cell.text) }),
              ],
            }),
          ),
        }),
      );
      return [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
            left: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
            right: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
            insideVertical: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
          },
          rows: [headerRow, ...bodyRows],
        }),
      ];
    }
    case 'hr':
      return [
        new Paragraph({
          spacing: { before: 80, after: 80 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER, space: 1 },
          },
          children: [],
        }),
      ];
    case 'space':
      return [new Paragraph({ children: [], spacing: { after: 60 } })];
    case 'blockquote': {
      const t = token as Tokens.Blockquote;
      const inner = (t.tokens ?? []).flatMap((tok) => tokenToBlocks(tok));
      return inner.map((b) =>
        b instanceof Paragraph
          ? new Paragraph({
              indent: { left: 360 },
              border: {
                left: { style: BorderStyle.SINGLE, size: 12, color: '0066CC', space: 8 },
              },
              children: (b as Paragraph & { options?: { children?: TextRun[] } }).options?.children ?? [],
            })
          : b,
      );
    }
    default:
      if ('text' in token && typeof token.text === 'string') {
        return [new Paragraph({ children: inlineRuns(token.text) })];
      }
      return [];
  }
}

export const generaWord = createTool({
  id: 'genera-word',
  description: `Genera un documento Word (.docx) a partire da titolo e contenuto in markdown.
Il contenuto può includere headings, paragrafi, **grassetto**, *corsivo*, liste e tabelle.
Usalo quando l'utente chiede di generare una lettera, una bozza editabile, un verbale o un documento da rivedere.`,
  inputSchema: z.object({
    title: z.string().describe('Titolo del documento Word'),
    subtitle: z.string().optional().describe('Sottotitolo opzionale'),
    content_markdown: z.string().describe('Contenuto del documento in formato markdown'),
    filename: z.string().optional().describe('Nome del file senza estensione'),
  }),
  outputSchema: z.object({
    file_id: z.string(),
    url: z.string(),
    filename: z.string(),
  }),
  execute: async (input) => {
    const tokens = marked.lexer(input.content_markdown);
    const today = new Date().toLocaleDateString('it-IT', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    const headerBlocks: Paragraph[] = [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text: 'Demo Platform', bold: true, color: NAVY, size: 28 }),
          new TextRun({ text: '   COMUNE DI TARANTO', color: MUTED, size: 14 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 240 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 12, color: NAVY, space: 4 },
        },
        children: [new TextRun({ text: today, color: MUTED, size: 16 })],
      }),
      new Paragraph({
        heading: HeadingLevel.TITLE,
        spacing: { before: 240, after: 80 },
        children: [new TextRun({ text: input.title, bold: true, color: '0A1F33', size: 40 })],
      }),
    ];

    if (input.subtitle) {
      headerBlocks.push(
        new Paragraph({
          spacing: { after: 240 },
          children: [new TextRun({ text: input.subtitle, color: MUTED, size: 22, italics: true })],
        }),
      );
    }

    const bodyBlocks = tokens.flatMap((t) => tokenToBlocks(t));

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [...headerBlocks, ...bodyBlocks],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    const baseName = input.filename || slugify(input.title) || 'documento';
    const filename = `${baseName}.docx`;

    const stored = storeFile({
      kind: 'word',
      filename,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: Buffer.from(buffer),
    });

    return {
      file_id: stored.id,
      url: `/api/files/${stored.id}`,
      filename,
    };
  },
});
