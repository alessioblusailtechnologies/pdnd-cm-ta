import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import ExcelJS from 'exceljs';
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

export const generaExcel = createTool({
  id: 'genera-excel',
  description: `Genera un foglio Excel (.xlsx) con uno o più sheet a partire da dati strutturati.
Ogni sheet ha un nome, un set di colonne (header + key) e un array di righe.
Le righe sono oggetti dove le chiavi corrispondono alle key delle colonne.
Usalo quando l'utente chiede una tabella, un export dati, un riepilogo numerico o un foglio di calcolo.`,
  inputSchema: z.object({
    filename: z.string().optional().describe('Nome del file senza estensione'),
    sheets: z.array(z.object({
      name: z.string().describe('Nome del foglio (max 31 caratteri)'),
      columns: z.array(z.object({
        header: z.string().describe('Etichetta visibile della colonna'),
        key: z.string().describe('Chiave usata nei rows per questa colonna'),
        width: z.number().optional().describe('Larghezza colonna (default 18)'),
      })).min(1),
      rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])))
        .describe('Array di righe; ogni riga è un oggetto { key: valore }'),
    })).min(1).describe('Uno o più fogli da includere nel file'),
  }),
  outputSchema: z.object({
    file_id: z.string(),
    url: z.string(),
    filename: z.string(),
  }),
  execute: async (input) => {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Demo Platform';
    wb.created = new Date();

    for (const sheet of input.sheets) {
      const ws = wb.addWorksheet(sheet.name.slice(0, 31), {
        views: [{ state: 'frozen', ySplit: 1 }],
      });
      ws.columns = sheet.columns.map((c) => ({
        header: c.header,
        key: c.key,
        width: c.width ?? 18,
      }));

      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF00396E' },
        };
        cell.border = {
          bottom: { style: 'medium', color: { argb: 'FF0066CC' } },
        };
      });

      sheet.rows.forEach((row, idx) => {
        const r = ws.addRow(row as Record<string, string | number | boolean | null>);
        if (idx % 2 === 1) {
          r.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF5F9FC' },
            };
          });
        }
        r.alignment = { vertical: 'middle' };
      });
    }

    const arrayBuf = await wb.xlsx.writeBuffer();
    const buffer = Buffer.from(arrayBuf as ArrayBuffer);

    const baseName = input.filename || 'export';
    const filename = `${slugify(baseName) || 'export'}.xlsx`;

    const stored = storeFile({
      kind: 'excel',
      filename,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer,
    });

    return {
      file_id: stored.id,
      url: `/api/files/${stored.id}`,
      filename,
    };
  },
});
