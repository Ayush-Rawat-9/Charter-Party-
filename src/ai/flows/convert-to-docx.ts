'use server';

/**
 * Deterministic HTML → DOCX conversion to preserve on-screen formatting.
 * Replaces the AI prompt-based conversion which produced unreliable output.
 */

import { z } from 'genkit';
import htmlToDocx from 'html-to-docx';

const ConvertToDocxInputSchema = z.object({
  htmlContent: z.string().describe('The HTML content to convert.'),
});
export type ConvertToDocxInput = z.infer<typeof ConvertToDocxInputSchema>;

const ConvertToDocxOutputSchema = z.object({
  docxBase64: z
    .string()
    .describe('The DOCX file content as a base64 encoded string.'),
});
export type ConvertToDocxOutput = z.infer<typeof ConvertToDocxOutputSchema>;

function buildPrintableHtml(htmlContent: string): string {
  // Minimal HTML shell with styles mirroring the on-screen preview
  // (Times New Roman, 12pt, 1.6 line-height, reasonable margins)
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        @page { margin: 25mm; }
        body {
          font-family: "Times New Roman", Georgia, serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #1f2937;
        }
        h1, h2, h3, h4, h5, h6 { color: #0f172a; margin: 0 0 8pt 0; }
        h1 { font-size: 20pt; }
        h2 { font-size: 16pt; }
        h3 { font-size: 14pt; }
        p { margin: 0 0 10pt 0; }
        ul, ol { margin: 0 0 10pt 24pt; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #cbd5e1; padding: 6pt; }
      </style>
    </head>
    <body>${htmlContent}</body>
  </html>`;
}

export async function convertToDocx(
  input: ConvertToDocxInput
): Promise<ConvertToDocxOutput> {
  const html = buildPrintableHtml(input.htmlContent);
  const buffer = await htmlToDocx(html, null, {
    table: { row: { cantSplit: true } },
    footer: false,
    header: false,
    margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch margins in twips
  });
  const docxBase64 = Buffer.from(buffer).toString('base64');
  return { docxBase64 };
}
